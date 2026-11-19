'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MapPin,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function BookAppointmentPage() {
  const router = useRouter()
  const { activePatientId, t } = usePatient()

  const [step, setStep] = useState(1)
  const [doctors, setDoctors] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Form State
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null)
  const [scheduledDate, setScheduledDate] = useState(() => {
    // Tomorrow by default
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [selectedSlot, setSelectedSlot] = useState('10:00:00')
  const [chiefComplaints, setChiefComplaints] = useState('')
  const [consultationType, setConsultationType] = useState<'chamber' | 'video'>('chamber')
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/patient/doctors')
      if (res.ok) {
        const json = await res.json()
        const docs = json.data || []
        setDoctors(docs)
        const specs = Array.from(new Set(docs.map((d: any) => d.specialty).filter(Boolean))) as string[]
        setSpecialties(specs)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty
    const matchesQuery =
      !searchQuery ||
      doc.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSpec && matchesQuery
  })

  const availableSlots = [
    '09:00:00',
    '09:30:00',
    '10:00:00',
    '10:30:00',
    '11:00:00',
    '11:30:00',
    '16:00:00',
    '16:30:00',
    '17:00:00',
    '17:30:00',
    '18:00:00',
  ]

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !activePatientId) return
    try {
      setSubmitting(true)
      setBookingError(null)

      const payload = {
        doctor_id: selectedDoctor.id,
        branch_id: selectedDoctor.branches?.[0]?.branch_id || selectedDoctor.branch_id || '22222222-2222-4222-a222-222222222222',
        scheduled_date: scheduledDate,
        start_time: selectedSlot,
        chief_complaints: chiefComplaints,
        type: consultationType,
      }

      const res = await fetch(`/api/v1/patient/appointments?patientId=${activePatientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to book appointment')
      }

      setBookingSuccess(json.data)
      setStep(4)
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed. This slot may already be occupied.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/patient/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Appointments
        </Link>
        <div className="text-xs font-medium text-slate-400">Step {step} of 3</div>
      </div>

      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Book Doctor Consultation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Choose a specialist, chamber slot, and confirm your clinic token.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { num: 1, label: 'Select Doctor' },
          { num: 2, label: 'Date & Slot' },
          { num: 3, label: 'Review & Confirm' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-bold'
                : step > s.num
                ? 'border-emerald-300 bg-emerald-50/50 text-emerald-700 font-semibold'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            <div className="text-xs">Step {s.num}</div>
            <div className="text-xs truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {bookingError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* STEP 1: Select Doctor */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor by name or specialty..."
              className="flex-1 text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="all">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                        Dr
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          Dr. {doc.full_name}
                        </h3>
                        <p className="text-xs text-teal-600 font-medium">{doc.specialty}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {doc.qualifications || 'MBBS, MD'} • {doc.experience_years || 5}+ yrs exp
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Fee: ₹{doc.consultation_fee || 500}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {doc.branches?.[0]?.branch_name || 'Main Chamber'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              disabled={!selectedDoctor}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition-all shadow-sm"
            >
              Continue to Slot Selection
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Date & Slot Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                Dr
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Dr. {selectedDoctor?.full_name}
                </h4>
                <p className="text-[11px] text-teal-600">{selectedDoctor?.specialty}</p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              Change Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Consultation Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('chamber')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-colors ${
                      consultationType === 'chamber'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    In-Chamber Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationType('video')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-colors ${
                      consultationType === 'video'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Tele-Consultation
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedSlot === slot
                        ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                    }`}
                  >
                    {slot.substring(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm"
            >
              Review Details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Symptoms */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Appointment Summary
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Doctor</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Dr. {selectedDoctor?.full_name}
                </div>
                <div className="text-teal-600">{selectedDoctor?.specialty}</div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Schedule</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {scheduledDate} at {selectedSlot.substring(0, 5)} hrs
                </div>
                <div className="text-slate-500 capitalize">{consultationType} Consultation</div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Consultation Fee</span>
                <div className="font-extrabold text-base text-slate-900 dark:text-white">
                  ₹{selectedDoctor?.consultation_fee || 500}
                </div>
                <span className="text-[10px] text-slate-400">Payable at clinic desk / online</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for visit / Chief symptoms (Optional)
              </label>
              <textarea
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for consulting the doctor..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Back
            </button>
            <button
              disabled={submitting}
              onClick={handleConfirmBooking}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
            >
              {submitting ? 'Confirming Booking...' : 'Confirm Consultation Booking'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success Confirmation */}
      {step === 4 && bookingSuccess && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-8 text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-200">
            Appointment Booked Successfully!
          </h2>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
            Your appointment has been registered in the CAPSIC CARE clinical scheduling system.
          </p>

          <div className="inline-block p-4 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-emerald-100 dark:border-emerald-900/60 text-left text-xs space-y-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Token Number</div>
            <div className="text-2xl font-black text-teal-600">
              #{bookingSuccess.token_number || '1'}
            </div>
            <div className="text-slate-600 dark:text-slate-300 font-medium pt-1">
              {bookingSuccess.scheduled_date} • {bookingSuccess.start_time?.substring(0, 5)}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/patient/appointments"
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
            >
              View My Appointments
            </Link>
            <Link
              href="/patient"
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
