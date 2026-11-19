'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  AlertCircle,
  FileCheck,
  XCircle,
  Printer,
  ChevronRight,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientAppointmentsPage() {
  const { activePatientId, t } = usePatient()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (activePatientId) {
      loadAppointments(activePatientId)
    }
  }, [activePatientId])

  const loadAppointments = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/appointments?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setAppointments(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (aptId: string) => {
    try {
      const res = await fetch(`/api/v1/patient/appointments/${aptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by patient' }),
      })
      if (res.ok) {
        setCancellingId(null)
        setCancelReason('')
        if (activePatientId) loadAppointments(activePatientId)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'upcoming') return apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'in_progress'
    if (activeTab === 'completed') return apt.status === 'completed'
    if (activeTab === 'cancelled') return apt.status === 'cancelled' || apt.status === 'no_show'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.appointments}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your doctor consultations, chamber bookings and visit confirmation slips.
          </p>
        </div>
        <Link
          href="/patient/appointments/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Book New Consultation
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 text-xs font-bold capitalize transition-colors relative ${
              activeTab === tab
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No {activeTab} appointments found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'You have no consultations scheduled. Book an appointment with a top specialist now.'
              : `No appointments are currently marked as ${activeTab}.`}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/patient/appointments/book"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
            >
              Book an Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-teal-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-base shrink-0 border border-teal-200/50 dark:border-teal-800/40">
                  Dr
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Dr. {apt.doctor?.full_name || 'Specialist'}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    {apt.doctor?.specialty || 'General Physician'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-teal-600" />
                      {apt.scheduled_date} at {apt.start_time?.substring(0, 5)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {apt.branch?.name || 'Clinic Chamber'}
                    </span>
                    {apt.token_number && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-bold">
                        Token #{apt.token_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setSelectedSlip(apt)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  View Slip
                </button>

                {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                  <button
                    onClick={() => setCancellingId(apt.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Appointment Confirmation Slip
                </h3>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-teal-600 font-semibold uppercase">Token Number</span>
                  <div className="text-xl font-black text-teal-800 dark:text-teal-200">
                    #{selectedSlip.token_number || '1'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-medium">Appointment ID</span>
                  <div className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                    {selectedSlip.id.substring(0, 8)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Doctor</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    Dr. {selectedSlip.doctor?.full_name}
                  </div>
                  <div className="text-slate-500">{selectedSlip.doctor?.specialty}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Date & Time</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedSlip.scheduled_date}
                  </div>
                  <div className="text-slate-500">{selectedSlip.start_time?.substring(0, 5)} hrs</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Chamber Location</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSlip.branch?.name || 'CAPSIC CARE Clinic'}
                </div>
                <div className="text-slate-500">{selectedSlip.branch?.address || 'Main Clinic Hub'}</div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-[11px]">
                Please arrive 15 minutes prior to your scheduled consultation time. Bring any previous prescriptions and lab investigation records with you.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Slip (A4)
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Dialog */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Cancel Appointment
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this consultation? This slot will be released for other waiting patients.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better, urgent travel..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingId(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleCancel(cancellingId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
