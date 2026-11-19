'use client'

import React, { useEffect, useState } from 'react'
import {
  Activity,
  Calendar,
  FileText,
  FlaskConical,
  Heart,
  Droplet,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientHealthRecordsPage() {
  const { activePatientId, t } = usePatient()
  const [timeline, setTimeline] = useState<any[]>([])
  const [summary, setSummary] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (activePatientId) {
      loadRecords(activePatientId)
    }
  }, [activePatientId])

  const loadRecords = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/health-records?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setTimeline(json.data.timeline || [])
        setSummary(json.data.summary || null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTimeline = timeline.filter((item) => {
    if (filterType === 'all') return true
    return item.type === filterType
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.nav.records}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete chronological timeline of your consultations, vitals, electronic prescriptions, and diagnostic results.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Consultations</span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {summary?.consultations_count || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Prescriptions</span>
          <div className="mt-2 text-2xl font-black text-blue-600">
            {summary?.prescriptions_count || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Lab Reports</span>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {summary?.reports_count || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Vitals Recorded</span>
          <div className="mt-2 text-2xl font-black text-rose-500">
            {summary?.vitals_count || 0}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'consultation', label: 'Consultations' },
          { id: 'prescription', label: 'Prescriptions' },
          { id: 'lab_report', label: 'Lab Reports' },
          { id: 'vitals', label: 'Vitals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chronological Timeline */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No health records found
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Clinical entries and reports will populate here as care is provided.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredTimeline.map((item, idx) => {
            const isPrescription = item.type === 'prescription'
            const isConsultation = item.type === 'consultation'
            const isReport = item.type === 'lab_report'
            const isVitals = item.type === 'vitals'

            return (
              <div key={item.id || idx} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                    isPrescription
                      ? 'bg-blue-600'
                      : isConsultation
                      ? 'bg-teal-600'
                      : isReport
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-teal-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.type.replace('_', ' ')} • {item.date?.substring(0, 10)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.date?.substring(11, 16) || ''}
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>

                  {/* Vitals metrics chip */}
                  {isVitals && item.data && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {item.data.systolic_bp && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold">
                          BP: {item.data.systolic_bp}/{item.data.diastolic_bp} mmHg
                        </span>
                      )}
                      {item.data.pulse_rate && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                          HR: {item.data.pulse_rate} bpm
                        </span>
                      )}
                      {item.data.random_blood_sugar && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                          RBS: {item.data.random_blood_sugar} mg/dL
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
