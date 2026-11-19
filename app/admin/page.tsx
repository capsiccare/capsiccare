'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useBranch } from '@/lib/context/branch-context'
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  FlaskConical,
  IndianRupee,
  Activity,
  AlertCircle,
  Plus,
  Stethoscope,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { selectedBranchId, activeBranch } = useBranch()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const url = `/api/v1/admin/dashboard?branchId=${selectedBranchId}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedBranchId])

  const kpis = data?.kpis || {}

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Operational Command Center</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              LIVE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {selectedBranchId === 'all'
              ? 'Multi-branch enterprise aggregation'
              : `Active Branch: ${activeBranch?.name || 'Selected Branch'}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs flex items-center gap-1.5"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-teal-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/patients?action=new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-md shadow-teal-500/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Patient</span>
          </Link>

          <Link
            href="/admin/doctors?action=new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
            <span>Add Doctor</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Appointments */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Today's OPD</span>
            <Calendar className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {loading ? '—' : kpis.todayAppointments ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-teal-400">{kpis.completedConsultations ?? 0}</span> completed,{' '}
              <span className="text-amber-400">{kpis.pendingAppointments ?? 0}</span> scheduled
            </div>
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Patients</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {loading ? '—' : kpis.registeredPatients ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active unique patient health IDs
            </div>
          </div>
        </div>

        {/* Diagnostic Orders */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Lab Test Orders</span>
            <FlaskConical className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {loading ? '—' : kpis.diagnosticOrders ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-emerald-400">{kpis.pendingDiagnosticOrders ?? 0}</span> active in queue
            </div>
          </div>
        </div>

        {/* Revenue Collected */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Collections</span>
            <IndianRupee className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              {loading ? '—' : `₹${kpis.revenueCollectedInr?.toLocaleString('en-IN') || 0}`}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Consultations & diagnostic billing
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Operational Schedules & Quick Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule + Recent Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Doctor Schedules */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-400" />
                <h2 className="text-sm font-semibold text-white">Today's Doctor OPD Chambers</h2>
              </div>
              <Link
                href="/admin/doctors"
                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
              >
                <span>View Doctors</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading schedules...</div>
              ) : data?.doctorSchedules?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No doctor OPD sessions scheduled for today. Check upcoming days in Doctor Management.
                </div>
              ) : (
                data?.doctorSchedules?.map((s: any) => (
                  <div key={s.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-white">{s.doctorName}</div>
                      <div className="text-[11px] text-slate-400">{s.specialty} • {s.branchName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-slate-300">
                        {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-mono ${
                        s.type === 'physical'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {s.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming & Recent Appointments */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Recent Appointments</h2>
              </div>
              <span className="text-[11px] text-slate-400">Real-time DB</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading appointments...</div>
              ) : data?.recentAppointments?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No appointments booked yet.
                </div>
              ) : (
                data?.recentAppointments?.map((apt: any) => (
                  <div key={apt.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{apt.patientName}</span>
                        <span className="text-[10px] font-mono text-slate-400">({apt.patientUhid})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {apt.doctorName} • {apt.scheduledDate} at {apt.startTime.slice(0, 5)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium uppercase font-mono ${
                        apt.status === 'confirmed'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : apt.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {apt.status}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        ₹{(apt.feePaise / 100).toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Reception Shortcuts
            </h2>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/admin/patients"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-teal-400" />
                  <span>Search Patient Directory</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/doctors"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="h-4 w-4 text-blue-400" />
                  <span>Manage Doctors & Schedules</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span>Branch & System Settings</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>

              <Link
                href="/admin/audit"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 transition-all text-xs text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>Security & Audit Logs</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          {/* System & Architecture Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Infrastructure Status
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Engine</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Supabase PostgreSQL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Row-Level Security</span>
                <span className="text-teal-400 font-mono">25 Tables Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Double-Booking Trigger</span>
                <span className="text-teal-400 font-mono">Active (PL/pgSQL)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Currency Standard</span>
                <span className="text-teal-400 font-mono">Integer Paise</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Branch Timezone</span>
                <span className="text-slate-200 font-mono">Asia/Kolkata (IST)</span>
              </div>
            </div>
          </div>

          {/* Recent Security Activity */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Recent Audit Events
            </h2>
            <div className="space-y-2">
              {data?.recentActivity?.length === 0 ? (
                <div className="text-xs text-slate-500">No recent audit logs</div>
              ) : (
                data?.recentActivity?.map((act: any) => (
                  <div key={act.id} className="text-xs p-2 rounded bg-slate-950 border border-slate-800/80">
                    <div className="font-mono text-teal-400 text-[11px]">{act.action}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(act.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
