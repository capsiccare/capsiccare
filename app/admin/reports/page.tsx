'use client'

import React from 'react'
import { BarChart3, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ReportsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">MIS & Executive Analytics</h1>
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 text-xs">
              Step 09 Planned
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Executive operational reporting, doctor productivity matrices, clinical turn-around time (TAT), and financial MIS.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 max-w-3xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Module Scope & Implementation Plan</h3>
            <p className="text-sm text-slate-600">
              The aggregation views, indexing, integer paise rollups, and audit logging foundations were established in Step 02 and Step 03.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Features Scheduled for Step 09:</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Doctor OPD productivity, revenue contribution, and consultation duration analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lab test volume distribution, sample collection TAT, and verification backlog</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-branch revenue comparison & counter cash reconciliation reports</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated Excel / CSV / PDF export for clinical administration and accountants</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Database Status: Ready (All 6 core migrations applied)</span>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="text-xs">
              Return to Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
