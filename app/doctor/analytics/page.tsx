'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  IndianRupee,
  Calendar,
  Users,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export default function DoctorAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/doctor/financials')
        if (res.ok) {
          const json = await res.json()
          setData(json.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <span>Professional Payouts & Practice Financials</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified consultation earnings, contractual facility deductions, and settled payout statements
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Completed Visits</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : data?.completed_consultations || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Finished consultations</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Gross Earnings</span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{loading ? '...' : (data?.gross_earnings_inr || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Invoiced consultation fees</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Facility Deductions</span>
            <span className="text-[10px] font-bold text-slate-400">30%</span>
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            ₹{loading ? '...' : (data?.clinic_deductions_inr || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Clinic overhead & chamber share</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase mb-1">
            <span>Net Payable</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
            ₹{loading ? '...' : (data?.net_payable_inr || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Professional fee after deductions</p>
        </div>
      </div>

      {/* Payout Breakdown Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Payout Settlement Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-emerald-700 dark:text-emerald-300 font-bold block mb-1">
              Settled Direct Deposits
            </span>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
              ₹{(data?.settled_payouts_inr || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Disbursed via bank transfer</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="text-amber-700 dark:text-amber-300 font-bold block mb-1">
              Pending Next Batch Settlement
            </span>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-200">
              ₹{(data?.pending_payouts_inr || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Scheduled for weekly cashier reconciliation</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic pt-2">
          {data?.disclaimer}
        </p>
      </div>
    </div>
  )
}
