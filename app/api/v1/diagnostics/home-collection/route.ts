import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')?.trim()
    const status = searchParams.get('status')?.trim()
    const date = searchParams.get('date')?.trim()
    const phlebotomistId = searchParams.get('phlebotomistId')?.trim()

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('diagnostic_orders')
      .select(`
        id, order_number, branch_id, patient_id, status,
        collection_address, collection_landmark, collection_pincode,
        scheduled_collection_date, scheduled_slot, assigned_phlebotomist_id,
        subtotal_paise, collection_fee_paise, total_paise, payment_status,
        special_instructions, created_at,
        patients ( id, full_name, uhid, phone ),
        branches ( id, name, code, phone ),
        diagnostic_order_items ( id, item_name, item_type, final_price_paise, status )
      `)
      .eq('fulfillment_type', 'home_collection')
      .order('scheduled_collection_date', { ascending: true })
      .order('created_at', { ascending: false })

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (date) {
      query = query.eq('scheduled_collection_date', date)
    }

    if (phlebotomistId && phlebotomistId !== 'all') {
      query = query.eq('assigned_phlebotomist_id', phlebotomistId)
    }

    const { data: collections, error } = await query

    if (error) {
      throw new ApiError('DATABASE_ERROR', `Failed to query home collections: ${error.message}`, 500)
    }

    const items = (collections || []).map((c: any) => ({
      id: c.id,
      orderNumber: c.order_number,
      branchId: c.branch_id,
      branchName: c.branches?.name || 'Clinic',
      patientId: c.patient_id,
      patientName: c.patients?.full_name || 'Patient',
      patientUhid: c.patients?.uhid || '-',
      patientPhone: c.patients?.phone || '-',
      status: c.status,
      address: c.collection_address || 'Address on record',
      landmark: c.collection_landmark,
      pincode: c.collection_pincode,
      scheduledDate: c.scheduled_collection_date,
      scheduledSlot: c.scheduled_slot || 'Morning (07:00 - 09:00)',
      assignedPhlebotomistId: c.assigned_phlebotomist_id,
      totalInr: Math.round(c.total_paise / 100),
      collectionFeeInr: Math.round(c.collection_fee_paise / 100),
      paymentStatus: c.payment_status,
      specialInstructions: c.special_instructions,
      itemsCount: c.diagnostic_order_items?.length || 0,
      tests: (c.diagnostic_order_items || []).map((it: any) => it.item_name),
    }))

    return successResponse(items, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
