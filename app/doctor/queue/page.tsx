'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Search,
  ArrowRight,
  Activity,
  RefreshCw,
  Filter,
} from 'lucide-react'

export default function DoctorQueuePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchQueue = async () => {
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
    fetchQueue()
  }, [])

  const handleStartConsultation = async (appointmentId: string) => {
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
      console.error(e)
    }
  }

  const filteredQueue = (data?.queue || []).filter((item: any) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.patient_name.toLowerCase().includes(q) ||
      item.patient_uhid.toLowerCase().includes(q) ||
      (item.patient_phone && item.patient_phone.includes(q))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Today's Appointment Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time patient check-ins, waiting status, token sequence, and chamber flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQueue}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'scheduled', 'checked_in', 'in_consultation', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient / UHID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQueue.map((item: any) => {
          const isInConsultation = item.status === 'in_consultation'
          const isCompleted = item.status === 'completed'

          return (
            <div
              key={item.appointment_id}
              className={`border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                isInConsultation
                  ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                    Token #{item.token_number}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      isInConsultation
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                        : isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                        : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    {item.status?.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  <Link href={`/doctor/patients/${item.patient_id}`} className="hover:text-teal-600">
                    {item.patient_name}
                  </Link>
                </h3>

                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-medium">{item.patient_uhid}</span>
                  <span>•</span>
                  <span>{item.patient_age} yrs, {item.patient_gender}</span>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="font-medium text-slate-500 dark:text-slate-400 mb-0.5">Chief Complaint:</div>
                  <div className="text-slate-800 dark:text-slate-200 font-semibold">
                    {item.chief_complaint || 'General Checkup'}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.appointment_time}</span>
                </span>

                {isCompleted ? (
                  <button
                    onClick={() => {
                      if (item.encounter_id) router.push(`/doctor/consultations/${item.encounter_id}`)
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                  >
                    <span>View Note</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : isInConsultation ? (
                  <button
                    onClick={() => {
                      if (item.encounter_id) router.push(`/doctor/consultations/${item.encounter_id}`)
                      else handleStartConsultation(item.appointment_id)
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                  >
                    <span>Resume</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartConsultation(item.appointment_id)}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Consultation</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
