'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Stethoscope,
  Pill,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Users,
  Clock,
  ChevronRight,
  RefreshCw,
  Lock,
  ExternalLink,
} from 'lucide-react'

export default function AdminClinicalGovernancePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const fetchOverview = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/clinical/governance')
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

  useEffect(() => {
    fetchOverview()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Clinical Control Center & Medical Governance</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin oversight of clinician credentials, digital prescription integrity, formulary standards, and audit trails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/doctor"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Launch Doctor Portal</span>
          </Link>
        </div>
      </div>

      {/* Governance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Active Clinicians</span>
            <Stethoscope className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : data?.doctors_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified medical registration</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Formulary Drugs</span>
            <Pill className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : data?.formulary_medicines_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">National essential catalogue</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
            <span>Clinical Encounters</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : data?.total_encounters || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total consultation instances</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase mb-1">
            <span>Signed Prescriptions</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {loading ? '...' : data?.signed_prescriptions || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cryptographically stamped</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase mb-1">
            <span>Draft Prescriptions</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {loading ? '...' : data?.pending_rx_signatures || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting doctor sign</p>
        </div>
      </div>

      {/* Governance Notice */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-3">
        <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm mb-1">Super Admin Clinical Separation Principle</h4>
          <p>
            Super Administrators hold platform-wide oversight but are legally and architecturally restricted from
            modifying signed clinical findings or impersonating doctors. Prescriptions and consultation notes remain
            strictly attributable to verified clinicians.
          </p>
        </div>
      </div>

      {/* Quick Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/medicines"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-sm group"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Formulary & Medicine Master</h3>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized brand-to-generic mappings, Schedule H/H1 classifications, and bulk CSV updates.
          </p>
        </Link>

        <Link
          href="/admin/clinical/audit"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-sm group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Clinical Audit Log & Break-Glass</h3>
          <p className="text-xs text-slate-500 mt-1">
            Review immutable access logs, EMR views, prescription signings, and emergency break-glass justifications.
          </p>
        </Link>

        <Link
          href="/admin/doctors"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-sm group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Clinician Credentials & Chambers</h3>
          <p className="text-xs text-slate-500 mt-1">
            Manage medical council registration numbers, consultation fees, and weekly chamber schedules.
          </p>
        </Link>
      </div>

      {/* Recent Clinical Audit Events Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Recent Clinical Audit Trail</span>
          </h3>
          <Link
            href="/admin/clinical/audit"
            className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
          >
            View Full Audit Log
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Patient (UHID)</th>
                <th className="py-2.5 px-4">Clinician</th>
                <th className="py-2.5 px-4">Details / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading audit events...
                  </td>
                </tr>
              ) : (data?.recent_audits || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No clinical audit events recorded yet.
                  </td>
                </tr>
              ) : (
                data.recent_audits.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {a.event_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium">
                      {a.patient?.full_name} <span className="font-mono text-slate-400">({a.patient?.uhid})</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {a.doctor?.name || 'Authorized Staff'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{a.reason || 'Routine operation'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
