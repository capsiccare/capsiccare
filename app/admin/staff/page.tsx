'use client'

import React from 'react'
import { UserCheck, Shield, CheckCircle2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StaffPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Management & RBAC</h1>
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
              Step 07 Planned
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Internal workforce directory, clinical roles, branch access assignment, shift management, and MFA security.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 max-w-3xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Module Scope & Implementation Plan</h3>
            <p className="text-sm text-slate-600">
              The database foundations, tables (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">profiles</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">roles</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">user_role_assignments</code>), and multi-branch scoping were established in Step 02.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Features Scheduled for Step 07:</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Staff onboarding & invite workflow via Supabase Auth Admin</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-role assignment matrix per branch (Receptionist, Nurse, Lab Staff, Phlebotomist)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mandatory Multi-Factor Authentication (MFA) enforcement for privileged roles</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Staff activity logging and session revocation</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Database Status: Ready (Migration 001 applied)</span>
          <Link href="/admin/settings">
            <Button variant="outline" size="sm" className="text-xs">
              View Current RBAC Roles <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
