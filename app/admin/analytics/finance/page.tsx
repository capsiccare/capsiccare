'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Receipt,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function FinancialMisPage() {
  const { selectedBranchId } = useBranch()
  const [timeframe, setTimeframe] = useState<string>('current_month')
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchFinance = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/analytics/finance?timeframe=${timeframe}${branchParam}`)
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
    fetchFinance()
  }, [timeframe, selectedBranchId])

  const aging = data?.agingBuckets || {
    current: 0,
    days1to7: 0,
    days8to30: 0,
    days31to60: 0,
    days61to90: 0,
    over90days: 0,
  }

  const counterSessions = data?.recentCounterSessions || []

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Financial MIS & Reconciliation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-600" />
            Financial MIS, Aging Buckets & Cash Counter Audit
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aging accounts receivable, collection efficiency, and physical reception cash drawer audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchFinance} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Aggregate Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Invoiced Billed</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{data?.totalBilled?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Gross patient billings</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Collected</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            ₹{data?.totalCollected?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {data?.collectionEfficiencyPct ?? 0}% collection efficiency
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Total Outstanding Receivables</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            ₹{data?.totalOutstanding?.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Across all aging buckets</div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs">
          <div className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">Over-30-Days Delinquency</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
            ₹{(aging.days31to60 + aging.days61to90 + aging.over90days).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Requires collector follow-up</div>
        </div>
      </div>

      {/* Accounts Receivable Aging Buckets */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Accounts Receivable Aging Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Outstanding invoice balances grouped by documented aging intervals.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Standard GAAP Aging Buckets
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Current (0 Days)</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
              ₹{aging.current.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase block">1 – 7 Days</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
              ₹{aging.days1to7.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-center">
            <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase block">8 – 30 Days</span>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1 block">
              ₹{aging.days8to30.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-center">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase block">31 – 60 Days</span>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-300 mt-1 block">
              ₹{aging.days31to60.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-center">
            <span className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 uppercase block">61 – 90 Days</span>
            <span className="text-lg font-bold text-orange-700 dark:text-orange-300 mt-1 block">
              ₹{aging.days61to90.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-center">
            <span className="text-[11px] font-semibold text-red-800 dark:text-red-300 uppercase block">&gt; 90 Days</span>
            <span className="text-lg font-bold text-red-700 dark:text-red-300 mt-1 block">
              ₹{aging.over90days.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Cash Counter Reconciliation Audit */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Cash Counter Reconciliation & Till Sessions
            </h3>
          </div>
          <Link href="/admin/billing" className="text-xs font-medium text-indigo-600 hover:underline">
            Manage Cash Sessions
          </Link>
        </div>

        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Session #</th>
                <th className="px-4 py-3">Opening Cash</th>
                <th className="px-4 py-3">Cash Inflow</th>
                <th className="px-4 py-3">Counted Cash</th>
                <th className="px-4 py-3">Variance</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {counterSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No counter sessions recorded for this period.
                  </td>
                </tr>
              ) : (
                counterSessions.map((sess: any) => {
                  const variance = Number(sess.variance_inr || 0)
                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-white">
                        {sess.session_number || sess.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        ₹{Number(sess.opening_cash_inr || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-600">
                        ₹{Number(sess.total_cash_received_inr || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        ₹{Number(sess.closing_cash_counted_inr || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={variance === 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {variance === 0 ? '₹0.00 (Balanced)' : `₹${variance.toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-semibold ${
                            sess.session_status === 'closed'
                              ? 'bg-slate-50 text-slate-700'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {sess.session_status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
