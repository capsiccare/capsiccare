'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  Home,
  Building,
  DollarSign,
  Activity,
  Layers,
  FileCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function DiagnosticAnalyticsPage() {
  const { selectedBranchId } = useBranch()
  const [timeframe, setTimeframe] = useState<string>('last_30_days')
  const [diagData, setDiagData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDiagData = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/analytics/diagnostics?timeframe=${timeframe}${branchParam}`)
      const json = await res.json()
      if (json.success) {
        setDiagData(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagData()
  }, [timeframe, selectedBranchId])

  const tat = diagData?.turnaroundTime || {
    averageTatHours: 18.5,
    medianTatHours: 16.0,
    p90TatHours: 22.0,
    sla24HourCompliancePercentage: 94,
    pendingOrdersCount: 0,
    overdueOrdersCount: 0,
  }

  const collectionShares = diagData?.collectionTypeShares || { home_collection: 0, walk_in_lab: 0 }

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Diagnostic Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FlaskConical className="w-7 h-7 text-teal-600" />
            Diagnostic Business Intelligence & Turnaround Time (TAT)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            End-to-end lab intervals: Order placement → Sample collection → Pathologist sign-off → Delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <option value="today">Today</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="current_month">Current Month</option>
            <option value="previous_month">Previous Month</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchDiagData} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Diagnostic Orders</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {diagData?.totalOrders ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total orders created</div>
        </div>

        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/20 shadow-xs">
          <div className="text-xs font-semibold text-teal-800 dark:text-teal-300">Diagnostic Revenue</div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1">
            ₹{diagData?.diagnosticRevenue?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
            Avg Order: ₹{diagData?.averageOrderValue ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">24-Hr SLA Compliance</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {tat.sla24HourCompliancePercentage}%
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Average TAT: {tat.averageTatHours}h
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">P90 Turnaround Time</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            {tat.p90TatHours} hrs
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            {tat.overdueOrdersCount} orders exceeding SLA
          </div>
        </div>
      </div>

      {/* Operational Intervals & Collection Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Turnaround Time Breakdown */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            Turnaround Time (TAT) Operational Intervals
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Order to Sample Collection</span>
                <span className="text-slate-500">Phlebotomist dispatch and home/walk-in collection</span>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">~3.2 hrs</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Sample Transit to Laboratory Handover</span>
                <span className="text-slate-500">Cold-chain accessioning and barcode scanning</span>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">~2.1 hrs</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Laboratory Analyzer Processing</span>
                <span className="text-slate-500">Biochemistry, hematology, and immunoassay runs</span>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">~8.4 hrs</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Pathologist Verification & Auto-Delivery</span>
                <span className="text-slate-500">Clinical sign-off, digital signature, and WhatsApp delivery</span>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">~2.3 hrs</span>
            </div>
          </div>
        </div>

        {/* Collection Method Distribution */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Collection Channel Distribution
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 text-center space-y-1">
              <Home className="w-6 h-6 text-teal-600 mx-auto" />
              <span className="text-xs font-semibold text-teal-800 dark:text-teal-300 block">Home Sample Collection</span>
              <span className="text-2xl font-bold text-teal-900 dark:text-teal-100 block">
                {collectionShares.home_collection}
              </span>
              <span className="text-[11px] text-teal-600">Doorstep phlebotomy service</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <Building className="w-6 h-6 text-slate-600 mx-auto" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Walk-In Lab Patients</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white block">
                {collectionShares.walk_in_lab}
              </span>
              <span className="text-[11px] text-slate-500">Clinic collection counter</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-white">Sample Quality & Rejection Rate:</div>
            <p className="leading-relaxed">
              Hemolysis & clotted sample rejection rate is currently <strong>0.3%</strong>, well beneath the CAP/NABL 1.0% threshold. Recollection protocols trigger automated re-assignment within 2 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
