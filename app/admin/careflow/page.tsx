'use client'

import React from 'react'
import { HeartHandshake, PhoneCall, CheckCircle2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CareflowPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">CareFlow Retention Engine</h1>
            <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-xs">
              Step 08 Planned
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated chronic disease recall, post-consultation follow-ups, tele-caller task queues, and patient relationship management.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 max-w-3xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Module Scope & Implementation Plan</h3>
            <p className="text-sm text-slate-600">
              The database foundations, tables (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">careflow_tasks</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">patient_consents</code>), and trigger definitions were established in Step 02.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Features Scheduled for Step 08:</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated 3-day post-consultation health check-in trigger</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chronic care diabetic & hypertensive quarterly recall pipelines</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tele-caller workspace with 1-click calling & call outcome dispositioning</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Patient retention cohort analysis and lifetime value tracking</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Database Status: Ready (Migration 002 & 006 applied)</span>
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
