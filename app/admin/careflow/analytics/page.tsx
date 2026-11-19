'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  CreditCard,
  DollarSign,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart,
  HelpCircle,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function RetentionAnalyticsPage() {
  const { selectedBranchId } = useBranch()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    retention: any
    cohorts: any[]
    ltv: any
  } | null>(null)

  const [mode, setMode] = useState<'all' | 'internal' | 'external'>('all')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `?branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/careflow/analytics${branchParam}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedBranchId])

  const retention = data?.retention || {
    totalPatientsTracked: 0,
    repeatPatients: 0,
    repeatConsultationRate: 0,
    totalCallsLogged: 0,
    successfulContactRate: 0,
    completedAppointments: 0,
    noShowRate: 0
  }

  const ltv = data?.ltv || {
    realizedTotalBilledInr: 0,
    realizedTotalCollectedInr: 0,
    patientsWithBillingHistory: 0,
    averageHistoricalRevenuePerPatient: 0,
    estimated12MonthLtvPerPatient: 0
  }

  const cohorts = data?.cohorts || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/careflow" className="hover:text-teal-600 transition-colors">CareFlow OS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Retention Analytics & LTV</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            Patient Retention & Transparent LTV Modeling
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cohort retention matrix, consultation continuity rates, and audited realized vs projected patient lifetime value.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">Patients Tracked</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {retention.totalPatientsTracked}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Unique continuity cohort</div>
        </div>

        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20">
          <div className="text-xs font-medium text-teal-700 dark:text-teal-300">Repeat Visit Rate</div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-300 mt-1">
            {retention.repeatConsultationRate}%
          </div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">
            {retention.repeatPatients} repeat patients
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Call Connect Rate</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
            {retention.successfulContactRate}%
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
            {retention.totalCallsLogged} calls logged
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Realized Rev / Patient</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            ₹{ltv.averageHistoricalRevenuePerPatient?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Audited collected cash</div>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Projected 12M LTV</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
            ₹{ltv.estimated12MonthLtvPerPatient?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">1.8x continuity model</div>
        </div>
      </div>

      {/* Cohort Retention Matrix */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Patient Cohort Retention Matrix (30 / 60 / 90 / 180 / 365 Days)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Percentage of patients in each monthly acquisition cohort who returned for follow-ups or chronic care.
            </p>
          </div>

          <Badge variant="outline" className="text-xs">
            Live PostgreSQL Aggregation
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Cohort Month</th>
                <th className="px-4 py-3">Acquired Patients</th>
                <th className="px-4 py-3 text-center">Day 30</th>
                <th className="px-4 py-3 text-center">Day 60</th>
                <th className="px-4 py-3 text-center">Day 90</th>
                <th className="px-4 py-3 text-center">Day 180</th>
                <th className="px-4 py-3 text-center">Day 365</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cohorts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No historical cohorts generated yet. As appointments complete over time, cohorts populate automatically.
                  </td>
                </tr>
              ) : (
                cohorts.map((c) => {
                  const base = c.totalPatients || 1
                  const p30 = Math.min(100, Math.round((c.retained30 / base) * 100))
                  const p60 = Math.min(100, Math.round((c.retained60 / base) * 100))
                  const p90 = Math.min(100, Math.round((c.retained90 / base) * 100))
                  const p180 = Math.min(100, Math.round((c.retained180 / base) * 100))
                  const p365 = Math.min(100, Math.round((c.retained365 / base) * 100))

                  return (
                    <tr key={c.cohortMonth} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                        {c.cohortMonth}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {c.totalPatients} patients
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded font-mono font-bold ${
                          p30 > 50 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {p30}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded font-mono font-bold ${
                          p60 > 40 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {p60}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded font-mono font-bold ${
                          p90 > 30 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {p90}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded font-mono font-bold ${
                          p180 > 25 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {p180}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded font-mono font-bold ${
                          p365 > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {p365}%
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparent LTV & Financial Methodology Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Audited Realized Financial Performance
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Revenue figures below reflect verified cash collected through the CAPSIC CARE billing and POS engine. No speculative bookings are counted as realized revenue.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-600 dark:text-slate-400">Total Billed Invoices</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ₹{ltv.realizedTotalBilledInr?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-600 dark:text-slate-400">Total Collected Payments</span>
              <span className="text-sm font-bold text-emerald-600">
                ₹{ltv.realizedTotalCollectedInr?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-600 dark:text-slate-400">Patients with Billing History</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {ltv.patientsWithBillingHistory} patients
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Avg Realized Revenue / Patient</span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                ₹{ltv.averageHistoricalRevenuePerPatient?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Projected 12-Month LTV & Methodology
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            CareFlow projection models distinguish between acute single-episode encounters and chronic care continuity cycles.
          </p>

          <div className="p-4 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-2">
            <div className="text-xs font-semibold text-purple-900 dark:text-purple-300">
              Predictive Continuity Multiplier Formula:
            </div>
            <code className="text-xs font-mono text-purple-800 dark:text-purple-200 block p-2 bg-white dark:bg-slate-900 rounded border border-purple-100 dark:border-purple-900">
              LTV = Realized_Baseline × (1 + [Return_Rate × Recall_Cadence])
            </code>
            <p className="text-[11px] text-purple-700/90 dark:text-purple-400 mt-2">
              Based on empirical follow-up adherence, retained patients generate an average of 1.8x their initial invoice value over a 12-month horizon through routine doctor re-consultations and monitoring blood tests.
            </p>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Projected 12M Value / Retained Patient</span>
            <span className="text-base font-bold text-purple-700 dark:text-purple-300">
              ₹{ltv.estimated12MonthLtvPerPatient?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
