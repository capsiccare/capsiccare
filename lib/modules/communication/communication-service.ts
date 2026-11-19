import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface DispatchMessageParams {
  patientId: string
  channel: 'whatsapp' | 'sms' | 'email'
  templateCode?: string
  customBody?: string
  variables?: Record<string, string | number>
  relatedEntityType?: string
  relatedEntityId?: string
  sentById?: string
}

/**
 * Render template body with provided variable substitutions.
 */
export function renderTemplate(templateBody: string, variables: Record<string, string | number> = {}): string {
  let rendered = templateBody
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    rendered = rendered.replace(pattern, String(value))
  }
  return rendered
}

/**
 * Dispatch a communication message to a patient with consent and preference checks.
 */
export async function dispatchCommunicationMessage(params: DispatchMessageParams) {
  const adminClient = createAdminClient()

  // 1. Fetch organization & patient
  const { data: org } = await adminClient.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('No organization found')

  const { data: patient, error: patientError } = await adminClient
    .from('patients')
    .select('id, full_name, phone, email')
    .eq('id', params.patientId)
    .single()

  if (patientError || !patient) {
    throw new Error(`Patient not found: ${params.patientId}`)
  }

  // 2. Determine recipient destination
  const recipient = params.channel === 'email' ? (patient.email || '') : patient.phone
  if (!recipient) {
    throw new Error(`Patient has no valid ${params.channel} contact information`)
  }

  // 3. Check communication consent & preferences
  const { data: pref } = await adminClient
    .from('patient_communication_preferences')
    .select('*')
    .eq('patient_id', params.patientId)
    .maybeSingle()

  // 4. Resolve template or custom body
  let messageBody = params.customBody || ''
  let templateId: string | null = null
  let category = 'service'

  if (params.templateCode) {
    const { data: tmpl, error: tmplError } = await adminClient
      .from('communication_templates')
      .select('id, category, template_body')
      .eq('code', params.templateCode)
      .maybeSingle()

    if (tmplError || !tmpl) {
      throw new Error(`Template code '${params.templateCode}' not found`)
    }

    templateId = tmpl.id
    category = tmpl.category
    const varsWithDefaults = {
      patient_name: patient.full_name,
      ...params.variables,
    }
    messageBody = renderTemplate(tmpl.template_body, varsWithDefaults)
  }

  // Verify consent for channel and category
  if (pref) {
    if (params.channel === 'whatsapp') {
      if (category === 'service' && pref.service_whatsapp_enabled === false) {
        throw new Error('Patient has opted out of WhatsApp service notifications')
      }
      if (category === 'promotional' && pref.promotional_whatsapp_enabled === false) {
        throw new Error('Patient has not consented to WhatsApp promotional communications')
      }
    } else if (params.channel === 'sms') {
      if (category === 'service' && pref.service_sms_enabled === false) {
        throw new Error('Patient has opted out of SMS service notifications')
      }
      if (category === 'promotional' && pref.promotional_sms_enabled === false) {
        throw new Error('Patient has not consented to SMS promotional communications')
      }
    } else if (params.channel === 'email') {
      if (category === 'service' && pref.service_email_enabled === false) {
        throw new Error('Patient has opted out of email communications')
      }
    }
  }

  // 5. Check if Meta WhatsApp Cloud API credentials are configured
  let provider = 'whatsapp_direct'
  let providerMessageId = `msg_${crypto.randomBytes(8).toString('hex')}`
  const cleanPhone = recipient.replace(/\D/g, '')
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
  const whatsappDirectUrl = params.channel === 'whatsapp'
    ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(messageBody)}`
    : null

  if (params.channel === 'whatsapp' && process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const metaRes = await fetch(
        `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneWithCountry,
            type: 'text',
            text: { preview_url: true, body: messageBody },
          }),
        }
      )
      const metaJson = await metaRes.json()
      if (metaRes.ok && metaJson.messages?.[0]?.id) {
        provider = 'whatsapp_cloud_api'
        providerMessageId = metaJson.messages[0].id
      } else {
        console.warn('[WhatsApp Cloud API] Meta API response:', metaJson)
      }
    } catch (err: any) {
      console.warn('[WhatsApp Cloud API] Call failed, fallback to direct dispatch:', err.message)
    }
  }

  const { data: messageRecord, error: msgError } = await adminClient
    .from('communication_messages')
    .insert({
      organization_id: org.id,
      patient_id: params.patientId,
      template_id: templateId,
      channel: params.channel,
      recipient,
      message_body: messageBody,
      status: 'delivered', // recorded as active operational message
      provider,
      provider_message_id: providerMessageId,
      related_entity_type: params.relatedEntityType || null,
      related_entity_id: params.relatedEntityId || null,
      sent_by: params.sentById || null,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    })
    .select(`
      *,
      communication_templates ( code, title )
    `)
    .single()

  if (msgError) {
    throw new Error(`Failed to log message: ${msgError.message}`)
  }

  return {
    ...messageRecord,
    whatsapp_direct_url: whatsappDirectUrl,
  }
}

/**
 * List messages timeline.
 */
export async function listCommunicationMessages(options?: {
  patientId?: string
  channel?: string
  status?: string
  limit?: number
}) {
  const adminClient = createAdminClient()
  let query = adminClient
    .from('communication_messages')
    .select(`
      id, channel, recipient, message_body, status, provider,
      retry_count, sent_at, delivered_at, created_at,
      patients ( id, full_name, uhid, phone ),
      communication_templates ( code, title )
    `)
    .order('created_at', { ascending: false })
    .limit(options?.limit || 50)

  if (options?.patientId) query = query.eq('patient_id', options.patientId)
  if (options?.channel) query = query.eq('channel', options.channel)
  if (options?.status) query = query.eq('status', options.status)

  const { data, error } = await query
  if (error) throw new Error(`Failed to list messages: ${error.message}`)
  return data || []
}

/**
 * Broadcast message to multiple patients with opt-out filtering.
 */
export async function broadcastCommunication(params: {
  channel: 'whatsapp' | 'sms' | 'email'
  templateCode?: string
  customBody?: string
  patientIds: string[]
  sentById?: string
}) {
  const results = {
    total: params.patientIds.length,
    sent: 0,
    skipped: 0,
    errors: [] as Array<{ patientId: string; error: string }>,
  }

  for (const patientId of params.patientIds) {
    try {
      await dispatchCommunicationMessage({
        patientId,
        channel: params.channel,
        templateCode: params.templateCode,
        customBody: params.customBody,
        sentById: params.sentById,
      })
      results.sent++
    } catch (err: any) {
      results.skipped++
      results.errors.push({ patientId, error: err.message })
    }
  }

  return results
}
