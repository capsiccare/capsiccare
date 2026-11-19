'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  Receipt,
  PieChart,
  Percent,
  AlertCircle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  FileText,
  CreditCard,
  Building2,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function RevenueAnalyticsPage() {
  const { selectedBranchId } = useBranch()
  const [timeframe, setTimeframe] = useState<string>('current_month')
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRevenue = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/analytics/revenue?timeframe=${timeframe}${branchParam}`)
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
    fetchRevenue()
  }, [timeframe, selectedBranchId])

  const grossInvoiced = data?.grossInvoicedAmount ?? 0
  const discounts = data?.discountsGiven ?? 0
  const tax = data?.taxCollected ?? 0
  const refunds = data?.refundsProcessed ?? 0
  const netInvoiced = data?.netInvoicedValue ?? 0
  const collected = data?.paymentsReceived ?? 0
  const outstanding = data?.outstandingReceivables ?? 0

  const directCosts = data?.costAndMargin?.directCosts ?? 0
  const fixedCosts = data?.costAndMargin?.fixedOperatingCosts ?? 0
  const grossMargin = data?.costAndMargin?.grossMarginInr
  const grossMarginPct = data?.costAndMargin?.grossMarginPercentage
  const operatingProfit = data?.costAndMargin?.operatingProfitInr
  const hasCostData = data?.costAndMargin?.hasCostData ?? false

  const serviceBreakdown = data?.serviceBreakdown || {
    consultation: { billed: 0, count: 0 },
    diagnostics: { billed: 0, count: 0 },
    careflow: { billed: 0, count: 0 },
    other: { billed: 0, count: 0 }
  }

  const paymentMethods = data?.paymentMethods || { cash: 0, upi: 0, card: 0, netbanking: 0 }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Revenue & Profitability</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Revenue, Cost & Profitability Accounting
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verifiable accounting waterfall: Gross Invoiced → Deductions → Net Revenue → Direct Costs → Contribution Margin.
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
            <option value="current_financial_year">Financial Year</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchRevenue} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Accounting Waterfall Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Invoiced Billed</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{grossInvoiced.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Prior to discounts & refunds</div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Net Invoiced Revenue</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
            ₹{netInvoiced.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">
            Less ₹{discounts.toLocaleString('en-IN')} disc, ₹{refunds.toLocaleString('en-IN')} ref
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Payments Collected</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            ₹{collected.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Realized cash & digital receipts
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Outstanding Balance</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            ₹{outstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Unsettled patient balances</div>
        </div>
      </div>

      {/* Margin & Profitability Section */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Verified Margin & Cost Contribution Accounting
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly accounts for doctor fee disbursements, partner lab processing, phlebotomy, and fixed clinic overhead.
            </p>
          </div>

          <Badge variant="outline" className={`text-xs ${hasCostData ? 'text-emerald-700 border-emerald-300 bg-emerald-50' : 'text-amber-700 border-amber-300 bg-amber-50'}`}>
            {hasCostData ? 'Verified Cost Data' : 'Incomplete Cost State'}
          </Badge>
        </div>

        {hasCostData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">Direct Clinical Costs</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                ₹{directCosts.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">Doctor fees, reagents, lab</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">Gross Margin (INR)</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">
                ₹{grossMargin?.toLocaleString('en-IN') ?? '0'}
              </span>
              <span className="text-[11px] text-emerald-600/90 font-medium">Net Revenue - Direct Costs</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">Contribution Margin %</span>
              <span className="text-xl font-bold text-indigo-600 mt-1 block">
                {grossMarginPct ?? 0}%
              </span>
              <span className="text-[11px] text-slate-400">Gross margin percentage</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 block">Operating Profit</span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
                ₹{operatingProfit?.toLocaleString('en-IN') ?? '0'}
              </span>
              <span className="text-[11px] text-slate-400">After ₹{fixedCosts.toLocaleString('en-IN')} overhead</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Incomplete Provider Cost Ledger:</span>
              <p className="mt-0.5 leading-relaxed">
                {data?.costAndMargin?.costDataNotice || 'Operating cost entries for this exact timeframe are not yet fully booked. CAPSIC CARE OS strictly avoids fabricating zero-cost margins. Billed revenue is verified.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Slices: Service Category & Payment Method Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Category Breakdown */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Revenue by Service Category
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Doctor Consultations (OPD)</span>
                <span className="text-slate-500">{serviceBreakdown.consultation.count} visits billed</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ₹{serviceBreakdown.consultation.billed.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Diagnostics & Pathology Labs</span>
                <span className="text-slate-500">{serviceBreakdown.diagnostics.count} lab orders billed</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ₹{serviceBreakdown.diagnostics.billed.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">CareFlow Doctor Retention Services</span>
                <span className="text-slate-500">{serviceBreakdown.careflow.count} practices billed</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ₹{serviceBreakdown.careflow.billed.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Payment Collections by Tender Method
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">UPI / QR Code Transfers</span>
              <span className="text-sm font-bold text-emerald-600">
                ₹{(paymentMethods.upi || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Physical Cash at Reception Till</span>
              <span className="text-sm font-bold text-emerald-600">
                ₹{(paymentMethods.cash || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Credit / Debit Card POS Terminal</span>
              <span className="text-sm font-bold text-emerald-600">
                ₹{(paymentMethods.card || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Direct Bank / NEFT Settlement</span>
              <span className="text-sm font-bold text-emerald-600">
                ₹{(paymentMethods.netbanking || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
