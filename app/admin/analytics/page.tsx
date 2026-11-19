'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Stethoscope,
  FlaskConical,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Activity,
  Layers,
  Target,
  Sparkles,
  PhoneCall
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function ExecutiveCommandCenterPage() {
  const { selectedBranchId } = useBranch()
  const [timeframe, setTimeframe] = useState<string>('current_month')
  const [metrics, setMetrics] = useState<any | null>(null)
  const [briefing, setBriefing] = useState<any | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const [metricsRes, briefingRes, alertsRes] = await Promise.all([
        fetch(`/api/v1/analytics/command-center?timeframe=${timeframe}${branchParam}`),
        fetch('/api/v1/analytics/daily-briefing'),
        fetch(`/api/v1/analytics/alerts?${branchParam}`)
      ])

      const [metricsData, briefingData, alertsData] = await Promise.all([
        metricsRes.json(),
        briefingRes.json(),
        alertsRes.json()
      ])

      if (metricsData.success) setMetrics(metricsData.data)
      if (briefingData.success) setBriefing(briefingData.data)
      if (alertsData.success) setAlerts(alertsData.data.alerts || [])
    } catch (err) {
      console.error('Failed to load MIS command center:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [timeframe, selectedBranchId])

  return (
    <div className="space-y-6">
      {/* Top Bar with Timeframe & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span className="font-semibold text-teal-600 dark:text-teal-400">CAPSIC CARE OS</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Enterprise Executive MIS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Executive Command Center & Decision Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audited operational metrics, doctor productivity, revenue recognition, and business intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-xs font-medium border rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="current_month">Current Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="current_financial_year">Current Financial Year (FY26-27)</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/analytics/reports">
            <Button size="sm" className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
              Custom Reports & Exports
            </Button>
          </Link>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs border-b border-slate-200 dark:border-slate-800">
        <Link href="/admin/analytics" className="px-3 py-2 font-bold text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400 shrink-0">
          Command Center
        </Link>
        <Link href="/admin/analytics/revenue" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Revenue & Margin
        </Link>
        <Link href="/admin/analytics/doctors" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Doctor Matrix
        </Link>
        <Link href="/admin/analytics/appointments" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          OPD Operations
        </Link>
        <Link href="/admin/analytics/diagnostics" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Diagnostics & TAT
        </Link>
        <Link href="/admin/analytics/finance" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Financial MIS
        </Link>
        <Link href="/admin/analytics/branches" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Branch Comparison
        </Link>
        <Link href="/admin/analytics/targets" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Budgets & Targets
        </Link>
        <Link href="/admin/analytics/alerts" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Decision Alerts
        </Link>
        <Link href="/admin/analytics/data-quality" className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0">
          Data Quality
        </Link>
      </div>

      {/* Executive Daily Briefing Banner */}
      {briefing && (
        <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Executive Daily Briefing • {briefing.date}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono bg-white dark:bg-slate-900">
                  {briefing.activeAlertsCount} Alerts Active
                </Badge>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-1">
                {briefing.headlineSummary}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-600 dark:text-slate-400">
                {briefing.priorityActions?.map((act: string, idx: number) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Command Center KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Billed Revenue */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Billed Invoiced Revenue</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{metrics?.billedRevenue?.current?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-2">
            {metrics?.billedRevenue?.percentageChange >= 0 ? (
              <span className="flex items-center text-emerald-600 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{metrics?.billedRevenue?.percentageChange}%
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {metrics?.billedRevenue?.percentageChange}%
              </span>
            )}
            <span className="text-slate-400">vs prior period</span>
          </div>
        </div>

        {/* Collected Payments */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Collected Cash & Digital</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-2">
            ₹{metrics?.collectedPayments?.current?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-2">
            {metrics?.collectedPayments?.percentageChange >= 0 ? (
              <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{metrics?.collectedPayments?.percentageChange}%
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {metrics?.collectedPayments?.percentageChange}%
              </span>
            )}
            <span className="text-slate-500">Realized cash in bank/till</span>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span>Outstanding Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-2">
            ₹{metrics?.outstandingReceivables?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-400 mt-2">
            Pending patient & sponsor clearance
          </div>
        </div>

        {/* Doctor Utilization */}
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-800 dark:text-indigo-300">
            <span>Doctor Utilization Rate</span>
            <Stethoscope className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mt-2">
            {metrics?.doctorUtilization ?? 0}%
          </div>
          <div className="text-xs text-indigo-700 dark:text-indigo-400 mt-2">
            {metrics?.consultationVolume?.current ?? 0} completed consultations
          </div>
        </div>
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">Diagnostic Orders</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics?.diagnosticOrders?.current ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Orders processed</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">New Patients Acquired</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics?.newPatients ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">First-time UHIDs</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">Returning Patients</div>
          <div className="text-xl font-bold text-teal-600 mt-1">
            {metrics?.returningPatients ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Retained continuity</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">Follow-Ups Due</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">
            {metrics?.followupsDue ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">CareFlow queue</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">Cash Counter Till</div>
          <div className="text-xl font-bold mt-1 flex items-center gap-1.5">
            <span className={metrics?.cashReconciliation?.isBalanced ? 'text-emerald-600' : 'text-amber-600'}>
              {metrics?.cashReconciliation?.isBalanced ? 'Balanced' : `₹${metrics?.cashReconciliation?.varianceInr} Var`}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Till session audit</div>
        </div>
      </div>

      {/* Active Decision Alerts Table */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Active Decision Intelligence Alerts ({alerts.length})
            </h3>
          </div>
          <Link href="/admin/analytics/alerts" className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1">
            Manage All Rules
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {alerts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No active operational alerts. All key parameters are within normal variance thresholds.
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                      alert.severity === 'critical'
                        ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60'
                        : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60'
                    }`}
                  >
                    {alert.severity}
                  </Badge>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{alert.description}</p>
                    <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                      Action Recommendation: {alert.action_recommendation}
                    </p>
                  </div>
                </div>

                {alert.drilldown_url && (
                  <Link href={alert.drilldown_url} className="shrink-0">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 rounded-lg">
                      <span>Investigate</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Launch Cards to Specialized Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/analytics/revenue"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mt-3 text-sm">Revenue & Margin Analytics</h4>
          <p className="text-xs text-slate-500 mt-1">
            Service-wise breakdown, direct cost deductions, gross margin %, and payment method split.
          </p>
        </Link>

        <Link
          href="/admin/analytics/doctors"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mt-3 text-sm">Doctor Productivity Matrix</h4>
          <p className="text-xs text-slate-500 mt-1">
            Consultations completed, cancellation rates, waiting times, and patient satisfaction ratings.
          </p>
        </Link>

        <Link
          href="/admin/analytics/diagnostics"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600">
              <FlaskConical className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mt-3 text-sm">Diagnostic Turnaround Time (TAT)</h4>
          <p className="text-xs text-slate-500 mt-1">
            Order-to-collection, sample-to-report, P90 SLA compliance, and home vs walk-in volumes.
          </p>
        </Link>
      </div>
    </div>
  )
}
