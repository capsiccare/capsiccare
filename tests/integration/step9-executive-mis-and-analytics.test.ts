import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createAdminClient } from '../../lib/supabase/admin'
import {
  getExecutiveCommandCenterMetrics,
  getRevenueAndProfitabilityAnalytics,
  getDoctorProductivityMatrix,
  getOpdOperationsAnalytics,
  getDiagnosticBiAndTat,
  getOpdToDiagnosticFunnel,
  getFinancialMisAndAging,
  getMultiBranchAnalytics,
  getBusinessTargets,
  createBusinessTarget,
  getDecisionAlerts,
  resolveDecisionAlert,
  getExecutiveDailyBriefing,
  listCustomReportTemplates,
  generateReportExport,
  getDataQualityAudit,
  getMetricDictionary,
} from '../../lib/modules/analytics/analytics-service'

describe('Step 09: Enterprise Executive MIS, Healthcare Business Intelligence & Decision Analytics', () => {
  const admin = createAdminClient()
  const branchId = '22222222-2222-4222-a222-222222222222'

  let testTargetId: string
  let testAlertId: string
  let testExportJobId: string

  it('1. Database Tables: should verify all Step 09 tables exist in PostgreSQL', async () => {
    const tables = [
      'business_targets',
      'operating_expenses',
      'decision_alerts',
      'custom_report_templates',
      'report_export_jobs',
    ]

    for (const table of tables) {
      const { error } = await admin.from(table).select('id').limit(1)
      assert.ok(!error, `Table ${table} should exist without error: ${error?.message}`)
    }
  })

  it('2. Executive Command Center: should compute core operational metrics and period comparisons', async () => {
    const metrics = await getExecutiveCommandCenterMetrics({
      branchId,
      timeframe: 'current_month',
    })

    assert.ok(metrics.dataFreshness, 'Should have timestamp')
    assert.ok(typeof metrics.billedRevenue?.current === 'number', 'Billed revenue must be numeric')
    assert.ok(typeof metrics.collectedPayments?.current === 'number', 'Collected payments must be numeric')
    assert.ok(typeof metrics.outstandingReceivables === 'number', 'Outstanding must be numeric')
    assert.ok(typeof metrics.doctorUtilization === 'number', 'Doctor utilization must be numeric')
    assert.ok(metrics.cashReconciliation !== undefined, 'Cash reconciliation must be present')
  })

  it('3. Revenue, Cost & Profitability Analytics: should compute accounting waterfall and margins', async () => {
    const rev = await getRevenueAndProfitabilityAnalytics({
      branchId,
      timeframe: 'current_month',
    })

    assert.ok(typeof rev.grossInvoicedAmount === 'number', 'Gross invoiced must be numeric')
    assert.ok(typeof rev.netInvoicedValue === 'number', 'Net invoiced value must be numeric')
    assert.ok(typeof rev.paymentsReceived === 'number', 'Payments received must be numeric')
    assert.ok(rev.serviceBreakdown !== undefined, 'Service breakdown must exist')
    assert.ok(rev.paymentMethods !== undefined, 'Payment methods split must exist')

    // Cost disclosure & transparency
    assert.ok(typeof rev.costAndMargin?.hasCostData === 'boolean', 'hasCostData flag must be boolean')
    assert.ok(typeof rev.costAndMargin?.totalOperatingExpenses === 'number', 'Expenses must be numeric')
  })

  it('4. Doctor Productivity Matrix: should calculate volume, utilization and satisfaction', async () => {
    const docData = await getDoctorProductivityMatrix({
      branchId,
      timeframe: 'last_30_days',
    })

    assert.ok(Array.isArray(docData.doctorMetrics), 'Doctor metrics should be an array')
    assert.ok(docData.totalDoctorsEvaluated > 0, 'Should evaluate at least 1 doctor')

    const firstDoc = docData.doctorMetrics[0]
    assert.ok(firstDoc.name, 'Doctor must have name')
    assert.ok(typeof firstDoc.appointmentsBooked === 'number', 'Booked appointments must be numeric')
    assert.ok(typeof firstDoc.utilizationRate === 'number', 'Utilization rate must be numeric')
    assert.ok(typeof firstDoc.satisfactionRating === 'number', 'Satisfaction rating must be numeric')
  })

  it('5. OPD Operations & Chamber Capacity: should calculate waiting times and peak traffic', async () => {
    const opd = await getOpdOperationsAnalytics({
      branchId,
      timeframe: 'last_30_days',
    })

    assert.ok(typeof opd.totalSlotsBooked === 'number', 'Slots booked must be numeric')
    assert.ok(typeof opd.averageWaitingMinutes === 'number', 'Waiting minutes must be numeric')
    assert.ok(typeof opd.chamberOccupancyPercentage === 'number', 'Chamber occupancy % must be numeric')
    assert.ok(opd.peakHoursTraffic !== undefined, 'Peak hours traffic distribution must exist')
  })

  it('6. Diagnostic BI & Turnaround Time (TAT): should measure SLA compliance and P90 intervals', async () => {
    const diag = await getDiagnosticBiAndTat({
      branchId,
      timeframe: 'last_30_days',
    })

    assert.ok(typeof diag.totalOrders === 'number', 'Total orders must be numeric')
    assert.ok(typeof diag.diagnosticRevenue === 'number', 'Diagnostic revenue must be numeric')
    assert.ok(typeof diag.turnaroundTime?.averageTatHours === 'number', 'Avg TAT hours must be numeric')
    assert.ok(typeof diag.turnaroundTime?.sla24HourCompliancePercentage === 'number', 'SLA % must be numeric')
    assert.ok(diag.collectionTypeShares !== undefined, 'Collection shares must exist')
  })

  it('7. OPD-to-Diagnostic Funnel: should calculate patient journey drop-offs', async () => {
    const funnel = await getOpdToDiagnosticFunnel({
      branchId,
      timeframe: 'last_30_days',
    })

    assert.ok(Array.isArray(funnel.funnelStages), 'Funnel stages must be an array')
    assert.ok(funnel.funnelStages.length >= 4, 'Must have at least 4 funnel stages')
    assert.ok(typeof funnel.overallConversionRate === 'number', 'Conversion rate must be numeric')
  })

  it('8. Financial MIS & Accounts Receivable Aging: should classify aging buckets', async () => {
    const fin = await getFinancialMisAndAging({
      branchId,
      timeframe: 'current_month',
    })

    assert.ok(typeof fin.totalBilled === 'number', 'Total billed must be numeric')
    assert.ok(typeof fin.totalCollected === 'number', 'Total collected must be numeric')
    assert.ok(typeof fin.totalOutstanding === 'number', 'Total outstanding must be numeric')

    assert.ok(typeof fin.agingBuckets?.current === 'number', 'Current bucket must be numeric')
    assert.ok(typeof fin.agingBuckets?.days1to7 === 'number', '1-7 days bucket must be numeric')
    assert.ok(typeof fin.agingBuckets?.days8to30 === 'number', '8-30 days bucket must be numeric')
    assert.ok(typeof fin.agingBuckets?.days31to60 === 'number', '31-60 days bucket must be numeric')
    assert.ok(typeof fin.agingBuckets?.over90days === 'number', 'Over 90 days bucket must be numeric')
  })

  it('9. Multi-Branch Benchmarking: should compare performance across network facilities', async () => {
    const branches = await getMultiBranchAnalytics({
      timeframe: 'current_month',
    })

    assert.ok(Array.isArray(branches.branches), 'Branches must be an array')
    assert.ok(branches.branches.length >= 1, 'Should evaluate at least 1 branch')

    const firstBranch = branches.branches[0]
    assert.ok(firstBranch.name, 'Branch must have name')
    assert.ok(typeof firstBranch.revenue === 'number', 'Revenue must be numeric')
    assert.ok(typeof firstBranch.collections === 'number', 'Collections must be numeric')
    assert.ok(typeof firstBranch.atv === 'number', 'Average transaction value must be numeric')
  })

  it('10. Business Targets & Goal Management: should set targets and measure achievement', async () => {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const newTarget = await createBusinessTarget({
      branchId,
      targetMetric: 'monthly_revenue_test',
      periodStart,
      periodEnd,
      targetValue: 600000,
      notes: 'Test expansion revenue target',
    })

    assert.ok(newTarget.id, 'Target should have ID')
    testTargetId = newTarget.id

    const targets = await getBusinessTargets(branchId)
    assert.ok(targets.length >= 1, 'Should list targets')

    const created = targets.find((t) => t.id === testTargetId)
    assert.ok(created, 'Should find created target')
    assert.ok(typeof created.achievement_percentage === 'number', 'Achievement % must be numeric')
  })

  it('11. Decision Intelligence Alerts: should retrieve rules-based alerts and resolve them', async () => {
    const { data: prof } = await admin.from('profiles').select('id').limit(1).single()
    const adminUserId = prof?.id || '1f3e75fe-855b-4677-a298-620ce7807028'

    const alerts = await getDecisionAlerts(branchId)
    assert.ok(Array.isArray(alerts), 'Alerts must be an array')
    assert.ok(alerts.length >= 1, 'Should find active alerts')

    testAlertId = alerts[0].id
    const resolved = await resolveDecisionAlert(testAlertId, adminUserId)

    assert.equal(resolved.status, 'resolved')
    assert.ok(resolved.resolved_at, 'Should record resolved_at timestamp')
  })

  it('12. Custom Report Builder & Exports: should generate export jobs in CSV format', async () => {
    const { data: prof } = await admin.from('profiles').select('id').limit(1).single()
    const adminUserId = prof?.id || '1f3e75fe-855b-4677-a298-620ce7807028'

    const templates = await listCustomReportTemplates()
    assert.ok(templates.length >= 1, 'Should have pre-configured templates')

    const exportResult = await generateReportExport({
      reportTitle: 'Test Financial MIS Export',
      reportType: 'financial',
      fileFormat: 'csv',
      data: [
        { metric: 'Revenue', value: 500000, status: 'Verified' },
        { metric: 'Collections', value: 480000, status: 'Verified' },
      ],
      createdById: adminUserId,
    })

    assert.ok(exportResult.jobId, 'Should have export jobId')
    assert.ok(exportResult.downloadUrl, 'Should have download URL')
    assert.ok(exportResult.csvContent.includes('Revenue'), 'CSV content should contain metric')
  })

  it('13. Executive Daily Briefing: should summarize yesterday and highlight priority actions', async () => {
    const briefing = await getExecutiveDailyBriefing()

    assert.ok(briefing.date, 'Date must be present')
    assert.ok(typeof briefing.yesterdayCollections === 'number', 'Yesterday collections must be numeric')
    assert.ok(briefing.headlineSummary, 'Headline summary must be present')
    assert.ok(Array.isArray(briefing.priorityActions), 'Priority actions must be an array')
    assert.ok(briefing.priorityActions.length >= 1, 'Must have at least 1 action')
  })

  it('14. Data Quality Audit & Governance Dictionary: should compute health score and definitions', async () => {
    const audit = await getDataQualityAudit()

    assert.ok(typeof audit.overallDataQualityScore === 'number', 'Quality score must be numeric')
    assert.ok(audit.overallDataQualityScore >= 0 && audit.overallDataQualityScore <= 100, 'Score must be 0-100%')
    assert.ok(Array.isArray(audit.checks), 'Audit checks must be an array')

    const dictionary = getMetricDictionary()
    assert.ok(dictionary.length >= 5, 'Should have at least 5 canonical metric definitions')
    assert.ok(dictionary[0].kpi, 'Entry must have KPI name')
    assert.ok(dictionary[0].formula, 'Entry must have formula')
    assert.ok(dictionary[0].refundTreatment, 'Entry must document refund treatment')
  })
})
