'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  Phone,
  IndianRupee,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AvailabilitySlot } from '@/lib/modules/appointments/types'

interface BookingModalProps {
  initialDoctorId?: string
  initialChamberId?: string
  initialDate?: string
  initialSlotStart?: string
  initialSlotEnd?: string
  branchId: string
  branches: Array<{ id: string; name: string }>
  onClose: () => void
  onSuccess: (appointment: any) => void
}

interface PatientSearchItem {
  id: string
  uhid: string
  fullName: string
  phone: string
  gender: string
  ageYears: number | null
}

interface DoctorItem {
  id: string
  code: string
  name: string
  specialty: string
  physicalFeeInr: number
  physicalFeePaise: number
  branches: Array<{ id: string; name: string }>
}

interface ChamberItem {
  id: string
  name: string
  roomNumber: string
}

export function ReceptionBookingModal({
  initialDoctorId,
  initialChamberId,
  initialDate,
  initialSlotStart,
  initialSlotEnd,
  branchId,
  branches,
  onClose,
  onSuccess,
}: BookingModalProps) {
  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0]

  // Form Fields
  const [selectedBranchId, setSelectedBranchId] = useState(branchId !== 'all' ? branchId : (branches[0]?.id || ''))
  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr)
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '')
  const [selectedChamberId, setSelectedChamberId] = useState(initialChamberId || '')
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(
    initialSlotStart && initialSlotEnd ? { start: initialSlotStart, end: initialSlotEnd } : null
  )
  const [consultationType, setConsultationType] = useState<'physical' | 'telemedicine'>('physical')
  const [feeInr, setFeeInr] = useState<number>(500)
  const [chiefComplaint, setChiefComplaint] = useState('')

  // Patient Search & Selection
  const [patientQuery, setPatientQuery] = useState('')
  const [patientResults, setPatientResults] = useState<PatientSearchItem[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchItem | null>(null)
  const [isSearchingPatients, setIsSearchingPatients] = useState(false)
  const [showQuickRegister, setShowQuickRegister] = useState(false)

  // Quick Register Form State
  const [quickPatient, setQuickPatient] = useState({
    full_name: '',
    phone: '',
    gender: 'male' as const,
    age_years: 30,
  })
  const [isRegisteringPatient, setIsRegisteringPatient] = useState(false)

  // Remote data lists
  const [doctors, setDoctors] = useState<DoctorItem[]>([])
  const [chambers, setChambers] = useState<ChamberItem[]>([])
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  // Submission State
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // 1. Fetch Doctors & Chambers on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [docRes, chamberRes] = await Promise.all([
          fetch('/api/v1/admin/doctors?limit=50'),
          fetch(`/api/v1/chambers?branchId=${selectedBranchId}`),
        ])

        const docJson = await docRes.json()
        const chamberJson = await chamberRes.json()

        if (docJson.success) {
          setDoctors(docJson.data || [])
          if (!selectedDoctorId && docJson.data.length > 0) {
            setSelectedDoctorId(docJson.data[0].id)
            setFeeInr(docJson.data[0].physicalFeeInr)
          }
        }

        if (chamberJson.success) {
          setChambers(chamberJson.data || [])
          if (!selectedChamberId && chamberJson.data.length > 0) {
            setSelectedChamberId(chamberJson.data[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load doctors and chambers:', err)
      }
    }
    loadMetadata()
  }, [selectedBranchId])

  // 2. Fetch Slots whenever Doctor or Date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return

    async function loadSlots() {
      setLoadingAvailability(true)
      setAvailabilityError(null)
      try {
        const params = new URLSearchParams({
          date: selectedDate,
          branchId: selectedBranchId,
        })
        const res = await fetch(`/api/v1/doctors/${selectedDoctorId}/availability?${params.toString()}`)
        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || 'Failed to fetch doctor availability')
        }

        setAvailabilitySlots(json.data.slots || [])

        // If initial slot matches, keep it; otherwise reset if invalid
        if (json.data.slots.length > 0) {
          const firstAvailable = json.data.slots.find((s: AvailabilitySlot) => s.status === 'available')
          if (!selectedSlot && firstAvailable) {
            setSelectedSlot({ start: firstAvailable.startTime, end: firstAvailable.endTime })
            if (firstAvailable.chamberId) {
              setSelectedChamberId(firstAvailable.chamberId)
            }
          }
        }
      } catch (err: any) {
        setAvailabilityError(err.message || 'Error loading slots')
        setAvailabilitySlots([])
      } finally {
        setLoadingAvailability(false)
      }
    }

    loadSlots()
  }, [selectedDoctorId, selectedDate, selectedBranchId])

  // Update fee when doctor changes
  useEffect(() => {
    const doc = doctors.find((d) => d.id === selectedDoctorId)
    if (doc) {
      setFeeInr(doc.physicalFeeInr)
    }
  }, [selectedDoctorId, doctors])

  // 3. Debounced Patient Search
  useEffect(() => {
    if (!patientQuery.trim() || patientQuery.length < 2) {
      setPatientResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingPatients(true)
      try {
        const res = await fetch(`/api/v1/admin/patients?q=${encodeURIComponent(patientQuery.trim())}&limit=5`)
        const json = await res.json()
        if (json.success) {
          setPatientResults(json.data || [])
        }
      } catch {
        setPatientResults([])
      } finally {
        setIsSearchingPatients(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [patientQuery])

  // Quick Register Patient
  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegisteringPatient(true)
    setFormError(null)
    try {
      const res = await fetch('/api/v1/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: quickPatient.full_name,
          phone: quickPatient.phone,
          gender: quickPatient.gender,
          age_years: Number(quickPatient.age_years) || null,
          primary_branch_id: selectedBranchId,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to register patient')
      }
      setSelectedPatient({
        id: json.data.id,
        uhid: json.data.uhid,
        fullName: json.data.full_name,
        phone: json.data.phone,
        gender: json.data.gender,
        ageYears: json.data.age_years,
      })
      setShowQuickRegister(false)
    } catch (err: any) {
      setFormError(err.message || 'Error during patient registration')
    } finally {
      setIsRegisteringPatient(false)
    }
  }

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) {
      setFormError('Please select or register a patient')
      return
    }
    if (!selectedSlot) {
      setFormError('Please select an available consultation slot')
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        patient_id: selectedPatient.id,
        doctor_id: selectedDoctorId,
        branch_id: selectedBranchId,
        chamber_id: selectedChamberId || null,
        consultation_type: consultationType,
        scheduled_date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        fee_paise: Math.round(feeInr * 100),
        booking_source: 'reception',
        chief_complaint: chiefComplaint.trim() || null,
        status: 'confirmed',
      }

      const res = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Booking failed')
      }

      onSuccess(json.data)
    } catch (err: any) {
      setFormError(err.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Book Doctor Appointment</h3>
              <p className="text-xs text-slate-500">Front-desk intake, slot availability check & token issuance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION 1: Patient Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Patient Identification *
            </label>

            {selectedPatient ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {selectedPatient.uhid}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{selectedPatient.fullName}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Phone: <span className="font-mono font-medium">{selectedPatient.phone}</span> • {selectedPatient.gender} {selectedPatient.ageYears ? `• ${selectedPatient.ageYears} yrs` : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs h-7 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  Change
                </Button>
              </div>
            ) : showQuickRegister ? (
              /* Inline Quick Register */
              <form onSubmit={handleQuickRegister} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Quick Patient Registration</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickRegister(false)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Back to Search
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Full Name *</label>
                    <Input
                      required
                      placeholder="Patient name"
                      value={quickPatient.full_name}
                      onChange={(e) => setQuickPatient({ ...quickPatient, full_name: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Mobile Phone *</label>
                    <Input
                      required
                      placeholder="10-digit mobile"
                      value={quickPatient.phone}
                      onChange={(e) => setQuickPatient({ ...quickPatient, phone: e.target.value })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Gender</label>
                    <select
                      value={quickPatient.gender}
                      onChange={(e) => setQuickPatient({ ...quickPatient, gender: e.target.value as any })}
                      className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Age (Years)</label>
                    <Input
                      type="number"
                      min="0"
                      value={quickPatient.age_years}
                      onChange={(e) => setQuickPatient({ ...quickPatient, age_years: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isRegisteringPatient}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                  >
                    {isRegisteringPatient ? 'Creating UHID...' : 'Create & Select Patient'}
                  </Button>
                </div>
              </form>
            ) : (
              /* Search Input */
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search patient by UHID, phone (+91), or full name..."
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    className="pl-9 h-9 text-xs border-slate-200"
                  />
                  {isSearchingPatients && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  )}
                </div>

                {patientResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
                    {patientResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatient(p)
                          setPatientResults([])
                          setPatientQuery('')
                        }}
                        className="p-2.5 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-800">{p.uhid}</span>
                            <span className="font-medium text-xs text-slate-900">{p.fullName}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">{p.phone}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">Select</Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1.5 px-0.5">
                  <span className="text-[11px] text-slate-400">Can't find patient?</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickRegister(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Quick Register Walk-in Patient
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Doctor, Branch & Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                2. Doctor *
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Branch Hub *
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-800 focus:ring-1 focus:ring-emerald-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Consultation Date *
              </label>
              <Input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* SECTION 3: Chamber & Consultation Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Chamber / Room
              </label>
              <select
                value={selectedChamberId}
                onChange={(e) => setSelectedChamberId(e.target.value)}
                className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-800 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Auto-assign Chamber</option>
                {chambers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Consultation Type
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as any)}
                className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-800 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="physical">Physical (In-Person OPD)</option>
                <option value="telemedicine">Telemedicine (Online)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Consultation Fee (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="number"
                  min="0"
                  value={feeInr}
                  onChange={(e) => setFeeInr(parseInt(e.target.value) || 0)}
                  className="pl-8 h-9 text-xs font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Available Time Slots Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> 3. Available Chamber Slots *
              </label>
              <span className="text-[11px] text-slate-500">
                {availabilitySlots.filter((s) => s.status === 'available').length} slots available
              </span>
            </div>

            {loadingAvailability ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-emerald-600" />
                Checking doctor chamber schedules & conflict matrix...
              </div>
            ) : availabilityError ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                {availabilityError}
              </div>
            ) : availabilitySlots.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                No OPD chamber sessions scheduled for this doctor on {selectedDate}. Choose another date or doctor.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                {availabilitySlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.start === slot.startTime && selectedSlot?.end === slot.endTime
                  const isAvailable = slot.status === 'available'

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSlot({ start: slot.startTime, end: slot.endTime })
                        if (slot.chamberId) {
                          setSelectedChamberId(slot.chamberId)
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border transition-all text-center ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400'
                          : isAvailable
                          ? 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50'
                          : slot.status === 'booked'
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      }`}
                      title={slot.reason || slot.status}
                    >
                      {slot.startTime.substring(0, 5)}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* SECTION 5: Reason for Visit */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Reason for Visit / Chief Complaint (Optional)
            </label>
            <Input
              placeholder="e.g. Fever for 3 days, routine pediatric vaccination follow-up"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {selectedSlot ? (
              <span className="font-medium text-emerald-800">
                Slot: <span className="font-mono font-bold">{selectedSlot.start} - {selectedSlot.end}</span> • ₹{feeInr}
              </span>
            ) : (
              <span className="text-slate-400 italic">No slot selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={submitting || !selectedPatient || !selectedSlot}
              onClick={handleBookingSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs"
            >
              {submitting ? 'Confirming...' : 'Confirm Booking & Issue Token'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
