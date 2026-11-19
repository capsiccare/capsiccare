'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Stethoscope,
  Search,
  MapPin,
  Calendar,
  Award,
  Clock,
  Phone,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientDoctorsDirectoryPage() {
  const { t } = usePatient()
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/patient/doctors')
      if (res.ok) {
        const json = await res.json()
        setDoctors(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const specialties = ['all', ...Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean)))]

  const filtered = doctors.filter((doc) => {
    const matchesSpec = specialtyFilter === 'all' || doc.specialty === specialtyFilter
    const matchesSearch =
      !search ||
      doc.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      doc.qualifications?.toLowerCase().includes(search.toLowerCase())
    return matchesSpec && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.nav.doctors}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore CAPSIC CARE specialist clinicians, chamber schedules and consultation fees.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name, specialty, qualification..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
        >
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Specialties' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No doctors found
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or specialty filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <div className="h-14 w-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                    Dr
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      Dr. {doc.full_name}
                    </h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                      {doc.specialty}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {doc.qualifications || 'MBBS, MD'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Reg: {doc.registration_number || 'MCI / WBMC Verified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{doc.experience_years || 5}+ Years Clinical Experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Chamber: {doc.branches?.[0]?.branch_name || 'CAPSIC CARE Hub'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Consultation Fee
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    ₹{doc.consultation_fee || 500}
                  </span>
                </div>

                <Link
                  href={`/patient/appointments/book?doctorId=${doc.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
