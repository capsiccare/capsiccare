'use client'

import { useState } from 'react'
import { Stethoscope, ArrowRight, Star, Search, Award, Video, MapPin, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Doctor } from '@/data/doctors'
import { DoctorBookingDialog } from '@/components/doctor-booking-dialog'

interface DoctorsDirectoryProps {
  doctors: Doctor[]
}

export function DoctorsDirectory({ doctors }: DoctorsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All')
  const [activeDoctorForBooking, setActiveDoctorForBooking] = useState<Doctor | null>(null)
  const [bookingMode, setBookingMode] = useState<'telemedicine' | 'physical'>('telemedicine')
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const specialties = ['All', ...Array.from(new Set(doctors.map((d) => d.specialty)))]

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.designation.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const openBooking = (doc: Doctor, mode: 'telemedicine' | 'physical') => {
    setActiveDoctorForBooking(doc)
    setBookingMode(mode)
    setIsBookingOpen(true)
  }

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="max-w-4xl mx-auto mb-12 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Search by doctor name, specialty, or condition..."
          />
        </div>

        {/* Specialty Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Consultation Highlights Banner */}
      <div className="mb-12 p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-500/20">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">
            Dual Consultation Modes
          </span>
          <h3 className="text-2xl font-black">Choose How You Want to Consult</h3>
          <p className="text-sm text-teal-100/80 max-w-xl">
            Book an <strong>Assisted Telemedicine Video Consultation</strong> from home or nearby touchpoints, or visit our specialist doctor <strong>In-Person at Bankra Bazar Clinic</strong>.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2.5 text-xs font-bold">
            <Video size={16} className="text-teal-400" /> Assisted Telemedicine
          </div>
          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2.5 text-xs font-bold">
            <MapPin size={16} className="text-teal-400" /> In-Clinic Visit
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:border-teal-500/50 transition-all duration-300 flex flex-col h-full group"
          >
            {/* Image Header */}
            <div className="relative h-64 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {doctor.image ? (
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  className={`object-cover ${doctor.imagePosition || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <span className="text-6xl font-black text-slate-400 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500">
                  {doctor.imagePlaceholder}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
                <span className="px-3 py-1 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                  <Star size={12} className="fill-current" /> Top Rated
                </span>
                <span className="px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-teal-800 dark:text-teal-300 text-xs font-black rounded-full border border-teal-500/30 shadow-md">
                  {doctor.consultationFee > 0 ? `₹${doctor.consultationFee} / Visit` : 'Free Consultation'}
                </span>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-900">
                  {doctor.specialty}
                </span>
                {doctor.experience && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {doctor.experience} Exp
                  </span>
                )}
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                {doctor.name}
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">
                {doctor.designation}
              </p>
              <p className="text-slate-700 dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
                {doctor.description}
              </p>

              {/* Consultation Fee Pill */}
              <div className="mb-4 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Consultation Fee:</span>
                <span className="font-black text-teal-700 dark:text-teal-300 text-sm">
                  {doctor.consultationFee > 0 ? `₹${doctor.consultationFee}` : 'Free (₹0)'}
                </span>
              </div>

              {/* Dual Booking Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => openBooking(doctor, 'telemedicine')}
                  className="py-2 px-3 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-teal-200 dark:border-teal-800"
                >
                  <Video size={14} /> Telemedicine
                </button>
                <button
                  type="button"
                  onClick={() => openBooking(doctor, 'physical')}
                  className="py-2 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <MapPin size={14} /> In-Person
                </button>
              </div>

              {/* View Profile Link */}
              <div className="pt-2 mt-auto">
                <Link
                  href={`/doctors/${doctor.id}`}
                  className="flex items-center justify-between text-slate-900 dark:text-white font-bold text-xs hover:text-teal-600 dark:hover:text-teal-400 transition-colors group/link"
                >
                  View Profile & Schedule
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover/link:bg-teal-50 dark:group-hover/link:bg-teal-900/30 transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Dialog Modal */}
      {activeDoctorForBooking && (
        <DoctorBookingDialog
          doctor={activeDoctorForBooking}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          initialMode={bookingMode}
        />
      )}
    </>
  )
}
