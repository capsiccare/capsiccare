'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  Building2,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Eye,
  Printer,
  CheckCircle2,
  XCircle,
  ListOrdered,
  Users,
  Grid3X3,
  CalendarDays,
  CalendarRange,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReceptionBookingModal } from '@/components/admin/appointments/booking-modal'
import { AppointmentSlipModal, AppointmentSlipData } from '@/components/admin/appointments/appointment-slip'
import { AppointmentRecord, AppointmentStatus } from '@/lib/modules/appointments/types'

type CalendarView = 'day' | 'week' | 'chamber'

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string; border: string }> = {
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  checked_in: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  waiting: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  in_consultation: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  completed: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  no_show: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 08:00 to 20:00

export default function AppointmentsCalendarPage() {
  const { selectedBranchId, branches } = useBranch()

  // View state
  const [viewMode, setViewMode] = useState<CalendarView>('day')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')

  // Data states
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [chambers, setChambers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals & Drawers
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingPrefill, setBookingPrefill] = useState<{
    doctorId?: string
    chamberId?: string
    date?: string
    slotStart?: string
    slotEnd?: string
  }>({})

  const [activeSlip, setActiveSlip] = useState<AppointmentSlipData | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  // 1. Fetch metadata (Doctors & Chambers)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [docRes, chamberRes] = await Promise.all([
          fetch('/api/v1/admin/doctors?limit=50'),
          fetch(`/api/v1/chambers?branchId=${selectedBranchId}`),
        ])
        const docJson = await docRes.json()
        const chamberJson = await chamberRes.json()
        if (docJson.success) setDoctors(docJson.data || [])
        if (chamberJson.success) setChambers(chamberJson.data || [])
      } catch (err) {
        console.error('Error fetching meta:', err)
      }
    }
    loadMeta()
  }, [selectedBranchId])

  // 2. Fetch Appointments based on current view and filters
  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId)
      if (selectedDoctorFilter !== 'all') params.set('doctorId', selectedDoctorFilter)
      if (selectedStatusFilter !== 'all') params.set('status', selectedStatusFilter)

      if (viewMode === 'week') {
        const curr = new Date(selectedDate)
        const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()))
        const lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6))
        params.set('startDate', firstDay.toISOString().split('T')[0])
        params.set('endDate', lastDay.toISOString().split('T')[0])
      } else {
        params.set('date', selectedDate)
      }

      params.set('limit', '100')

      const res = await fetch(`/api/v1/appointments?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load appointments')
      }

      setAppointments(json.data || [])
    } catch (err: any) {
      setError(err.message || 'Error fetching appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate, viewMode, selectedBranchId, selectedDoctorFilter, selectedStatusFilter])

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(selectedDate)
    if (viewMode === 'week') {
      d.setDate(d.getDate() - 7)
    } else {
      d.setDate(d.getDate() - 1)
    }
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNext = () => {
    const d = new Date(selectedDate)
    if (viewMode === 'week') {
      d.setDate(d.getDate() + 7)
    } else {
      d.setDate(d.getDate() + 1)
    }
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  // Open booking modal pre-filled
  const handleOpenBooking = (prefill?: typeof bookingPrefill) => {
    setBookingPrefill(prefill || { date: selectedDate })
    setIsBookingOpen(true)
  }

  // Status transition handler from drawer
  const handleStatusTransition = async (newStatus: AppointmentStatus, reason?: string) => {
    if (!selectedAppointment) return
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/v1/appointments/${selectedAppointment.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update status')
      }
      setSelectedAppointment(json.data)
      fetchAppointments()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setStatusUpdating(false)
    }
  }

  // Print slip handler
  const handlePrintSlip = (apt: AppointmentRecord) => {
    setActiveSlip({
      appointmentNumber: apt.appointmentNumber,
      tokenNumber: apt.tokenNumber,
      patientName: apt.patientName || 'Patient',
      patientUhid: apt.patientUhid || '-',
      patientPhone: apt.patientPhone || '-',
      patientGender: apt.patientGender,
      patientAge: apt.patientAge,
      doctorName: apt.doctorName || 'Doctor',
      doctorSpecialty: apt.doctorSpecialty || '',
      doctorCode: apt.doctorCode,
      branchName: apt.branchName || 'Capsic Care Diagnostic Hub',
      chamberName: apt.chamberName,
      chamberRoom: apt.chamberRoom,
      scheduledDate: apt.scheduledDate,
      startTime: apt.startTime,
      endTime: apt.endTime,
      consultationType: apt.consultationType,
      feeInr: apt.feeInr,
      status: apt.status,
      chiefComplaint: apt.chiefComplaint,
    })
  }

  // Calculate days for week view
  const getWeekDays = () => {
    const curr = new Date(selectedDate)
    const sunday = new Date(curr.setDate(curr.getDate() - curr.getDay()))
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)
      return day.toISOString().split('T')[0]
    })
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointment Calendar</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
              {appointments.length} Consultations
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time doctor chamber timetables, slot availability check, reception booking desk and queue dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/appointments/queue">
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs">
              <ListOrdered className="w-4 h-4 mr-1.5 text-emerald-600" />
              Reception Queue
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => handleOpenBooking()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Controls & Navigation Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" /> Day View
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" /> Week View
          </button>
          <button
            onClick={() => setViewMode('chamber')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'chamber' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" /> Chamber Grid
          </button>
        </div>

        {/* Center: Date Navigation */}
        <div className="flex items-center gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handlePrev} className="h-8 px-2 border-slate-200">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-medium border-slate-200">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} className="h-8 px-2 border-slate-200">
            <ChevronRight className="w-4 h-4" />
          </Button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Right: Filters & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDoctorFilter}
            onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="waiting">Waiting</option>
            <option value="in_consultation">In Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAppointments}
            disabled={loading}
            className="h-8 px-2 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchAppointments} className="ml-auto text-xs border-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 1: DAY VIEW */}
      {/* ============================================================== */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {appointments.length} Consultations Booked
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading appointments for {selectedDate}...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-800">No appointments scheduled for this date</p>
              <p className="text-xs text-slate-400">Click &ldquo;Book Appointment&rdquo; to schedule a new consultation.</p>
              <Button size="sm" onClick={() => handleOpenBooking()} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs mt-2">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Booking
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((apt) => {
                const color = STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled
                return (
                  <div
                    key={apt.id}
                    onClick={() => {
                      setSelectedAppointment(apt)
                      setIsDetailOpen(true)
                    }}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    {/* Time & Token */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex flex-col items-center justify-center border border-slate-200 shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Token</span>
                        <span className="font-mono text-base font-black text-emerald-800 leading-none">
                          #{apt.tokenNumber || 1}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {apt.startTime.substring(0, 5)} - {apt.endTime.substring(0, 5)}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">({apt.appointmentNumber})</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{apt.patientName}</h4>
                        <p className="text-xs text-slate-500">
                          UHID: <span className="font-mono text-emerald-800 font-medium">{apt.patientUhid}</span> • Phone: <span className="font-mono">{apt.patientPhone}</span>
                        </p>
                      </div>
                    </div>

                    {/* Doctor, Chamber & Fee */}
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-xs text-slate-800">{apt.doctorName}</p>
                        <p className="text-[11px] text-slate-500">{apt.doctorSpecialty}</p>
                        <span className="text-[11px] text-slate-600 block mt-0.5 font-medium">
                          {apt.chamberName || (apt.chamberRoom ? `Chamber ${apt.chamberRoom}` : 'Chamber TBD')}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${color.bg} ${color.text} ${color.border}`}
                        >
                          {apt.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-900">₹{apt.feeInr}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: WEEK VIEW */}
      {/* ============================================================== */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 divide-x divide-slate-200 bg-slate-50/70 text-center text-xs font-bold text-slate-700">
            {getWeekDays().map((dStr) => {
              const d = new Date(dStr)
              const isToday = dStr === new Date().toISOString().split('T')[0]
              const isSelected = dStr === selectedDate
              return (
                <div
                  key={dStr}
                  onClick={() => {
                    setSelectedDate(dStr)
                    setViewMode('day')
                  }}
                  className={`py-3 px-1 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-black'
                      : isToday
                      ? 'bg-teal-50/50 text-teal-800'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                    {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </span>
                  <span className="text-sm font-mono">{d.getDate()}</span>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[350px]">
            {getWeekDays().map((dStr) => {
              const dayApts = appointments.filter((a) => a.scheduledDate === dStr)
              return (
                <div key={dStr} className="p-2 space-y-2 bg-slate-50/20">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pb-1 border-b border-slate-100">
                    <span>{dayApts.length} Bookings</span>
                    <button
                      onClick={() => handleOpenBooking({ date: dStr })}
                      className="text-emerald-600 hover:text-emerald-700 p-0.5"
                      title="Book for this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {dayApts.slice(0, 4).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => {
                          setSelectedAppointment(apt)
                          setIsDetailOpen(true)
                        }}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-[11px] shadow-2xs hover:border-emerald-400 cursor-pointer transition-colors"
                      >
                        <span className="font-mono text-[10px] font-bold text-slate-500 block">
                          {apt.startTime.substring(0, 5)} • #{apt.tokenNumber || 1}
                        </span>
                        <p className="font-semibold text-slate-900 truncate">{apt.patientName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{apt.doctorName}</p>
                      </div>
                    ))}
                    {dayApts.length > 4 && (
                      <button
                        onClick={() => {
                          setSelectedDate(dStr)
                          setViewMode('day')
                        }}
                        className="w-full text-center text-[10px] text-emerald-700 font-semibold py-1 hover:underline"
                      >
                        +{dayApts.length - 4} more
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: CHAMBER GRID VIEW */}
      {/* ============================================================== */}
      {viewMode === 'chamber' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Chamber Occupancy Matrix — {selectedDate}
            </span>
            <span className="text-xs text-slate-500">
              {chambers.length} Physical Chambers Configured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200">
                  <th className="py-2.5 px-3 text-left font-bold text-slate-600 w-24">Time Band</th>
                  {chambers.map((chamber) => (
                    <th key={chamber.id} className="py-2.5 px-3 text-left font-bold text-slate-900 border-l border-slate-200">
                      <div>{chamber.name}</div>
                      <span className="text-[10px] font-normal text-slate-500 font-mono">Room {chamber.roomNumber}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HOURS.map((hour) => {
                  const hourStr = `${String(hour).padStart(2, '0')}:00`
                  const nextHourStr = `${String(hour + 1).padStart(2, '0')}:00`

                  return (
                    <tr key={hour} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-500 whitespace-nowrap bg-slate-50/40">
                        {hourStr}
                      </td>

                      {chambers.map((chamber) => {
                        // Find appointment occupying this chamber during this hour
                        const occupyingApt = appointments.find((a) => {
                          if (a.chamberId !== chamber.id) return false
                          const aStart = a.startTime
                          return aStart >= `${hourStr}:00` && aStart < `${nextHourStr}:00`
                        })

                        return (
                          <td
                            key={chamber.id}
                            className="py-1.5 px-2 border-l border-slate-100 align-top"
                          >
                            {occupyingApt ? (
                              <div
                                onClick={() => {
                                  setSelectedAppointment(occupyingApt)
                                  setIsDetailOpen(true)
                                }}
                                className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100/70 transition-all shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold text-emerald-900">
                                    {occupyingApt.startTime.substring(0, 5)} • Token #{occupyingApt.tokenNumber}
                                  </span>
                                  <Badge className="text-[9px] bg-emerald-600 text-white capitalize px-1 py-0">
                                    {occupyingApt.status}
                                  </Badge>
                                </div>
                                <p className="font-bold text-slate-900 text-xs truncate mt-0.5">{occupyingApt.patientName}</p>
                                <p className="text-[11px] text-slate-600 truncate">{occupyingApt.doctorName}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  handleOpenBooking({
                                    chamberId: chamber.id,
                                    date: selectedDate,
                                    slotStart: hourStr,
                                    slotEnd: `${String(hour).padStart(2, '0')}:15`,
                                  })
                                }
                                className="w-full py-2 text-center text-[11px] text-slate-300 hover:text-emerald-700 hover:bg-emerald-50/40 rounded border border-dashed border-transparent hover:border-emerald-300 transition-all font-mono"
                              >
                                + Available
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* APPOINTMENT DETAIL & STATUS LIFECYCLE DRAWER */}
      {/* ============================================================== */}
      {isDetailOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Appointment Details</h3>
                  <span className="font-mono text-xs text-slate-500">{selectedAppointment.appointmentNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Token & Status Banner */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Daily Token Number</span>
                  <span className="font-mono text-2xl font-black text-emerald-800">
                    #{selectedAppointment.tokenNumber || 1}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      (STATUS_COLORS[selectedAppointment.status] || STATUS_COLORS.scheduled).bg
                    } ${
                      (STATUS_COLORS[selectedAppointment.status] || STATUS_COLORS.scheduled).text
                    } ${
                      (STATUS_COLORS[selectedAppointment.status] || STATUS_COLORS.scheduled).border
                    }`}
                  >
                    {selectedAppointment.status.replace('_', ' ')}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Fee: ₹{selectedAppointment.feeInr}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Patient Identity
                </span>
                <p className="font-bold text-sm text-slate-900">{selectedAppointment.patientName}</p>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {selectedAppointment.patientUhid}
                  </span>
                  <span className="font-mono">{selectedAppointment.patientPhone}</span>
                </div>
              </div>

              {/* Doctor & Chamber */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5" /> Clinical Chamber
                </span>
                <p className="font-bold text-sm text-slate-900">{selectedAppointment.doctorName}</p>
                <p className="text-slate-500">{selectedAppointment.doctorSpecialty}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">
                    {selectedAppointment.chamberName || (selectedAppointment.chamberRoom ? `Room ${selectedAppointment.chamberRoom}` : 'Chamber TBD')}
                  </span>
                  <span className="capitalize text-slate-500 font-medium">{selectedAppointment.consultationType} Consultation</span>
                </div>
              </div>

              {/* Timing */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Scheduled Time
                </span>
                <p className="font-bold text-slate-800">
                  {new Date(selectedAppointment.scheduledDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="font-mono font-medium text-slate-700">
                  {selectedAppointment.startTime.substring(0, 5)} - {selectedAppointment.endTime.substring(0, 5)}
                </p>
              </div>

              {/* Status Transition Action Buttons */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Update Appointment State
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {selectedAppointment.status === 'scheduled' && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleStatusTransition('confirmed')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Confirm Appointment
                    </Button>
                  )}

                  {(selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleStatusTransition('checked_in')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                    >
                      Check-In Patient
                    </Button>
                  )}

                  {selectedAppointment.status === 'checked_in' && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleStatusTransition('waiting')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Mark In Waiting Room
                    </Button>
                  )}

                  {(selectedAppointment.status === 'waiting' || selectedAppointment.status === 'checked_in') && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleStatusTransition('in_consultation')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs col-span-2"
                    >
                      Call Patient into Chamber
                    </Button>
                  )}

                  {selectedAppointment.status === 'in_consultation' && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleStatusTransition('completed')}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs col-span-2"
                    >
                      Complete Consultation
                    </Button>
                  )}

                  {selectedAppointment.status !== 'completed' &&
                    selectedAppointment.status !== 'cancelled' &&
                    selectedAppointment.status !== 'no_show' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={statusUpdating}
                          onClick={() => {
                            const reason = prompt('Please enter cancellation reason:')
                            if (reason) handleStatusTransition('cancelled', reason)
                          }}
                          className="border-red-200 text-red-700 hover:bg-red-50 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={statusUpdating}
                          onClick={() => handleStatusTransition('no_show', 'Patient did not arrive')}
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs"
                        >
                          Mark No-Show
                        </Button>
                      </>
                    )}
                </div>
              </div>
            </div>

            {/* Drawer Footer with Print Slip Trigger */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintSlip(selectedAppointment)}
                className="text-xs border-slate-300"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Print Voucher Slip
              </Button>

              <Button size="sm" variant="outline" onClick={() => setIsDetailOpen(false)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RECEPTION BOOKING MODAL */}
      {/* ============================================================== */}
      {isBookingOpen && (
        <ReceptionBookingModal
          initialDoctorId={bookingPrefill.doctorId}
          initialChamberId={bookingPrefill.chamberId}
          initialDate={bookingPrefill.date || selectedDate}
          initialSlotStart={bookingPrefill.slotStart}
          initialSlotEnd={bookingPrefill.slotEnd}
          branchId={selectedBranchId}
          branches={branches}
          onClose={() => setIsBookingOpen(false)}
          onSuccess={(newApt) => {
            setIsBookingOpen(false)
            fetchAppointments()
            handlePrintSlip(newApt)
          }}
        />
      )}

      {/* ============================================================== */}
      {/* APPOINTMENT CONFIRMATION SLIP POPUP */}
      {/* ============================================================== */}
      {activeSlip && (
        <AppointmentSlipModal
          data={activeSlip}
          onClose={() => setActiveSlip(null)}
        />
      )}
    </div>
  )
}
