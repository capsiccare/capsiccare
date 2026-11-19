'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  Stethoscope,
  FlaskConical,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function MultiBranchAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<string>('current_month')
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/analytics/branches?timeframe=${timeframe}`)
      const json = await res.json()
      if (json.success) {
        setBranches(json.data.branches || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [timeframe])

  const totalNetworkRevenue = branches.reduce((acc, b) => acc + (b.revenue || 0), 0)
  const totalNetworkCollections = branches.reduce((acc, b) => acc + (b.collections || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Multi-Branch Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Multi-Branch Performance & Benchmarking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comparative revenue contribution, patient footfall, ATV, and operational efficiency across clinic facilities.
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

          <Button variant="outline" size="sm" onClick={fetchBranches} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Operating Network Branches</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {branches.length} Facilities
          </div>
          <div className="text-xs text-slate-400 mt-1">Kolkata Clinical Network</div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Total Network Billed Revenue</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
            ₹{totalNetworkRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">Across all branches</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Network Collections</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            ₹{totalNetworkCollections.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Cash and digital settlements</div>
        </div>
      </div>

      {/* Branch Benchmarking Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Branch & Code</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">OPD Visits</th>
                <th className="px-4 py-3">Diagnostics</th>
                <th className="px-4 py-3">Avg Transaction (ATV)</th>
                <th className="px-4 py-3">Billed Revenue</th>
                <th className="px-4 py-3 text-right">Collections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No branch data found for this period.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.branchId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        {b.name}
                      </div>
                      <span className="font-mono text-xs text-slate-400">{b.code}</span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {b.city || 'Kolkata'}
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono font-medium">
                      {b.completedConsultations} visits
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono font-medium">
                      {b.diagnosticOrders} orders
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{b.atv.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-sm text-slate-900 dark:text-white">
                      ₹{b.revenue.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-sm text-emerald-600">
                      ₹{b.collections.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
