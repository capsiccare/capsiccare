'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ListOrdered,
  Users,
  Clock,
  UserCheck,
  Stethoscope,
  Building2,
  Calendar,
  Printer,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Phone,
  Timer,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReceptionBookingModal } from '@/components/admin/appointments/booking-modal'
import { AppointmentSlipModal, AppointmentSlipData } from '@/components/admin/appointments/appointment-slip'
import { AppointmentStatus } from '@/lib/modules/appointments/types'

interface QueueItem {
  id: string
  appointmentNumber: string
  tokenNumber: number | null
  patientId: string
  patientName: string
  patientUhid: string
  patientPhone: string
  patientGender?: string
  patientAge?: number | null
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  doctorCode?: string
  branchId: string
  branchName: string
  chamberId?: string | null
  chamberName?: string | null
  chamberRoom?: string | null
  consultationType: string
  scheduledDate: string
  startTime: string
  endTime: string
  feePaise: number
  feeInr: number
  status: AppointmentStatus
  chiefComplaint?: string | null
  checkInTime?: string | null
  consultationStartTime?: string | null
  consultationEndTime?: string | null
  waitingMinutes?: number | null
}

interface QueueSummary {
  total: number
  inConsultation: number
  waiting: number
  confirmed: number
  completed: number
  cancelled: number
  date: string
}

export default function ReceptionQueuePage() {
  const { selectedBranchId, branches } = useBranch()

  const [queue, setQueue] = useState<QueueItem[]>([])
  const [summary, setSummary] = useState<QueueSummary>({
    total: 0,
    inConsultation: 0,
    waiting: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // Booking & Slip Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [activeSlip, setActiveSlip] = useState<AppointmentSlipData | null>(null)

  const fetchQueue = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId)

      const res = await fetch(`/api/v1/appointments/queue?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to fetch reception queue')
      }

      setQueue(json.data.items || [])
      setSummary(json.data.summary || {})
    } catch (err: any) {
      setError(err.message || 'Error loading reception queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
  }, [selectedBranchId])

  // Polling every 15 seconds if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchQueue()
    }, 15000)
    return () => clearInterval(interval)
  }, [autoRefresh, selectedBranchId])

  // Quick action status transition
  const handleAction = async (aptId: string, targetStatus: AppointmentStatus, reason?: string) => {
    setActionInProgress(aptId)
    try {
      const res = await fetch(`/api/v1/appointments/${aptId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, reason }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Action failed')
      }
      fetchQueue()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionInProgress(null)
    }
  }

  const handlePrint = (item: QueueItem) => {
    setActiveSlip({
      appointmentNumber: item.appointmentNumber,
      tokenNumber: item.tokenNumber,
      patientName: item.patientName,
      patientUhid: item.patientUhid,
      patientPhone: item.patientPhone,
      patientGender: item.patientGender,
      patientAge: item.patientAge,
      doctorName: item.doctorName,
      doctorSpecialty: item.doctorSpecialty,
      doctorCode: item.doctorCode,
      branchName: item.branchName,
      chamberName: item.chamberName,
      chamberRoom: item.chamberRoom,
      scheduledDate: item.scheduledDate,
      startTime: item.startTime,
      endTime: item.endTime,
      consultationType: item.consultationType,
      feeInr: item.feeInr,
      status: item.status,
      chiefComplaint: item.chiefComplaint,
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/appointments" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Today&rsquo;s Reception Queue</h1>
            <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Terminal
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time patient intake, token sequencing, arrival timestamps, waiting room triage and consultation progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            Auto-Sync (15s)
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            disabled={loading}
            className="h-8 border-slate-200 text-slate-700 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsBookingOpen(true)}
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Walk-in Booking
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Chamber</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{summary.inConsultation}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Active with Doctor</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Waiting Lobby</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{summary.waiting}</p>
          <span className="text-[11px] text-purple-600 font-medium">Checked-in & Triage</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Today</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{summary.confirmed}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Awaiting Arrival</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{summary.completed}</p>
          <span className="text-[11px] text-slate-500 font-medium">Consultations Done</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.total}</p>
          <span className="text-[11px] text-slate-400 font-medium">{summary.cancelled} cancelled / no-show</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchQueue} className="ml-auto text-xs border-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* Main Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Patient Consultation Run-Sheet ({queue.length} Patients)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Date: {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-16">Token</th>
                <th className="px-4 py-3">Patient & UHID</th>
                <th className="px-4 py-3">Physician & Chamber</th>
                <th className="px-4 py-3">Timing & Wait</th>
                <th className="px-4 py-3 text-center">Lifecycle Status</th>
                <th className="px-5 py-3 text-right">Quick Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading today&rsquo;s reception queue...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <ListOrdered className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-800">Queue is currently empty for today</p>
                    <p className="text-xs text-slate-400 mt-1">Book a walk-in patient or check appointments calendar.</p>
                  </td>
                </tr>
              ) : (
                queue.map((item) => {
                  const isBusy = actionInProgress === item.id

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.status === 'in_consultation'
                          ? 'bg-indigo-50/30 font-medium'
                          : item.status === 'waiting'
                          ? 'bg-purple-50/20'
                          : item.status === 'completed'
                          ? 'opacity-60 bg-slate-50/40'
                          : ''
                      }`}
                    >
                      {/* Token # */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-mono text-base font-black text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 inline-block">
                          #{String(item.tokenNumber || 1).padStart(2, '0')}
                        </span>
                      </td>

                      {/* Patient Details */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">{item.patientName}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono text-emerald-800 font-semibold">{item.patientUhid}</span>
                          <span>•</span>
                          <span className="font-mono">{item.patientPhone}</span>
                        </div>
                      </td>

                      {/* Doctor & Chamber */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800 text-xs">{item.doctorName}</p>
                        <p className="text-[11px] text-slate-500">{item.doctorSpecialty}</p>
                        <span className="text-[11px] text-slate-700 font-medium block mt-0.5">
                          {item.chamberName || (item.chamberRoom ? `Chamber ${item.chamberRoom}` : 'Chamber TBD')}
                        </span>
                      </td>

                      {/* Timings & Waiting */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-xs">
                          <span className="font-mono font-medium text-slate-800 block">
                            Slot: {item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}
                          </span>

                          {item.waitingMinutes !== null && item.waitingMinutes !== undefined && item.status !== 'completed' && (
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                                item.waitingMinutes > 30 ? 'text-rose-600' : 'text-purple-700'
                              }`}
                            >
                              <Timer className="w-3 h-3" />
                              {item.waitingMinutes}m waiting
                            </span>
                          )}

                          {item.status === 'completed' && (
                            <span className="text-[11px] text-slate-400 font-mono">Consultation Done</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            item.status === 'in_consultation'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              : item.status === 'waiting'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : item.status === 'checked_in'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : item.status === 'completed'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : item.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Desk Action Buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Print Slip Icon Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(item)}
                            className="h-8 px-2 text-slate-500 hover:text-slate-800"
                            title="Print Appointment Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>

                          {/* Lifecycle Triggers */}
                          {item.status === 'scheduled' && (
                            <Button
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(item.id, 'confirmed')}
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Confirm
                            </Button>
                          )}

                          {(item.status === 'scheduled' || item.status === 'confirmed') && (
                            <Button
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(item.id, 'checked_in')}
                              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              Check-In
                            </Button>
                          )}

                          {item.status === 'checked_in' && (
                            <Button
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(item.id, 'waiting')}
                              className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Mark Waiting
                            </Button>
                          )}

                          {(item.status === 'waiting' || item.status === 'checked_in') && (
                            <Button
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(item.id, 'in_consultation')}
                              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                              Call to Chamber
                            </Button>
                          )}

                          {item.status === 'in_consultation' && (
                            <Button
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(item.id, 'completed')}
                              className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white"
                            >
                              Complete
                            </Button>
                          )}

                          {item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'no_show' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => {
                                if (confirm(`Mark patient ${item.patientName} as No-Show?`)) {
                                  handleAction(item.id, 'no_show', 'Patient failed to report to clinic')
                                }
                              }}
                              className="h-8 px-2 text-xs border-slate-200 text-slate-500 hover:text-red-600"
                            >
                              No-Show
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <ReceptionBookingModal
          branchId={selectedBranchId}
          branches={branches}
          onClose={() => setIsBookingOpen(false)}
          onSuccess={(newApt) => {
            setIsBookingOpen(false)
            fetchQueue()
            handlePrint(newApt)
          }}
        />
      )}

      {/* Slip Modal */}
      {activeSlip && (
        <AppointmentSlipModal
          data={activeSlip}
          onClose={() => setActiveSlip(null)}
        />
      )}
    </div>
  )
}
