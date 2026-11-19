'use client'

import React from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Receipt,
  Stethoscope,
  FlaskConical,
  Building2,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ReportsIndexPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span className="font-semibold text-teal-600 dark:text-teal-400">CAPSIC CARE OS</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">MIS Reports Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Management Information System (MIS) Reports Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative executive dashboards, doctor productivity matrices, financial aging, and exportable data tables.
          </p>
        </div>

        <Link href="/admin/analytics/reports">
          <Button size="sm" className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
            <FileSpreadsheet className="w-4 h-4" />
            Custom Report Builder
          </Button>
        </Link>
      </div>

      {/* Primary Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          href="/admin/analytics"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-base">Executive Command Center</h3>
          <p className="text-xs text-slate-500 mt-1">
            Today's revenue, collections, consultation volumes, diagnostic orders, and decision alerts.
          </p>
        </Link>

        <Link
          href="/admin/analytics/revenue"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-base">Revenue & Margin Analytics</h3>
          <p className="text-xs text-slate-500 mt-1">
            Gross invoiced revenue, deductions, direct provider costs, and contribution margins.
          </p>
        </Link>

        <Link
          href="/admin/analytics/doctors"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-base">Doctor Productivity Matrix</h3>
          <p className="text-xs text-slate-500 mt-1">
            Consultations completed, cancellation rates, waiting times, and patient satisfaction ratings.
          </p>
        </Link>

        <Link
          href="/admin/analytics/diagnostics"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <FlaskConical className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-base">Diagnostic BI & TAT</h3>
          <p className="text-xs text-slate-500 mt-1">
            Order-to-collection, turnaround time SLAs, P90 analysis, and home vs walk-in collection split.
          </p>
        </Link>

        <Link
          href="/admin/analytics/branches"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-base">Multi-Branch Analytics</h3>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance, average transaction value, and cross-clinic capacity benchmarking.
          </p>
        </Link>

        <Link
          href="/admin/analytics/data-quality"
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-base">Data Quality Audit</h3>
          <p className="text-xs text-slate-500 mt-1">
            Audits patient demographics, financial balance consistency, and timestamp integrity.
          </p>
        </Link>
      </div>
    </div>
  )
}
