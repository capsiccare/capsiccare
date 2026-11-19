'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Video, MapPin, Calendar, Clock, User, Phone, CheckCircle2, X, Stethoscope, AlertCircle, ArrowRight, Loader2, Download, FileText } from 'lucide-react'
import { Doctor, doctorsData } from '@/data/doctors'

interface DoctorBookingDialogProps {
  doctor?: Doctor
  isOpen: boolean
  onClose: () => void
  initialMode?: 'telemedicine' | 'physical'
}

const WHATSAPP_NUMBER = '918910260709'

export function DoctorBookingDialog({
  doctor,
  isOpen,
  onClose,
  initialMode = 'physical',
}: DoctorBookingDialogProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctor?.id || doctorsData[0]?.id || '')
  const [consultationMode, setConsultationMode] = useState<'telemedicine' | 'physical'>(initialMode)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState('Male')
  const [symptoms, setSymptoms] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [confirmedToken, setConfirmedToken] = useState<number | null>(null)
  const [patientUhid, setPatientUhid] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const activeDoctor = doctor || doctorsData.find((d) => d.id === selectedDoctorId) || doctorsData[0]

  const activeFee = consultationMode === 'physical'
    ? (activeDoctor.physicalConsultationFee ?? activeDoctor.consultationFee)
    : (activeDoctor.telemedicineConsultationFee ?? activeDoctor.consultationFee)

  const activeTiming = consultationMode === 'physical'
    ? (activeDoctor.physicalTiming || activeDoctor.availability || 'Clinic Hours')
    : (activeDoctor.telemedicineTiming || 'Telemedicine Hours')

  const activeDays = consultationMode === 'physical'
    ? (activeDoctor.physicalDays || activeDoctor.availability || 'Mon - Sat')
    : (activeDoctor.telemedicineDays || 'Daily (Mon - Sun)')

  // Dynamic slots based on consultation mode and doctor's actual hours
  const slots = useMemo(() => {
    if (consultationMode === 'physical' && activeDoctor.physicalTiming) {
      return [
        `Scheduled Doctor Slot: ${activeDoctor.physicalTiming} (${activeDoctor.physicalDays || 'Clinic Day'})`,
        'Early Clinic Slot (Morning 10:00 AM - 12:00 PM)',
        'Afternoon Clinic Slot (01:00 PM - 04:00 PM)',
        'Evening Clinic Slot (05:00 PM - 08:00 PM)',
      ]
    }
    if (consultationMode === 'telemedicine' && activeDoctor.telemedicineTiming) {
      return [
        `Doctor Telemedicine Slot: ${activeDoctor.telemedicineTiming}`,
        'Morning Tele-Consultation (10:00 AM - 01:00 PM)',
        'Afternoon Tele-Consultation (02:00 PM - 05:00 PM)',
        'Evening Tele-Consultation (07:00 PM - 09:30 PM)',
      ]
    }
    return [
      'Morning (10:00 AM - 01:00 PM)',
      'Afternoon (02:00 PM - 05:00 PM)',
      'Evening (05:00 PM - 08:00 PM)',
    ]
  }, [consultationMode, activeDoctor])

  const effectiveSlot = selectedSlot || slots[0]

  if (!isOpen) return null

  const handleBooking = async () => {
    if (!patientName.trim()) {
      setErrorMessage('Please provide the patient full name.')
      return
    }
    const cleanPhone = patientPhone.trim().replace(/\D/g, '').slice(-10)
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/v1/appointments/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName.trim(),
          patient_phone: cleanPhone,
          patient_age: patientAge ? Number(patientAge) : undefined,
          patient_gender: patientGender.toLowerCase(),
          doctor_id: activeDoctor.id,
          doctor_name: activeDoctor.name,
          consultation_type: consultationMode,
          scheduled_date: selectedDate,
          slot: effectiveSlot,
          symptoms: symptoms.trim() || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to book appointment')
      }

      const apt = json.data.appointment
      const pat = json.data.patient

      setBookingRef(apt.appointment_number)
      setConfirmedToken(apt.token_number)
      setPatientUhid(pat.uhid)
      setIsSubmitted(true)
    } catch (err: any) {
      console.error('[Doctor Booking Error]:', err)
      setErrorMessage(err.message || 'Unable to confirm appointment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setPatientName('')
    setPatientPhone('')
    setPatientAge('')
    setSymptoms('')
    setErrorMessage('')
    setConfirmedToken(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-teal-200 dark:border-teal-800">
                <Stethoscope size={14} /> Doctor Consultation Booking
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Book Consultation
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Choose between physical visit at our Bankra Bazar center or assisted online telemedicine.
              </p>
            </div>

            {/* Doctor Info Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-black flex items-center justify-center text-base shrink-0 shadow-md overflow-hidden relative border border-teal-500/30">
                  {activeDoctor.image ? (
                    <Image
                      src={activeDoctor.image}
                      alt={activeDoctor.name}
                      fill
                      className={`object-cover ${activeDoctor.imagePosition || 'object-center'}`}
                      sizes="48px"
                    />
                  ) : (
                    activeDoctor.imagePlaceholder
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {activeDoctor.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    {activeDoctor.specialty}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeDoctor.qualifications || activeDoctor.designation}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Fee</span>
                <span className="text-base font-black text-teal-600 dark:text-teal-400">
                  {activeFee > 0 ? `₹${activeFee}` : 'Free'}
                </span>
                {activeDoctor.followUpFee && activeDoctor.followUpFee > 0 ? (
                  <span className="text-[9px] text-slate-400 block">F/U: ₹{activeDoctor.followUpFee}</span>
                ) : null}
              </div>
            </div>

            {/* Mode Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Consultation Mode *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationMode('physical')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                    consultationMode === 'physical'
                      ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${consultationMode === 'physical' ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <MapPin size={16} />
                    </div>
                    <span className="font-bold text-sm">Physical Visit</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bankra Bazar Clinic ({activeDoctor.physicalDays || 'Mon - Sat'}: {activeDoctor.physicalTiming || 'By Slot'})
                  </p>
                  {consultationMode === 'physical' && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-teal-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationMode('telemedicine')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                    consultationMode === 'telemedicine'
                      ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${consultationMode === 'telemedicine' ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <Video size={16} />
                    </div>
                    <span className="font-bold text-sm">Telemedicine</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Online video call ({activeDoctor.telemedicineDays || 'Daily'}: {activeDoctor.telemedicineTiming || 'Flexible'})
                  </p>
                  {consultationMode === 'telemedicine' && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-teal-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Date & Slot Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-teal-600" /> Preferred Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-teal-600" /> Preferred Time Slot *
                </label>
                <select
                  value={effectiveSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none truncate"
                >
                  {slots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patient Info Fields */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Patient Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rahul Sen"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Primary Symptoms / Health Concern (Optional)
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Routine follow-up, chest discomfort, joint pain, fever..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBooking}
                className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirming Appointment & Allocating Token...
                  </>
                ) : (
                  <>
                    Confirm &amp; Book Appointment (₹{activeFee}) <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-green-200 dark:border-green-800">
                Token #{confirmedToken || '1'} Allocated
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {bookingRef}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                Your consultation with <strong>{activeDoctor.name}</strong> ({activeDoctor.specialty}) has been confirmed.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Patient UHID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{patientUhid || 'CAP-2026-CONFIRMED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Consultation Mode:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  {consultationMode === 'telemedicine' ? (
                    <>
                      <Video size={14} className="text-teal-600" /> Assisted Telemedicine (Online)
                    </>
                  ) : (
                    <>
                      <MapPin size={14} className="text-teal-600" /> Physical Clinic Visit
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Consultation Fee:</span>
                <span className="font-black text-teal-600 dark:text-teal-400">₹{activeFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Date &amp; Slot:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDate} ({effectiveSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Patient Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{patientName} ({patientPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Location / Platform:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {consultationMode === 'physical'
                    ? 'Bankra Bazar, Dewan Para Rd, Domjur, Howrah'
                    : 'Video Link sent via WhatsApp / SMS'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const content = `
CAPSIC CARE HEALTHCARE SERVICES
==============================
OFFICIAL APPOINTMENT SLIP
==============================
Appointment No : ${bookingRef}
Queue Token    : Token #${confirmedToken || '1'}
Patient UHID   : ${patientUhid}
Doctor         : ${activeDoctor.name} (${activeDoctor.specialty})
Date & Slot    : ${selectedDate} (${effectiveSlot})
Mode           : ${consultationMode === 'physical' ? 'Physical Clinic Visit' : 'Assisted Telemedicine'}
Fee            : ₹${activeFee}

PATIENT DETAILS
---------------
Name   : ${patientName}
Phone  : ${patientPhone}
Age    : ${patientAge || 'N/A'}
Gender : ${patientGender}
${symptoms ? `Symptoms: ${symptoms}\n` : ''}
Center Address:
Capsic Care Healthcare Centre, Bankra Bazar, Dewan Para Rd, Domjur, Howrah - 711403
Helpline: +91 8910260709
Generated on: ${new Date().toLocaleString()}
                  `
                  const element = document.createElement('a')
                  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
                  element.setAttribute('download', `appointment-${bookingRef}.txt`)
                  element.style.display = 'none'
                  document.body.appendChild(element)
                  element.click()
                  document.body.removeChild(element)
                }}
                className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Download size={16} /> Download Appointment Slip
              </button>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Access Patient Portal (Track Appointment)
              </Link>

              <button
                onClick={handleReset}
                className="w-full py-2 px-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs transition-colors cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
