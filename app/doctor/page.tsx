'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  FlaskConical,
  Play,
  Search,
  ArrowRight,
  Activity,
  Calendar,
  Sparkles,
  Stethoscope,
  Phone,
  RefreshCw,
} from 'lucide-react'

export default function DoctorDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [startingAptId, setStartingAptId] = useState<string | null>(null)

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/doctor/dashboard')
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
    fetchDashboard()
  }, [])

  const handleStartConsultation = async (appointmentId: string) => {
    setStartingAptId(appointmentId)
    try {
      const res = await fetch('/api/v1/doctor/consultations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      })
      if (res.ok) {
        const json = await res.json()
        const encounterId = json.data?.encounterId
        if (encounterId) {
          router.push(`/doctor/consultations/${encounterId}`)
        }
      }
    } catch (e) {
      console.error('Failed to start consultation', e)
    } finally {
      setStartingAptId(null)
    }
  }

  const filteredQueue = (data?.queue || []).filter((item: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.patient_name.toLowerCase().includes(q) ||
      item.patient_uhid.toLowerCase().includes(q) ||
      (item.patient_phone && item.patient_phone.includes(q))
    )
  })

  const nextWaiting = (data?.queue || []).find(
    (item: any) => item.status === 'checked_in' || item.status === 'scheduled' || item.status === 'confirmed'
  )

  const activeConsultation = (data?.queue || []).find(
    (item: any) => item.status === 'in_consultation'
  )

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
              OPD Session Live
            </span>
            <span className="text-xs text-teal-200/80">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {data?.doctor?.name || 'Doctor'}
          </h1>
          <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
            {data?.doctor?.specialty} • Reg No: {data?.doctor?.registration_number || 'WBMC Verified'} • Chamber: {data?.current_chamber?.chamber_name || 'Consultation Suite 1'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {activeConsultation ? (
            <button
              onClick={() => {
                if (activeConsultation.encounter_id) {
                  router.push(`/doctor/consultations/${activeConsultation.encounter_id}`)
                } else {
                  handleStartConsultation(activeConsultation.appointment_id)
                }
              }}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02]"
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Resume Current Consultation</span>
            </button>
          ) : nextWaiting ? (
            <button
              onClick={() => handleStartConsultation(nextWaiting.appointment_id)}
              disabled={startingAptId === nextWaiting.appointment_id}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-400/20 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {startingAptId === nextWaiting.appointment_id ? 'Opening Workspace...' : `Call Token #${nextWaiting.token_number}`}
              </span>
            </button>
          ) : (
            <div className="text-sm text-teal-200/80 bg-teal-900/40 px-4 py-2.5 rounded-xl border border-teal-600/30">
              No patients waiting right now
            </div>
          )}

          <button
            onClick={fetchDashboard}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Today's Total</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? '...' : data?.today_stats?.total_appointments || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Booked slots</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Waiting</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {loading ? '...' : data?.today_stats?.waiting_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Checked in</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>In Session</span>
            <Activity className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
            {loading ? '...' : data?.today_stats?.in_consultation_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">In chamber</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {loading ? '...' : data?.today_stats?.completed_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Finished visits</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Pending Sign</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {loading ? '...' : data?.today_stats?.pending_prescriptions_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Rx drafts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Test Reports</span>
            <FlaskConical className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {loading ? '...' : data?.today_stats?.reports_pending_review_count || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Orders placed</p>
        </div>
      </div>

      {/* Main Queue & Quick Patient Search Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Today's Consultation Queue</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any checked-in patient to open the single-screen clinical workspace
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by UHID, patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Vitals Status</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                    <span>Loading consultation queue...</span>
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No appointments found in today's queue</p>
                    <p className="text-xs text-slate-400 mt-1">Reception staff can check in scheduled or walk-in patients.</p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item: any) => {
                  const isInConsultation = item.status === 'in_consultation'
                  const isCompleted = item.status === 'completed'

                  return (
                    <tr
                      key={item.appointment_id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isInConsultation ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          #{item.token_number}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          <Link
                            href={`/doctor/patients/${item.patient_id}`}
                            className="hover:text-teal-600 hover:underline"
                          >
                            {item.patient_name}
                          </Link>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="font-mono text-teal-600 dark:text-teal-400 font-medium">
                            {item.patient_uhid}
                          </span>
                          <span>•</span>
                          <span>{item.patient_age} yrs, {item.patient_gender}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {item.has_vitals ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                            <Activity className="w-3 h-3" />
                            <span>Recorded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        {item.chief_complaint || 'General checkup / Follow-up'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                            item.status === 'in_consultation'
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                              : item.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                              : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                          }`}
                        >
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isCompleted ? (
                          <button
                            onClick={() => {
                              if (item.encounter_id) {
                                router.push(`/doctor/consultations/${item.encounter_id}`)
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <span>Review Note</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : isInConsultation ? (
                          <button
                            onClick={() => {
                              if (item.encounter_id) {
                                router.push(`/doctor/consultations/${item.encounter_id}`)
                              } else {
                                handleStartConsultation(item.appointment_id)
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-sm"
                          >
                            <span>Resume Consultation</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartConsultation(item.appointment_id)}
                            disabled={startingAptId === item.appointment_id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{startingAptId === item.appointment_id ? 'Starting...' : 'Start Consult'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Launch & Specialty Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/doctor/patients"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-sm group"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Longitudinal EMR</h3>
          <p className="text-xs text-slate-500 mt-1">
            Access complete historical medical records, past diagnoses, vitals trends, and outside hospital documents.
          </p>
        </Link>

        <Link
          href="/doctor/templates"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-sm group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Clinical Templates & Bundles</h3>
          <p className="text-xs text-slate-500 mt-1">
            Rapid 1-click note templates for Pediatrics, Cardiology, General Medicine, Ortho, and favorite prescription sets.
          </p>
        </Link>

        <Link
          href="/doctor/analytics"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-sm group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Practice Payouts & Analytics</h3>
          <p className="text-xs text-slate-500 mt-1">
            Track completed consultations, verified gross fee earnings, contractual facility deductions, and settled payouts.
          </p>
        </Link>
      </div>
    </div>
  )
}
