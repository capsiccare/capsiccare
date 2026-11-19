'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  HeartHandshake,
  PhoneCall,
  Calendar,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  ShieldCheck,
  Activity,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
  ClipboardList,
  Stethoscope,
  Receipt,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

interface DashboardMetrics {
  activeEnrolledPatients: number
  followUpsDueToday: number
  overdueFollowUps: number
  completedCalls: number
  connectedCalls: number
  callbackRequests: number
  upcomingDoctorRevisits: number
  pendingInvestigations: number
  escalationsRequiringReview: number
  activeDoctorPractices: number
  completionRate: number
  contactRate: number
}

export default function CareflowDashboardPage() {
  const { selectedBranchId, branches } = useBranch()
  const [mode, setMode] = useState<'modeA' | 'modeB'>('modeA')
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [practices, setPractices] = useState<any[]>([])
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>('')
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [recentEscalations, setRecentEscalations] = useState<any[]>([])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const practiceParam = selectedPracticeId ? `&practiceId=${selectedPracticeId}` : ''

      const [metricsRes, practicesRes, tasksRes, escRes] = await Promise.all([
        fetch(`/api/v1/careflow/dashboard?${branchParam}${practiceParam}`),
        fetch('/api/v1/careflow/practices'),
        fetch(`/api/v1/careflow/tasks?limit=5${branchParam}${practiceParam}`),
        fetch(`/api/v1/careflow/escalations?status=open${practiceParam}`),
      ])

      const metricsData = await metricsRes.json()
      const practicesData = await practicesRes.json()
      const tasksData = await tasksRes.json()
      const escData = await escRes.json()

      if (metricsData.success) setMetrics(metricsData.data)
      if (practicesData.success) setPractices(practicesData.data.practices || [])
      if (tasksData.success) setRecentTasks(tasksData.data.tasks || [])
      if (escData.success) setRecentEscalations(escData.data.escalations || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load CareFlow dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedBranchId, selectedPracticeId])

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-5 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              CareFlow Patient Retention & Doctor CRM
            </h1>
            <Badge className="bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 text-xs font-semibold">
              Step 08 Engine
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Integrated chronic disease recall, tele-caller workflows, automated 3-day post-consultation check-ins, and external doctor retention practice services.
          </p>
        </div>

        {/* Operating Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setMode('modeA')
                setSelectedPracticeId('')
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'modeA'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mode A: CAPSIC Internal
            </button>
            <button
              onClick={() => setMode('modeB')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'modeB'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mode B: External Doctor Practices
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="h-9 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Mode B Practice Filter Banner */}
      {mode === 'modeB' && (
        <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                Operating Mode B — Managed Practice Retention
              </span>
              <p className="text-[11px] text-teal-700 dark:text-teal-300">
                External doctor practice rosters are strictly isolated from CAPSIC CARE internal marketing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Filter Practice:</span>
            <select
              value={selectedPracticeId}
              onChange={(e) => setSelectedPracticeId(e.target.value)}
              className="text-xs h-8 px-2.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="">All Subscribed Practices</option>
              {practices.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Critical Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Enrolled Patients */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Enrolled</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {metrics ? metrics.activeEnrolledPatients : '...'}
          </div>
          <p className="text-[11px] text-slate-400">Total patient rosters</p>
        </div>

        {/* Due Today */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Due Today</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
            {metrics ? metrics.followUpsDueToday : '...'}
          </div>
          <p className="text-[11px] text-slate-400">Scheduled for today</p>
        </div>

        {/* Overdue Follow-ups */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
            {metrics ? metrics.overdueFollowUps : '...'}
          </div>
          <p className="text-[11px] text-slate-400">Requires priority call</p>
        </div>

        {/* Contact Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Contact Rate</span>
            <PhoneCall className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-teal-600 dark:text-teal-400">
            {metrics ? `${metrics.contactRate}%` : '...'}
          </div>
          <p className="text-[11px] text-slate-400">{metrics?.connectedCalls || 0} connected calls</p>
        </div>

        {/* Upcoming Revisits */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">OPD Revisits</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
            {metrics ? metrics.upcomingDoctorRevisits : '...'}
          </div>
          <p className="text-[11px] text-slate-400">Next 14-day consultations</p>
        </div>

        {/* Open Escalations */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Escalations</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
            {metrics ? metrics.escalationsRequiringReview : '...'}
          </div>
          <p className="text-[11px] text-slate-400">Clinical safety review</p>
        </div>
      </div>

      {/* Quick Access Module Navigation Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          CareFlow Core Clinical & Telephony Workstations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tele-Caller Workspace */}
          <Link href="/admin/careflow/calls" className="group block">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-700 transition-all shadow-xs group-hover:shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tele-Caller Desk</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  1-click `tel:` calling, safe task claim locks, multilingual scripts & 14 clinical dispositions.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2: Chronic Care Recall Engine */}
          <Link href="/admin/careflow/recalls" className="group block">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-xs group-hover:shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Chronic Care Recalls</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Diabetic, hypertensive & thyroid quarterly recall plans configured by treating physicians.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 3: Doctor Practice Management */}
          <Link href="/admin/careflow/practices" className="group block">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-700 transition-all shadow-xs group-hover:shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Doctor Practices</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  External practice rosters, chamber management, patient CSV import & doctor value dashboard.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 4: Retention Analytics & LTV */}
          <Link href="/admin/careflow/analytics" className="group block">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all shadow-xs group-hover:shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Retention & LTV</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cohort retention matrix (30/60/90/180/365 days) and transparent historical vs projected LTV.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Follow-ups Due & Open Escalations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Follow-Up Tasks Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Today&apos;s Priority Calling Queue
              </h3>
            </div>
            <Link href="/admin/careflow/calls">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-700 dark:text-teal-400">
                Open Tele-Caller Desk <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                All follow-ups completed! No pending tasks in queue.
              </div>
            ) : (
              recentTasks.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {t.patients?.uhid}
                      </span>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {t.patients?.full_name}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {t.task_type.replace('_', ' ')}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          t.priority === 'urgent' || t.priority === 'high'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Doctor: <strong>{t.doctors?.name || 'CAPSIC Specialist'}</strong> • Tel: {t.patients?.phone}
                    </p>
                    {t.notes && <p className="text-[11px] text-slate-400 italic">{t.notes}</p>}
                  </div>

                  <Link href={`/admin/careflow/calls?taskId=${t.id}`}>
                    <Button size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" />
                      Call Patient
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Open Clinical Escalations & Safety Box */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  Patient Safety Escalations
                </h3>
              </div>
              <Link href="/admin/careflow/escalations">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-700 dark:text-rose-300">
                  View All ({recentEscalations.length})
                </Button>
              </Link>
            </div>

            <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800">
              {recentEscalations.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  No open medical safety alerts.
                </div>
              ) : (
                recentEscalations.map((esc) => (
                  <div key={esc.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {esc.patients?.full_name}
                      </span>
                      <Badge className="bg-rose-100 text-rose-800 text-[10px] uppercase font-bold">
                        {esc.urgency}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {esc.category.replace(/_/g, ' ')}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{esc.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Managed Service Billing Widget */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Managed Service Billing</span>
              <Receipt className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl font-bold">
              {practices.length} External Practices
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated monthly & quarterly billing plans for subscribed independent physicians.
            </p>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-teal-400 font-semibold">Starter / Pro / Enterprise</span>
              <Link href="/admin/careflow/billing" className="text-white hover:underline flex items-center gap-1">
                Manage Invoices <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
