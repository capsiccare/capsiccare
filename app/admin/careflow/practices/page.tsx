'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2,
  Stethoscope,
  Users,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function DoctorPracticesPage() {
  const [practices, setPractices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  // Registration Form
  const [practiceName, setPracticeName] = useState('')
  const [leadDoctorName, setLeadDoctorName] = useState('')
  const [speciality, setSpeciality] = useState('General Medicine')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [chamberAddress, setChamberAddress] = useState('')
  const [planCode, setPlanCode] = useState('CF_PRO')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPractices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/careflow/practices')
      const data = await res.json()
      if (data.success) {
        setPractices(data.data.practices || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPractices()
  }, [])

  const handleRegisterPractice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/careflow/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceName,
          leadDoctorName,
          speciality,
          phone,
          email,
          chamberAddress,
          planCode
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsRegisterModalOpen(false)
        setPracticeName('')
        setLeadDoctorName('')
        setPhone('')
        setEmail('')
        setChamberAddress('')
        fetchPractices()
      } else {
        alert(data.error?.message || 'Failed to register practice')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPractices = practices.filter(p => {
    return searchQuery === '' ||
      p.practice_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lead_doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.speciality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.practice_code?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/careflow" className="hover:text-teal-600 transition-colors">CareFlow OS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">External Practices (Mode B)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Doctor Practice Management Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Onboard independent doctor chambers, manage isolated patient registries, and generate doctor retention value reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchPractices} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setIsRegisterModalOpen(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4" />
            Register Doctor Practice
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by practice name, doctor, code, speciality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Practice-Level Tenant Isolation Active</span>
        </div>
      </div>

      {/* Practices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPractices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            No doctor practices found. Click "Register Doctor Practice" above to onboard your first external chamber.
          </div>
        ) : (
          filteredPractices.map((practice) => (
            <div
              key={practice.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                    {practice.practice_code || 'PRAC'}
                  </Badge>
                  <Badge className="text-[10px] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    {practice.plan_code || 'CF_PRO'}
                  </Badge>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-lg group-hover:text-indigo-600 transition-colors">
                  {practice.practice_name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dr. {practice.lead_doctor_name || 'Independent Practitioner'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{practice.speciality || 'General Medicine'}</span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  {practice.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{practice.phone}</span>
                    </div>
                  )}
                  {practice.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{practice.email}</span>
                    </div>
                  )}
                  {practice.chamber_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{practice.chamber_address}</span>
                    </div>
                  )}
                </div>

                {/* Practice Metrics Preview */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Enrolled Patients</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {practice.enrolled_patients_count ?? 0}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Status</span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      {practice.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href={`/admin/careflow/practices/${practice.id}`}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 transition-colors"
                >
                  <span>Open Practice Hub & Value Report</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Practice Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Register Doctor Practice (Mode B)
            </h3>
            <p className="text-xs text-slate-500">
              Provide CareFlow as a white-labeled follow-up retention service for external clinics.
            </p>

            <form onSubmit={handleRegisterPractice} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Practice / Clinic Name *
                </label>
                <Input
                  required
                  placeholder="E.g., Dr. S. K. Das Pediatric Chamber"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Lead Doctor Name *
                  </label>
                  <Input
                    required
                    placeholder="E.g., Dr. Subrata K. Das"
                    value={leadDoctorName}
                    onChange={(e) => setLeadDoctorName(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Speciality
                  </label>
                  <Input
                    placeholder="E.g., Pediatrics & Neonatology"
                    value={speciality}
                    onChange={(e) => setSpeciality(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Phone *
                  </label>
                  <Input
                    required
                    placeholder="E.g., +91 98300 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="doctor@chamber.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chamber Address
                </label>
                <Input
                  placeholder="E.g., 42 Southern Avenue, Kolkata 700029"
                  value={chamberAddress}
                  onChange={(e) => setChamberAddress(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Service Subscription Tier
                </label>
                <select
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                >
                  <option value="CF_STARTER">Starter Plan (₹1,999/mo + ₹15/call)</option>
                  <option value="CF_PRO">Professional Plan (₹4,999/mo + ₹12/call - Recommended)</option>
                  <option value="CF_ENTERPRISE">Enterprise Multi-Chamber (₹9,999/mo + ₹9/call)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsRegisterModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting ? 'Registering...' : 'Register Practice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
