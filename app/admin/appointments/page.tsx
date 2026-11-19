'use client'

import React from 'react'
import { Calendar, Clock, Stethoscope, CheckCircle2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AppointmentsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointment Management</h1>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
              Step 04 Planned
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Doctor OPD chamber slots, in-person consultations, telemedicine queues, and live reception booking.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 max-w-3xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Module Scope & Implementation Plan</h3>
            <p className="text-sm text-slate-600">
              The database foundations, tables (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">appointments</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">doctor_schedules</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">schedule_exceptions</code>), and overlap triggers were established in Step 02.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Features Scheduled for Step 04:</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-view calendar (Day / Week / Doctor Chamber Grid)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Live reception booking modal with instant patient lookup by UHID or phone</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Doctor schedule exception & leave management</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Appointment status transitions: <code className="text-xs bg-slate-100 px-1 rounded">scheduled</code> &rarr; <code className="text-xs bg-slate-100 px-1 rounded">confirmed</code> &rarr; <code className="text-xs bg-slate-100 px-1 rounded">in_consultation</code> &rarr; <code className="text-xs bg-slate-100 px-1 rounded">completed</code></span>
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Database Status: Ready (Migration 003 & 005 applied)</span>
          <Link href="/admin/doctors">
            <Button variant="outline" size="sm" className="text-xs">
              View Doctor Schedules <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
