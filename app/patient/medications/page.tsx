'use client'

import React, { useEffect, useState } from 'react'
import {
  Pill,
  Sun,
  Sunset,
  Moon,
  Clock,
  AlertCircle,
  BellRing,
  CheckCircle2,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientMedicationsPage() {
  const { activePatientId, t } = usePatient()
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reminded, setReminded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (activePatientId) {
      loadMeds(activePatientId)
    }
  }, [activePatientId])

  const loadMeds = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/medications?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setMedications(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSetReminder = (medId: string) => {
    setReminded((prev) => ({ ...prev, [medId]: true }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.nav.medications}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Daily active medication schedule, dosage timing and refill alarms based on your doctor's prescriptions.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Pill className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No active medications right now
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            When your doctor issues a new prescription, your medication tracker will automatically sync here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medications.map((med) => (
            <div
              key={med.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center shrink-0">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {med.medicine_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 italic">
                        {med.generic_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timing Chips */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dosage:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Frequency:</span>
                    <span className="font-semibold text-teal-600">
                      {med.frequency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Instructions:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {med.instructions || med.timing_instruction || 'After meals'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  Prescribed by <span className="font-semibold text-slate-600 dark:text-slate-300">Dr. {med.doctor_name}</span> on {med.prescribed_date?.substring(0, 10)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                  {med.duration}
                </span>

                <button
                  onClick={() => handleSetReminder(med.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    reminded[med.id]
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40'
                  }`}
                >
                  {reminded[med.id] ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Reminder Set
                    </>
                  ) : (
                    <>
                      <BellRing className="h-3.5 w-3.5" />
                      Remind Me
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
