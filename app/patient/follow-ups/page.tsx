'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Clock,
  Calendar,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientFollowUpsPage() {
  const { activePatientId, t } = usePatient()
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activePatientId) {
      loadFollowUps(activePatientId)
    }
  }, [activePatientId])

  const loadFollowUps = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/follow-ups?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setFollowUps(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.nav.followUps}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Clinician-advised follow-up visits, recovery reviews and scheduled continuity reminders.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No pending follow-ups
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            You are fully up to date with your doctor recall appointments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((fu) => (
            <div
              key={fu.id}
              className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Dr. {fu.doctor_name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      Follow-up Recommended
                    </span>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    {fu.specialty}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                    Target Date: <span className="font-bold">{fu.recommended_date}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reason: {fu.reason || 'Clinical Review'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Link
                  href={`/patient/appointments/book?doctorId=${fu.doctor_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Calendar className="h-4 w-4" />
                  Book Follow-up Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
