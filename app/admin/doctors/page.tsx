'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface DoctorItem {
  id: string
  code: string
  name: string
  slug: string
  specialty: string
  designation: string
  qualifications: string
  registrationNumber: string
  experienceYears: number
  physicalFeePaise: number
  physicalFeeInr: number
  telemedicineFeePaise: number
  telemedicineFeeInr: number
  followUpFeeInr: number
  languages: string[]
  isActive: boolean
  branches: Array<{
    id: string
    name: string
    code: string
    isPrimary: boolean
  }>
}

interface DoctorDetail extends DoctorItem {
  about?: string | null
  schedules?: Array<{
    id: string
    branchName: string
    consultationType: string
    dayOfWeek: number
    startTime: string
    endTime: string
    slotDurationMinutes: number
    isActive: boolean
  }>
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AdminDoctorsPage() {
  const { selectedBranchId, branches } = useBranch()
  const [doctors, setDoctors] = useState<DoctorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    specialty: '',
    designation: '',
    qualifications: '',
    registration_number: '',
    experience_years: 0,
    physical_fee_inr: 500,
    telemedicine_fee_inr: 400,
    branch_ids: [] as string[],
    is_active: true,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDoctors = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('q', search.trim())
      if (specialtyFilter !== 'all') params.set('specialty', specialtyFilter)
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId)
      if (statusFilter === 'active') params.set('active', 'true')
      if (statusFilter === 'inactive') params.set('active', 'false')

      const res = await fetch(`/api/v1/admin/doctors?${params.toString()}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load doctors')
      }

      setDoctors(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [selectedBranchId, specialtyFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDoctors()
  }

  const openDetailDrawer = async (doctor: DoctorItem) => {
    setIsDetailOpen(true)
    setDetailLoading(true)
    setSelectedDoctor(null)
    try {
      const res = await fetch(`/api/v1/admin/doctors/${doctor.id}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setSelectedDoctor(data.data)
      } else {
        setSelectedDoctor(doctor as DoctorDetail)
      }
    } catch {
      setSelectedDoctor(doctor as DoctorDetail)
    } finally {
      setDetailLoading(false)
    }
  }

  const openAddModal = () => {
    setFormData({
      code: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      specialty: 'General Medicine',
      designation: 'Consultant Physician',
      qualifications: 'MBBS, MD',
      registration_number: 'WBMC ',
      experience_years: 5,
      physical_fee_inr: 500,
      telemedicine_fee_inr: 400,
      branch_ids: selectedBranchId !== 'all' ? [selectedBranchId] : (branches[0] ? [branches[0].id] : []),
      is_active: true,
    })
    setFormError(null)
    setIsAddOpen(true)
  }

  const openEditModal = (doctor: DoctorItem) => {
    setSelectedDoctor(doctor as DoctorDetail)
    setFormData({
      code: doctor.code,
      name: doctor.name,
      specialty: doctor.specialty,
      designation: doctor.designation,
      qualifications: doctor.qualifications,
      registration_number: doctor.registrationNumber,
      experience_years: doctor.experienceYears,
      physical_fee_inr: doctor.physicalFeeInr,
      telemedicine_fee_inr: doctor.telemedicineFeeInr,
      branch_ids: doctor.branches.map((b) => b.id),
      is_active: doctor.isActive,
    })
    setFormError(null)
    setIsEditOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        specialty: formData.specialty.trim(),
        designation: formData.designation.trim(),
        qualifications: formData.qualifications.trim(),
        registration_number: formData.registration_number.trim(),
        experience_years: Number(formData.experience_years),
        physical_fee_paise: Math.round(Number(formData.physical_fee_inr) * 100),
        telemedicine_fee_paise: Math.round(Number(formData.telemedicine_fee_inr) * 100),
        branch_ids: formData.branch_ids,
        is_active: formData.is_active,
      }

      const res = await fetch('/api/v1/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create doctor')
      }

      setIsAddOpen(false)
      fetchDoctors()
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return
    setIsSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        specialty: formData.specialty.trim(),
        designation: formData.designation.trim(),
        qualifications: formData.qualifications.trim(),
        registration_number: formData.registration_number.trim(),
        experience_years: Number(formData.experience_years),
        physical_fee_paise: Math.round(Number(formData.physical_fee_inr) * 100),
        telemedicine_fee_paise: Math.round(Number(formData.telemedicine_fee_inr) * 100),
        branch_ids: formData.branch_ids,
        is_active: formData.is_active,
      }

      const res = await fetch(`/api/v1/admin/doctors/${selectedDoctor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update doctor')
      }

      setIsEditOpen(false)
      fetchDoctors()
    } catch (err: any) {
      setFormError(err.message || 'Failed to update doctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Extract unique specialties from existing list
  const specialties = Array.from(new Set(doctors.map((d) => d.specialty))).filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Directory</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
              {doctors.length} Registered
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage physician credentials, consultation fees (integer paise), branch OPD chambers and availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctors}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, code, specialty, or WBMC reg..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-4">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Specialty Filter */}
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDoctors} className="ml-auto text-xs border-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Doctor</th>
                <th className="px-4 py-3.5">Specialty & Designation</th>
                <th className="px-4 py-3.5">Registration & Exp</th>
                <th className="px-4 py-3.5">Consultation Fee</th>
                <th className="px-4 py-3.5">Branches</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading doctor directory from database...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-700">No doctors found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or add a new doctor.</p>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {doctor.name.replace('Dr.', '').trim().charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doctor.name}</p>
                          <span className="font-mono text-xs text-slate-400">{doctor.code}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{doctor.specialty}</p>
                      <p className="text-xs text-slate-500">{doctor.designation}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-mono text-xs text-slate-700">{doctor.registrationNumber}</p>
                      <p className="text-xs text-slate-500">{doctor.experienceYears} yrs exp • {doctor.qualifications}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doctor.physicalFeeInr}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Physical</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>₹{doctor.telemedicineFeeInr} Tele</span>
                          <span className="text-[10px] text-slate-400">({doctor.physicalFeePaise.toLocaleString()}p)</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {doctor.branches && doctor.branches.length > 0 ? (
                          doctor.branches.map((b) => (
                            <Badge
                              key={b.id}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700 font-normal border border-slate-200"
                            >
                              {b.name.replace('Diagnostic Hub', '').replace('(Synthetic)', '').trim()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No branch</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {doctor.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDrawer(doctor)}
                          className="h-8 px-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="View Profile & Schedule"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="text-xs">Schedule</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(doctor)}
                          className="h-8 px-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit Doctor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADD DOCTOR MODAL */}
      {/* ============================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Add New Doctor</h3>
                  <p className="text-xs text-slate-500">Register physician profile and OPD consultation parameters</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Dr. Amitabha Mukherjee"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Code *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. DOC-AM-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Cardiology"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Senior Consultant Cardiologist"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. MBBS, MD (Medicine), DM (Cardio)"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. WBMC 51204"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Fee (₹)</label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={formData.physical_fee_inr}
                      onChange={(e) => setFormData({ ...formData, physical_fee_inr: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm font-semibold"
                    />
                    <span className="text-[10px] text-slate-400">Stores: {(formData.physical_fee_inr * 100).toLocaleString()} paise</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tele Fee (₹)</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.telemedicine_fee_inr}
                      onChange={(e) => setFormData({ ...formData, telemedicine_fee_inr: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm font-semibold"
                    />
                    <span className="text-[10px] text-slate-400">Stores: {(formData.telemedicine_fee_inr * 100).toLocaleString()} paise</span>
                  </div>
                </div>
              </div>

              {/* Branch Association Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Affiliated Clinic Branches</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {branches.map((branch) => {
                    const isChecked = formData.branch_ids.includes(branch.id)
                    return (
                      <label key={branch.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, branch_ids: [...formData.branch_ids, branch.id] })
                            } else {
                              setFormData({
                                ...formData,
                                branch_ids: formData.branch_ids.filter((id) => id !== branch.id),
                              })
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{branch.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="add-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="add-active" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Active (Available for appointments and OPD chamber roster)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Saving...' : 'Register Doctor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT DOCTOR MODAL */}
      {/* ============================================================== */}
      {isEditOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Edit Doctor: {selectedDoctor.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedDoctor.code}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name *</label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty *</label>
                  <Input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                  <Input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications *</label>
                  <Input
                    type="text"
                    required
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number *</label>
                  <Input
                    type="text"
                    required
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Fee (₹)</label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={formData.physical_fee_inr}
                      onChange={(e) => setFormData({ ...formData, physical_fee_inr: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm font-semibold"
                    />
                    <span className="text-[10px] text-slate-400">Stores: {(formData.physical_fee_inr * 100).toLocaleString()} paise</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tele Fee (₹)</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.telemedicine_fee_inr}
                      onChange={(e) => setFormData({ ...formData, telemedicine_fee_inr: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm font-semibold"
                    />
                    <span className="text-[10px] text-slate-400">Stores: {(formData.telemedicine_fee_inr * 100).toLocaleString()} paise</span>
                  </div>
                </div>
              </div>

              {/* Branch Association Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Affiliated Clinic Branches</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {branches.map((branch) => {
                    const isChecked = formData.branch_ids.includes(branch.id)
                    return (
                      <label key={branch.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, branch_ids: [...formData.branch_ids, branch.id] })
                            } else {
                              setFormData({
                                ...formData,
                                branch_ids: formData.branch_ids.filter((id) => id !== branch.id),
                              })
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{branch.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="edit-active" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Active (Available for appointments and OPD chamber roster)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DOCTOR DETAIL & SCHEDULE DRAWER */}
      {/* ============================================================== */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Doctor Profile & Roster</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  Loading doctor profile...
                </div>
              ) : selectedDoctor ? (
                <>
                  {/* Doctor Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-slate-900">{selectedDoctor.name}</h4>
                        <p className="text-xs font-semibold text-emerald-700">{selectedDoctor.specialty}</p>
                        <p className="text-xs text-slate-500">{selectedDoctor.designation}</p>
                      </div>
                      <Badge className="font-mono text-xs bg-slate-200 text-slate-800">
                        {selectedDoctor.code}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Registration</span>
                        <span className="font-mono font-medium text-slate-700">{selectedDoctor.registrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Experience</span>
                        <span className="font-medium text-slate-700">{selectedDoctor.experienceYears} Years</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Physical Fee</span>
                        <span className="font-bold text-slate-900">₹{selectedDoctor.physicalFeeInr}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({selectedDoctor.physicalFeePaise}p)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Telemedicine Fee</span>
                        <span className="font-bold text-slate-900">₹{selectedDoctor.telemedicineFeeInr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Branches */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> Affiliated Branches
                    </h5>
                    <div className="space-y-1.5">
                      {selectedDoctor.branches && selectedDoctor.branches.length > 0 ? (
                        selectedDoctor.branches.map((b) => (
                          <div key={b.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                            <span className="font-medium text-slate-800">{b.name}</span>
                            {b.isPrimary && (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                Primary
                              </Badge>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No branches currently linked</p>
                      )}
                    </div>
                  </div>

                  {/* Weekly OPD Chamber Schedules */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> OPD Chamber Timetable
                    </h5>
                    <div className="space-y-2">
                      {selectedDoctor.schedules && selectedDoctor.schedules.length > 0 ? (
                        selectedDoctor.schedules.map((schedule) => (
                          <div key={schedule.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{DAYS[schedule.dayOfWeek]}</span>
                              <Badge variant="secondary" className="text-[10px] uppercase">
                                {schedule.consultationType}
                              </Badge>
                            </div>
                            <div className="text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}</span>
                              <span className="text-slate-400">({schedule.slotDurationMinutes} min slots)</span>
                            </div>
                            <p className="text-[11px] text-slate-400">{schedule.branchName}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                          No weekly chamber schedules recorded for this doctor yet. (Chamber slot manager will expand in Step 04)
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
