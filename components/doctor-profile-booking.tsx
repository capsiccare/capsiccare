'use client'

import { useState } from 'react'
import { Video, MapPin, Calendar, Clock, CheckCircle2, ArrowRight, ShieldCheck, Phone, BadgeCheck, AlertCircle } from 'lucide-react'
import { Doctor } from '@/data/doctors'
import { DoctorBookingDialog } from '@/components/doctor-booking-dialog'

interface DoctorProfileBookingProps {
  doctor: Doctor
}

export function DoctorProfileBooking({ doctor }: DoctorProfileBookingProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'telemedicine' | 'physical'>('physical')

  const currentFee = selectedMode === 'physical'
    ? (doctor.physicalConsultationFee ?? doctor.consultationFee)
    : (doctor.telemedicineConsultationFee ?? doctor.consultationFee)

  const currentDays = selectedMode === 'physical'
    ? (doctor.physicalDays || doctor.availability || 'Mon - Sat')
    : (doctor.telemedicineDays || 'Mon - Sun (Daily)')

  const currentTiming = selectedMode === 'physical'
    ? (doctor.physicalTiming || doctor.availability || 'By Appointment')
    : (doctor.telemedicineTiming || 'Flexible / Assisted Call')

  const openBooking = (mode: 'telemedicine' | 'physical') => {
    setSelectedMode(mode)
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl sticky top-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
              Appointment Booking
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Choose Consultation Type
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Fee</span>
            <span className="text-xl font-black text-teal-600 dark:text-teal-400">
              {currentFee > 0 ? `₹${currentFee}` : 'Free (₹0)'}
            </span>
            {doctor.followUpFee && doctor.followUpFee > 0 ? (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Follow-up: ₹{doctor.followUpFee}
              </span>
            ) : null}
          </div>
        </div>

        {/* Dual Mode Options */}
        <div className="space-y-3">
          {/* Physical Visit Option */}
          <div
            onClick={() => setSelectedMode('physical')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedMode === 'physical'
                ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedMode === 'physical' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <MapPin size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Physical Visit (In-Person)
                  </h4>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    At Clinic
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Bankra Bazar, Dewan Para Rd, Domjur, Howrah – 711403.
                </p>
                {doctor.physicalDays && (
                  <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 mt-1.5 flex items-center gap-1">
                    <Calendar size={12} /> {doctor.physicalDays} ({doctor.physicalTiming})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Telemedicine Option */}
          <div
            onClick={() => setSelectedMode('telemedicine')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedMode === 'telemedicine'
                ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedMode === 'telemedicine' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Video size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Assisted Telemedicine (Online)
                  </h4>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full">
                    Video Call
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Connect from home with medical assistant support & digital prescription.
                </p>
                {doctor.telemedicineDays && (
                  <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 mt-1.5 flex items-center gap-1">
                    <Clock size={12} /> {doctor.telemedicineDays} ({doctor.telemedicineTiming})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Availability Details Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <Clock size={16} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">
                {selectedMode === 'physical' ? 'Physical Clinic Hours' : 'Telemedicine Hours'}
              </span>
              <span>{currentDays}: <strong>{currentTiming}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <ShieldCheck size={16} className="text-teal-600 shrink-0" />
            <span>Verified Specialist • Instant WhatsApp Booking Confirmation</span>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => openBooking(selectedMode)}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {selectedMode === 'physical' ? (
              <>
                <MapPin size={18} /> Book Physical Clinic Visit (₹{currentFee})
              </>
            ) : (
              <>
                <Video size={18} /> Book Telemedicine Consultation (₹{currentFee})
              </>
            )}
          </button>

          <a
            href={`https://wa.me/918910260709?text=${encodeURIComponent(
              `Hello Capsic Care, I would like to book a ${selectedMode === 'physical' ? 'Physical In-Person Visit' : 'Assisted Telemedicine'} appointment with ${doctor.name} (${doctor.specialty}). Consultation Fee: ₹${currentFee}. Schedule: ${currentDays} (${currentTiming}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Phone size={14} className="text-teal-600" /> Direct WhatsApp Booking (+91 8910260709)
          </a>
        </div>

        <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
          For assisted vitals screening (ECG, Blood Sugar, Blood Pressure), visit our Bankra Bazar center during telemedicine.
        </p>
      </div>

      <DoctorBookingDialog
        doctor={doctor}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialMode={selectedMode}
      />
    </>
  )
}
