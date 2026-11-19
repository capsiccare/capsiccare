import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/modules/auth/auth-service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')
    const supabase = await createServerSupabaseClient()

    // 1. Core Patient Count
    let patientsQuery = supabase.from('patients').select('id', { count: 'exact', head: true }).eq('is_active', true)
    if (branchId && branchId !== 'all') {
      patientsQuery = patientsQuery.eq('primary_branch_id', branchId)
    }
    const { count: patientCount } = await patientsQuery

    // 2. Core Doctor Count
    const { count: doctorCount } = await supabase.from('doctors').select('id', { count: 'exact', head: true }).eq('is_active', true)

    // 3. Appointments KPIs
    let aptQuery = supabase.from('appointments').select('id, fee_paise, status, scheduled_date')
    if (branchId && branchId !== 'all') {
      aptQuery = aptQuery.eq('branch_id', branchId)
    }
    const { data: appointments } = await aptQuery

    const allApts = appointments || []
    const todayStr = new Date().toISOString().split('T')[0]

    const todayApts = allApts.filter((a) => a.scheduled_date === todayStr)
    const completedApts = allApts.filter((a) => a.status === 'completed')
    const pendingApts = allApts.filter((a) => a.status === 'scheduled' || a.status === 'confirmed')

    // Revenue in integer paise from completed consultations
    const aptRevenuePaise = completedApts.reduce((sum, a) => sum + (a.fee_paise || 0), 0)

    // 4. Diagnostic Orders KPIs
    let orderQuery = supabase.from('diagnostic_orders').select('id, total_paise, status, payment_status, fulfillment_type')
    if (branchId && branchId !== 'all') {
      orderQuery = orderQuery.eq('branch_id', branchId)
    }
    const { data: orders } = await orderQuery

    const allOrders = orders || []
    const paidOrders = allOrders.filter((o) => o.payment_status === 'paid')
    const pendingOrders = allOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
    const orderRevenuePaise = paidOrders.reduce((sum, o) => sum + (o.total_paise || 0), 0)

    const totalRevenuePaise = aptRevenuePaise + orderRevenuePaise

    // 5. Today's Doctor Schedules
    const currentDayOfWeek = new Date().getDay()
    let schedulesQuery = supabase
      .from('doctor_schedules')
      .select(`
        id, day_of_week, start_time, end_time, consultation_type,
        doctors ( id, name, specialty, code ),
        branches ( id, name, code )
      `)
      .eq('is_active', true)
      .eq('day_of_week', currentDayOfWeek)
      .limit(6)

    if (branchId && branchId !== 'all') {
      schedulesQuery = schedulesQuery.eq('branch_id', branchId)
    }
    const { data: activeSchedules } = await schedulesQuery

    // 6. Recent Appointments list
    let recentAptsQuery = supabase
      .from('appointments')
      .select(`
        id, appointment_number, consultation_type, scheduled_date, start_time, status, fee_paise,
        patients ( full_name, uhid, phone ),
        doctors ( name, specialty )
      `)
      .order('scheduled_date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(5)

    if (branchId && branchId !== 'all') {
      recentAptsQuery = recentAptsQuery.eq('branch_id', branchId)
    }
    const { data: recentAppointments } = await recentAptsQuery

    // 7. Recent Diagnostic Orders list
    let recentOrdersQuery = supabase
      .from('diagnostic_orders')
      .select(`
        id, order_number, status, fulfillment_type, total_paise, payment_status, created_at,
        patients ( full_name, uhid, phone )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (branchId && branchId !== 'all') {
      recentOrdersQuery = recentOrdersQuery.eq('branch_id', branchId)
    }
    const { data: recentOrders } = await recentOrdersQuery

    // 8. Recent Audit Logs
    const { data: recentAudit } = await supabase
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    const dashboardData = {
      kpis: {
        todayAppointments: todayApts.length,
        completedConsultations: completedApts.length,
        pendingAppointments: pendingApts.length,
        registeredPatients: patientCount || 0,
        activeDoctors: doctorCount || 0,
        diagnosticOrders: allOrders.length,
        pendingDiagnosticOrders: pendingOrders.length,
        revenueCollectedPaise: totalRevenuePaise,
        revenueCollectedInr: Math.round(totalRevenuePaise / 100),
        followUpTasks: null, // Clearly marked unavailable until Step 08 CareFlow
      },
      doctorSchedules: (activeSchedules || []).map((s: any) => ({
        id: s.id,
        doctorName: s.doctors?.name || 'Unknown Doctor',
        specialty: s.doctors?.specialty || 'General',
        startTime: s.start_time,
        endTime: s.end_time,
        type: s.consultation_type,
        branchName: s.branches?.name || 'Clinic',
      })),
      recentAppointments: (recentAppointments || []).map((a: any) => ({
        id: a.id,
        appointmentNumber: a.appointment_number,
        patientName: a.patients?.full_name || 'Walk-in Patient',
        patientUhid: a.patients?.uhid || '-',
        doctorName: a.doctors?.name || 'Consultant',
        scheduledDate: a.scheduled_date,
        startTime: a.start_time,
        status: a.status,
        feePaise: a.fee_paise,
      })),
      recentOrders: (recentOrders || []).map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        patientName: o.patients?.full_name || 'Walk-in Patient',
        patientUhid: o.patients?.uhid || '-',
        status: o.status,
        fulfillmentType: o.fulfillment_type,
        totalPaise: o.total_paise,
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
      })),
      recentActivity: (recentAudit || []).map((l: any) => ({
        id: l.id,
        action: l.action,
        entityType: l.entity_type,
        createdAt: l.created_at,
      })),
    }

    return successResponse(dashboardData, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
