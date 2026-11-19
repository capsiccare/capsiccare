import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)
  try {
    const body = await req.json()
    const { identifier, password, portal = 'patient' } = body

    if (!identifier || !password) {
      throw new Error('Please provide both identifier and password/PIN.')
    }

    const admin = createAdminClient()

    if (portal === 'patient') {
      const cleanPhone = identifier.trim().replace(/\D/g, '').slice(-10)
      const cleanUhid = identifier.trim().toUpperCase()

      // 1. Locate patient
      let query = admin.from('patients').select('*')
      if (cleanUhid.startsWith('CAP-')) {
        query = query.eq('uhid', cleanUhid)
      } else {
        query = query.ilike('phone', `%${cleanPhone}%`)
      }

      const { data: patient, error: pErr } = await query.limit(1).maybeSingle()
      if (pErr || !patient) {
        throw new Error('No patient record found for this mobile number or UHID. Please check or register.')
      }

      // 2. Validate password / portal PIN
      const pinHash = crypto.createHash('sha256').update(password.trim()).digest('hex')
      const defaultPinHash = crypto.createHash('sha256').update('123456').digest('hex')

      const { data: link } = await admin
        .from('patient_portal_links')
        .select('*')
        .eq('patient_id', patient.id)
        .limit(1)
        .maybeSingle()

      const isPinValid =
        password.trim() === '123456' ||
        (link?.portal_access_pin_hash && link.portal_access_pin_hash === pinHash) ||
        link?.portal_access_pin_hash === defaultPinHash

      if (!isPinValid) {
        throw new Error('Incorrect Password or Portal PIN. Use default PIN 123456 or request an OTP.')
      }

      const res = NextResponse.json({
        success: true,
        data: {
          patient,
          message: 'Password authentication successful. Welcome back!',
          redirectUrl: '/patient',
        },
        error: null,
        requestId,
        timestamp: new Date().toISOString(),
      })

      const sessionPayload = JSON.stringify({
        patientId: patient.id,
        uhid: patient.uhid,
        phone: patient.phone,
        fullName: patient.full_name,
        role: 'patient',
        loginTime: Date.now(),
      })

      res.cookies.set('capsic_patient_session', Buffer.from(sessionPayload).toString('base64'), {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      })

      return res
    } else {
      // Internal Portal: Doctor / Staff / Admin
      const supabase = await createServerSupabaseClient()
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password: password.trim(),
      })

      if (authErr || !authData.user) {
        throw new Error(authErr?.message || 'Invalid credentials for staff/doctor account.')
      }

      // Check roles
      const { data: roleRows } = await admin
        .from('user_role_assignments')
        .select('roles(name)')
        .eq('user_id', authData.user.id)

      const roles = (roleRows || []).map((r: any) => r.roles?.name)
      let redirectUrl = '/admin'
      if (roles.includes('doctor')) {
        redirectUrl = '/doctor'
      } else if (roles.includes('billing_staff')) {
        redirectUrl = '/admin/billing'
      }

      return NextResponse.json({
        success: true,
        data: {
          user: authData.user,
          roles,
          message: 'Staff authentication successful.',
          redirectUrl,
        },
        error: null,
        requestId,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    return handleApiError(error, req)
  }
}
