import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth, requireAnyRole } from '@/lib/modules/auth/auth-service'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const templateSchema = z.object({
  code: z.string().min(2),
  category: z.enum(['service', 'transactional', 'promotional', 'emergency']).default('service'),
  channel: z.enum(['whatsapp', 'sms', 'email']),
  language: z.string().default('en'),
  title: z.string().min(2),
  template_body: z.string().min(5),
  variables: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const adminClient = createAdminClient()
    const { data: templates, error } = await adminClient
      .from('communication_templates')
      .select('*')
      .order('code', { ascending: true })

    if (error) throw new Error(error.message)

    return successResponse({ templates: templates || [], total: templates?.length || 0 }, undefined, 200, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAnyRole(['super_admin', 'org_admin', 'branch_admin'])
    const body = await req.json()
    const validated = templateSchema.parse(body)
    const adminClient = createAdminClient()

    const { data: tmpl, error } = await adminClient
      .from('communication_templates')
      .upsert(
        {
          code: validated.code.toUpperCase(),
          category: validated.category,
          channel: validated.channel,
          language: validated.language,
          title: validated.title,
          template_body: validated.template_body,
          variables: validated.variables,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'code' }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    return successResponse(tmpl, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
