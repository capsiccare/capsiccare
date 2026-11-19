'use client'

import React, { useEffect, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Calendar,
  FlaskConical,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientNotificationsPage() {
  const { activePatientId } = usePatient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activePatientId) {
      loadNotifications(activePatientId)
    }
  }, [activePatientId])

  const loadNotifications = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/notifications?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setNotifications(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/v1/patient/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="h-6 w-6 text-teal-600" />
          Patient Notifications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Reminders, appointment updates, test report releases and prescription alerts.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No notifications yet
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            You're all caught up! Important health reminders will arrive here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-75'
                  : 'border-teal-300 dark:border-teal-800/80 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {notif.body}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {notif.created_at?.substring(0, 16).replace('T', ' ')}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold hover:bg-teal-700 shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
