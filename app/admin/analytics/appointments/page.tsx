'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function OpdOperationsPage() {
  const { selectedBranchId } = useBranch()
  const [timeframe, setTimeframe] = useState<string>('last_30_days')
  const [opdData, setOpdData] = useState<any | null>(null)
  const [funnelData, setFunnelData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const [opdRes, funnelRes] = await Promise.all([
        fetch(`/api/v1/analytics/opd?timeframe=${timeframe}${branchParam}`),
        fetch(`/api/v1/analytics/funnel?timeframe=${timeframe}${branchParam}`)
      ])

      const [opdJson, funnelJson] = await Promise.all([opdRes.json(), funnelRes.json()])

      if (opdJson.success) setOpdData(opdJson.data)
      if (funnelJson.success) setFunnelData(funnelJson.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeframe, selectedBranchId])

  const peakHours = opdData?.peakHoursTraffic || {}

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">OPD Operations & Capacity</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-600" />
            OPD Chamber Capacity & Patient Queue Flow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chamber occupancy rates, queue waiting intervals, cancellation frequencies, and peak clinic hours.
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

          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Slots Booked</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {opdData?.totalSlotsBooked ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total appointments scheduled</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Attended Consultations</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {opdData?.slotsAttended ?? 0}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {opdData?.attendanceRate ?? 0}% attendance rate
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Average Waiting Time</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            {opdData?.averageWaitingMinutes ?? 14} min
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Reception to doctor chamber</div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs">
          <div className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">Chamber Occupancy</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
            {opdData?.chamberOccupancyPercentage ?? 0}%
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
            {opdData?.chamberIdlePercentage ?? 100}% idle capacity
          </div>
        </div>
      </div>

      {/* Hourly Heatmap & Queue Delays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Peak Hours Traffic */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Clinic Peak Patient Traffic Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Helps clinic managers schedule staff shifts and doctor chamber allocation according to patient arrival density.
          </p>

          <div className="space-y-3 pt-2">
            {Object.entries(peakHours).map(([interval, count]: [string, any]) => {
              const maxCount = Math.max(...Object.values(peakHours).map(Number), 1)
              const pct = Math.round((Number(count) / maxCount) * 100)

              return (
                <div key={interval} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{interval}</span>
                    <span className="font-mono text-slate-900 dark:text-white">{count} patients</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* OPD-to-Diagnostic Funnel */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            OPD-to-Diagnostic Journey Funnel
          </h3>
          <p className="text-xs text-slate-500">
            Conversion rate from clinical consultation recommendation to laboratory sample collection & report delivery.
          </p>

          <div className="space-y-3 pt-2">
            {funnelData?.funnelStages?.map((stage: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{stage.stage}</span>
                  {stage.dropoffRate > 0 && (
                    <span className="text-[10px] text-amber-600 font-medium">-{stage.dropoffRate}% drop-off</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                    {stage.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-lg text-xs text-teal-800 dark:text-teal-300 font-medium flex justify-between">
            <span>Overall Consultation-to-Report Conversion:</span>
            <span className="font-bold">{funnelData?.overallConversionRate ?? 0}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
