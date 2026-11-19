'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Stethoscope,
  Users,
  Clock,
  Star,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function DoctorProductivityPage() {
  const { selectedBranchId } = useBranch()
  const [timeframe, setTimeframe] = useState<string>('last_30_days')
  const [searchQuery, setSearchQuery] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL')
  const [doctorMetrics, setDoctorMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDoctorMatrix = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/analytics/doctors?timeframe=${timeframe}${branchParam}`)
      const json = await res.json()
      if (json.success) {
        setDoctorMetrics(json.data.doctorMetrics || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctorMatrix()
  }, [timeframe, selectedBranchId])

  const filteredDoctors = doctorMetrics.filter((doc) => {
    const matchesSearch =
      searchQuery === '' ||
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSpecialty = specialtyFilter === 'ALL' || doc.specialty?.toUpperCase() === specialtyFilter.toUpperCase()

    return matchesSearch && matchesSpecialty
  })

  const totalCompleted = doctorMetrics.reduce((acc, d) => acc + (d.appointmentsCompleted || 0), 0)
  const totalRevenue = doctorMetrics.reduce((acc, d) => acc + (d.consultationRevenue || 0), 0)
  const avgUtilization = doctorMetrics.length > 0 ? Math.round(doctorMetrics.reduce((acc, d) => acc + (d.utilizationRate || 0), 0) / doctorMetrics.length) : 0

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Doctor Productivity Matrix</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-indigo-600" />
            Doctor Productivity & Clinical Operational Matrix
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consultation completion volumes, chamber utilization, repeat patient continuity, and patient satisfaction ratings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <option value="today">Today</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="current_month">Current Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="current_financial_year">Financial Year</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchDoctorMatrix} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Clinical Quality Disclaimer Callout */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Clinical Governance Standard:</strong> Doctors are evaluated holistically across punctuality, patient review continuity, and satisfaction. CAPSIC CARE OS explicitly separates patient consultation volume from clinical quality and does not rank doctors purely on revenue or diagnostic conversion rates.
        </p>
      </div>

      {/* Aggregate Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Doctors</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {doctorMetrics.length}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Completed Consultations</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
            {totalCompleted}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Consultation Billed Total</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/20 shadow-xs">
          <div className="text-xs font-semibold text-teal-800 dark:text-teal-300">Average Chamber Utilization</div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-300 mt-1">
            {avgUtilization}%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search doctor by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="text-xs border rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">All Specialties</option>
            <option value="GENERAL MEDICINE">General Medicine</option>
            <option value="PEDIATRICS">Pediatrics</option>
            <option value="CARDIOLOGY">Cardiology</option>
            <option value="GYNECOLOGY">Gynecology</option>
            <option value="ORTHOPEDICS">Orthopedics</option>
          </select>
        </div>
      </div>

      {/* Doctor Productivity Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Doctor & Specialty</th>
                <th className="px-4 py-3">Fee (INR)</th>
                <th className="px-4 py-3">Booked / Completed</th>
                <th className="px-4 py-3">No-Shows / Cancel</th>
                <th className="px-4 py-3">Chamber Utilization</th>
                <th className="px-4 py-3">Repeat Visit %</th>
                <th className="px-4 py-3">Satisfaction</th>
                <th className="px-4 py-3 text-right">Revenue Contrib.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No doctor records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.doctorId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        Dr. {doc.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {doc.specialty}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                      ₹{doc.consultationFee}
                    </td>

                    <td className="px-4 py-3.5 text-xs">
                      <span className="font-bold text-emerald-600">{doc.appointmentsCompleted}</span>
                      <span className="text-slate-400"> / {doc.appointmentsBooked}</span>
                    </td>

                    <td className="px-4 py-3.5 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{doc.noShows} no-show</span>
                      <span className="text-slate-400"> • {doc.appointmentsCancelled} can</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, doc.utilizationRate)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-semibold">{doc.utilizationRate}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono">
                      <span className="font-semibold text-teal-600">{doc.repeatVisitRate}%</span>
                      <span className="text-[10px] text-slate-400 block">{doc.repeatPatientsCount} repeat pts</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{doc.satisfactionRating}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-sm text-slate-900 dark:text-white">
                      ₹{doc.consultationRevenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
