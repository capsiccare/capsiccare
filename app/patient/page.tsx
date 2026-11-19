'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  FileText,
  FlaskConical,
  CreditCard,
  ArrowRight,
  Clock,
  Activity,
  Heart,
  Droplet,
  ChevronRight,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'
import { PatientDashboardData } from '@/lib/modules/patient-portal/types'

export default function PatientDashboardPage() {
  const { t, activePatientId, context } = usePatient()
  const [data, setData] = useState<PatientDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activePatientId) {
      loadDashboard(activePatientId)
    }
  }, [activePatientId])

  const loadDashboard = async (patientId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/dashboard?patientId=${patientId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    )
  }

  const patientName = data?.patient.full_name || context?.patient.full_name || 'Patient'
  const uhid = data?.patient.uhid || context?.patient.uhid
  const stats = data?.stats

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-200">
              <span>{data?.greeting || t.dashboard.welcome}</span>
              <span className="h-1 w-1 rounded-full bg-teal-300" />
              <span className="font-mono bg-teal-900/60 px-2 py-0.5 rounded border border-teal-500/30">
                {uhid}
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {patientName}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-teal-100/90 max-w-xl">
              {t.tagline}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/patient/appointments/book"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-800 hover:bg-teal-50 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              {t.dashboard.bookDoctor}
            </Link>
            <Link
              href="/patient/diagnostics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600/60 hover:bg-teal-600 border border-teal-400/40 text-white text-xs font-bold transition-all active:scale-95"
            >
              <FlaskConical className="h-4 w-4" />
              {t.dashboard.bookLab}
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.nextAppointment}</span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-slate-900 dark:text-white truncate">
              {data?.upcoming_appointment ? (
                <>
                  {data.upcoming_appointment.scheduled_date}
                  <span className="text-xs font-normal text-slate-500 block truncate">
                    Dr. {data.upcoming_appointment.doctor_name}
                  </span>
                </>
              ) : (
                <span className="text-xs font-normal text-slate-400">No upcoming visits</span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.activePrescriptions}</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.active_prescriptions_count || 0}
            </div>
            <span className="text-[11px] text-slate-400">Finalized e-prescriptions</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.pendingReports}</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <FlaskConical className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats?.available_reports_count || 0}
            </div>
            <span className="text-[11px] text-slate-400">Available to download</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.dueBalance}</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{Number(stats?.outstanding_balance_inr || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">Current statement balance</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {t.dashboard.quickActions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/patient/appointments/book"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/60 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.bookDoctor}</div>
              <div className="text-[10px] text-slate-500">Chamber or video</div>
            </div>
          </Link>

          <Link
            href="/patient/home-collection"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/60 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Lab at Home</div>
              <div className="text-[10px] text-slate-500">Doorstep sample pickup</div>
            </div>
          </Link>

          <Link
            href="/patient/prescriptions"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/60 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.viewPrescriptions}</div>
              <div className="text-[10px] text-slate-500">View & print Rx</div>
            </div>
          </Link>

          <Link
            href="/patient/health-records"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/60 hover:shadow-sm transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.dashboard.medicalRecords}</div>
              <div className="text-[10px] text-slate-500">Longitudinal timeline</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Next Appointment & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Appointment Detailed Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600" />
              {t.dashboard.nextAppointment}
            </h3>
            <Link
              href="/patient/appointments"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              All Appointments
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data?.upcoming_appointment ? (
            <div className="rounded-xl border border-teal-100 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                    Dr
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      Dr. {data.upcoming_appointment.doctor_name}
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                      {data.upcoming_appointment.doctor_specialty}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {data.upcoming_appointment.branch_name}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    {data.upcoming_appointment.scheduled_date} @ {data.upcoming_appointment.start_time?.substring(0, 5)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 capitalize">
                    Status: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.upcoming_appointment.status}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-teal-200/50 dark:border-teal-900/40 flex items-center justify-end gap-2">
                <Link
                  href="/patient/appointments"
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Manage / Cancel
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
              <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">No upcoming consultations scheduled.</p>
              <Link
                href="/patient/appointments/book"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Schedule an appointment now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Follow-up Alert if available */}
          {data?.active_follow_up && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Doctor Follow-up Due
                </h5>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  You have a clinical follow-up scheduled with Dr. {data.active_follow_up.doctor_name} for{' '}
                  {data.active_follow_up.follow_up_date}.
                </p>
                <Link
                  href="/patient/follow-ups"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-100 underline"
                >
                  Confirm follow-up booking
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Health Status & Shortcuts */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-teal-600" />
            Care Profile Summary
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
              <span className="text-slate-500">Blood Group</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data?.patient.blood_group || 'O+'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
              <span className="text-slate-500">Age / Gender</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data?.patient.age_years || 28} Y / {data?.patient.gender || 'M'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
              <span className="text-slate-500">Contact Mobile</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {data?.patient.phone || '--'}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/patient/health-records"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Activity className="h-3.5 w-3.5" />
                View Longitudinal Health Timeline
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Finalized Prescription Preview */}
      {data?.recent_prescription && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Latest Active Prescription
            </h3>
            <Link
              href="/patient/prescriptions"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              All Prescriptions
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Dr. {data.recent_prescription.doctor_name}
              </div>
              <div className="text-[11px] text-slate-500">
                Prescription #{data.recent_prescription.prescription_number} • Issued: {data.recent_prescription.prescription_date} • {data.recent_prescription.items_count} medications
              </div>
            </div>
            <Link
              href="/patient/prescriptions"
              className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors"
            >
              View & Print
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
