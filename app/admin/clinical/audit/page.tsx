'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  ChevronLeft,
  RefreshCw,
  Search,
  Lock,
} from 'lucide-react'

export default function AdminClinicalAuditPage() {
  const [loading, setLoading] = useState(true)
  const [audits, setAudits] = useState<any[]>([])

  useEffect(() => {
    async function loadAudit() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/clinical/governance')
        if (res.ok) {
          const json = await res.json()
          setAudits(json.data?.recent_audits || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadAudit()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/clinical"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Clinical Audit Trail & Break-Glass Access</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all patient medical record views, prescription signings, and emergency access overrides
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Clinician / Staff</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No clinical audit records found.
                  </td>
                </tr>
              ) : (
                audits.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                        {a.event_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {a.patient?.full_name} <span className="font-mono text-slate-400">({a.patient?.uhid})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {a.doctor?.name || 'Staff User'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{a.reason || 'Operational'}</td>
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
