'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  ChevronRight,
  User,
  Heart,
  Calendar,
  Phone,
  RefreshCw,
} from 'lucide-react'

export default function DoctorPatientsPage() {
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/patients')
      if (res.ok) {
        const json = await res.json()
        setPatients(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const filteredPatients = patients.filter((p: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.uhid && p.uhid.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Patient EMR Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access longitudinal clinical histories, past visits, and diagnostic summaries
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by UHID, patient name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
            <span>Loading patient records...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No patients found</p>
          </div>
        ) : (
          filteredPatients.map((p) => (
            <Link
              key={p.id}
              href={`/doctor/patients/${p.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {p.uhid}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {p.gender}, {p.age_years} yrs
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-teal-600 transition-colors">
                  {p.full_name}
                </h3>

                <div className="text-xs text-slate-500 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.phone || 'No phone'}</span>
                  </div>
                  <div>Blood Group: <strong className="text-slate-700 dark:text-slate-300">{p.blood_group || 'N/A'}</strong></div>
                  <div>City: <strong className="text-slate-700 dark:text-slate-300">{p.city || 'Kolkata'}</strong></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>View Full EMR Profile</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
