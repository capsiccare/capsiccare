'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react'

export default function DoctorSchedulePage() {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<any[]>([])

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/doctor/schedule')
        if (res.ok) {
          const json = await res.json()
          setSchedules(json.data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadSchedule()
  }, [])

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Doctor Schedule & Chamber Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly consultation chambers, recurring slot timings, and branch assignments
          </p>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
            <span>Loading schedule...</span>
          </div>
        ) : schedules.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No active weekly schedules configured</p>
            <p className="mt-1">Administrators configure your weekly chambers in the Admin Scheduling module.</p>
          </div>
        ) : (
          schedules.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {daysOfWeek[s.day_of_week] || `Day ${s.day_of_week}`}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  {s.consultation_type}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-semibold font-mono">{s.start_time} - {s.end_time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{s.branch?.name || 'Main Branch'}</span>
                </div>
                {s.chamber && (
                  <div>
                    Chamber: <strong className="text-slate-900 dark:text-white">{s.chamber.name}</strong> (Room {s.chamber.room_number})
                  </div>
                )}
                <div>Slot Duration: <span className="font-semibold">{s.slot_duration_minutes} mins</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
