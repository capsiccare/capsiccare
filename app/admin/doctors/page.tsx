'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Trash2,
  DoorClosed,
  AlertTriangle,
  ChevronRight,
  X,
  CalendarOff,
  User,
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

interface DoctorScheduleItem {
  id: string
  branchId: string
  branchName: string
  chamberId?: string | null
  chamberName?: string | null
  chamberRoom?: string | null
  consultationType: 'physical' | 'telemedicine'
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDurationMinutes: number
  maxPatientsPerSlot: number
  isActive: boolean
}

interface ScheduleExceptionItem {
  id: string
  branchId?: string | null
  branchName?: string
  exceptionDate: string
  exceptionType: 'leave' | 'holiday' | 'extended_hours' | 'cancelled'
  startTime?: string | null
  endTime?: string | null
  reason?: string | null
  createdAt?: string
}

interface DoctorDetail extends DoctorItem {
  about?: string | null
  schedules?: DoctorScheduleItem[]
  exceptions?: ScheduleExceptionItem[]
}

interface ChamberItem {
  id: string
  branchId: string
  branchName?: string
  name: string
  roomNumber: string
  floor?: string
  isActive: boolean
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AdminDoctorsPage() {
  const { selectedBranchId, branches } = useBranch()
  const [doctors, setDoctors] = useState<DoctorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chambers state
  const [chambers, setChambers] = useState<ChamberItem[]>([])

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
  const [drawerTab, setDrawerTab] = useState<'profile' | 'schedules' | 'exceptions'>('schedules')

  // Chamber Management Modal
  const [isChambersOpen, setIsChambersOpen] = useState(false)
  const [isAddChamberOpen, setIsAddChamberOpen] = useState(false)
  const [chamberForm, setChamberForm] = useState({
    branch_id: '',
    name: 'Consultation Chamber',
    room_number: '',
    floor: 'Ground Floor',
    is_active: true,
  })
  const [chamberSubmitting, setChamberSubmitting] = useState(false)
  const [chamberError, setChamberError] = useState<string | null>(null)

  // Doctor Form State
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

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<DoctorScheduleItem | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    branch_id: '',
    chamber_id: '',
    consultation_type: 'physical' as 'physical' | 'telemedicine',
    day_of_week: 1, // Monday default
    start_time: '09:00',
    end_time: '13:00',
    slot_duration_minutes: 15,
    max_patients_per_slot: 1,
    is_active: true,
  })
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  // Exception / Leave Modal State
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false)
  const [exceptionForm, setExceptionForm] = useState({
    branch_id: '', // empty = all branches
    exception_date: new Date().toISOString().split('T')[0],
    exception_type: 'leave' as 'leave' | 'holiday' | 'cancelled' | 'extended_hours',
    start_time: '',
    end_time: '',
    reason: '',
  })
  const [exceptionSubmitting, setExceptionSubmitting] = useState(false)
  const [exceptionError, setExceptionError] = useState<string | null>(null)

  // 1. Fetch Doctors
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

  // 2. Fetch Chambers
  const fetchChambers = async () => {
    try {
      const res = await fetch('/api/v1/chambers?active=true')
      const data = await res.json()
      if (res.ok && data.success) {
        setChambers(data.data || [])
      }
    } catch {
      // Non-blocking fallback
    }
  }

  useEffect(() => {
    fetchDoctors()
    fetchChambers()
  }, [selectedBranchId, specialtyFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDoctors()
  }

  // Reload selected doctor detail drawer
  const reloadDoctorDetail = async (doctorId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/doctors/${doctorId}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setSelectedDoctor(data.data)
      }
    } catch {
      // fallback
    }
  }

  const openDetailDrawer = async (doctor: DoctorItem, initialTab: 'profile' | 'schedules' | 'exceptions' = 'schedules') => {
    setIsDetailOpen(true)
    setDrawerTab(initialTab)
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
      if (selectedDoctor) reloadDoctorDetail(selectedDoctor.id)
    } catch (err: any) {
      setFormError(err.message || 'Failed to update doctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // SCHEDULE CRUD HANDLERS
  // ============================================================================

  const openAddScheduleModal = () => {
    if (!selectedDoctor) return
    const defaultBranchId =
      selectedDoctor.branches && selectedDoctor.branches.length > 0
        ? selectedDoctor.branches[0].id
        : branches[0]?.id || ''
    const availableChambers = chambers.filter((c) => c.branchId === defaultBranchId)

    setEditingSchedule(null)
    setScheduleForm({
      branch_id: defaultBranchId,
      chamber_id: availableChambers[0]?.id || '',
      consultation_type: 'physical',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '13:00',
      slot_duration_minutes: 15,
      max_patients_per_slot: 1,
      is_active: true,
    })
    setScheduleError(null)
    setIsScheduleModalOpen(true)
  }

  const openEditScheduleModal = (s: DoctorScheduleItem) => {
    setEditingSchedule(s)
    setScheduleForm({
      branch_id: s.branchId,
      chamber_id: s.chamberId || '',
      consultation_type: s.consultationType,
      day_of_week: s.dayOfWeek,
      start_time: (s.startTime || '09:00').slice(0, 5),
      end_time: (s.endTime || '13:00').slice(0, 5),
      slot_duration_minutes: s.slotDurationMinutes || 15,
      max_patients_per_slot: s.maxPatientsPerSlot || 1,
      is_active: s.isActive,
    })
    setScheduleError(null)
    setIsScheduleModalOpen(true)
  }

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return
    setScheduleSubmitting(true)
    setScheduleError(null)

    try {
      if (scheduleForm.end_time <= scheduleForm.start_time) {
        throw new Error('End time must be later than start time')
      }

      const payload = {
        doctor_id: selectedDoctor.id,
        branch_id: scheduleForm.branch_id,
        chamber_id: scheduleForm.chamber_id || null,
        consultation_type: scheduleForm.consultation_type,
        day_of_week: Number(scheduleForm.day_of_week),
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        slot_duration_minutes: Number(scheduleForm.slot_duration_minutes),
        max_patients_per_slot: Number(scheduleForm.max_patients_per_slot),
        is_active: scheduleForm.is_active,
      }

      let res
      if (editingSchedule) {
        res = await fetch(`/api/v1/doctor-schedules/${editingSchedule.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/v1/doctor-schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to save schedule session')
      }

      setIsScheduleModalOpen(false)
      await reloadDoctorDetail(selectedDoctor.id)
      fetchDoctors()
    } catch (err: any) {
      setScheduleError(err.message || 'Error saving timetable session')
    } finally {
      setScheduleSubmitting(false)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedDoctor) return
    if (!confirm('Are you sure you want to remove this weekly OPD session?')) return

    try {
      const res = await fetch(`/api/v1/doctor-schedules/${scheduleId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to delete schedule')
      }
      await reloadDoctorDetail(selectedDoctor.id)
      fetchDoctors()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // ============================================================================
  // SCHEDULE EXCEPTION (LEAVE / HOLIDAY) HANDLERS
  // ============================================================================

  const openAddExceptionModal = () => {
    if (!selectedDoctor) return
    setExceptionForm({
      branch_id: '',
      exception_date: new Date().toISOString().split('T')[0],
      exception_type: 'leave',
      start_time: '',
      end_time: '',
      reason: '',
    })
    setExceptionError(null)
    setIsExceptionModalOpen(true)
  }

  const handleSaveException = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return
    setExceptionSubmitting(true)
    setExceptionError(null)

    try {
      const payload: Record<string, any> = {
        doctor_id: selectedDoctor.id,
        branch_id: exceptionForm.branch_id || null,
        exception_date: exceptionForm.exception_date,
        exception_type: exceptionForm.exception_type,
        reason: exceptionForm.reason.trim() || null,
      }

      if (exceptionForm.start_time.trim()) payload.start_time = exceptionForm.start_time
      if (exceptionForm.end_time.trim()) payload.end_time = exceptionForm.end_time

      const res = await fetch('/api/v1/doctor-schedules/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to record schedule exception')
      }

      setIsExceptionModalOpen(false)
      await reloadDoctorDetail(selectedDoctor.id)
    } catch (err: any) {
      setExceptionError(err.message || 'Error recording schedule exception')
    } finally {
      setExceptionSubmitting(false)
    }
  }

  const handleDeleteException = async (exceptionId: string) => {
    if (!selectedDoctor) return
    if (!confirm('Cancel this recorded leave/holiday exception?')) return

    try {
      const res = await fetch(`/api/v1/doctor-schedules/exceptions?id=${exceptionId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to delete exception')
      }
      await reloadDoctorDetail(selectedDoctor.id)
    } catch (err: any) {
      alert(err.message)
    }
  }

  // ============================================================================
  // CHAMBER CREATION HANDLER
  // ============================================================================

  const handleCreateChamberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChamberSubmitting(true)
    setChamberError(null)

    try {
      const payload = {
        branch_id: chamberForm.branch_id || branches[0]?.id,
        name: chamberForm.name.trim(),
        room_number: chamberForm.room_number.trim(),
        floor: chamberForm.floor.trim(),
        is_active: chamberForm.is_active,
      }

      const res = await fetch('/api/v1/chambers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create chamber')
      }

      setIsAddChamberOpen(false)
      fetchChambers()
      setChamberForm({
        branch_id: branches[0]?.id || '',
        name: 'Consultation Chamber',
        room_number: '',
        floor: 'Ground Floor',
        is_active: true,
      })
    } catch (err: any) {
      setChamberError(err.message || 'Failed to create chamber')
    } finally {
      setChamberSubmitting(false)
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Capsic Care" className="w-7 h-7 object-contain inline-block" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Directory & Roster</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
              {doctors.length} Registered
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage physician credentials, integer paise consultation fees, physical chamber timetables, and leave management.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchChambers()
              setIsChambersOpen(true)
            }}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
          >
            <DoorClosed className="w-4 h-4 mr-1.5 text-slate-500" />
            Chambers & Rooms
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchDoctors()
              fetchChambers()
            }}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
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
              className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-4 text-xs">
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
        </div>
      )}

      {/* Doctors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Doctor & Credentials</th>
                <th className="py-3 px-4">Specialty & Designation</th>
                <th className="py-3 px-4">Affiliated Branches</th>
                <th className="py-3 px-4">Consultation Fees</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading medical directory...
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No doctors match the selected search and branch filters.
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {doctor.name.replace(/^Dr\.\s*/i, '').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{doctor.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                              {doctor.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">
                            {doctor.registrationNumber} • {doctor.qualifications}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-xs">{doctor.specialty}</div>
                      <div className="text-[11px] text-slate-500">{doctor.designation}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {doctor.branches && doctor.branches.length > 0 ? (
                          doctor.branches.map((b) => (
                            <Badge
                              key={b.id}
                              variant="outline"
                              className={`text-[10px] ${
                                b.isPrimary
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {b.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No branch linked</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">₹{doctor.physicalFeeInr}</span>
                        <span className="text-slate-400 text-[10px] block">
                          Tele: ₹{doctor.telemedicineFeeInr}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {doctor.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailDrawer(doctor, 'schedules')}
                          className="h-8 px-2.5 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-medium"
                          title="OPD Timetable & Chambers"
                        >
                          <Clock className="w-3.5 h-3.5 mr-1" /> Timetable
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(doctor)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                          title="Edit Doctor Info"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Register New Doctor</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Doctor Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    placeholder="e.g. DOC-101"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name (with Dr.) *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Dr. Subrata Majumdar"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Specialty *</label>
                  <Input
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                    placeholder="e.g. Cardiology"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Designation *</label>
                  <Input
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                    placeholder="e.g. Senior Consultant"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Qualifications *</label>
                  <Input
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    required
                    placeholder="e.g. MBBS, MD (Med), DM"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Registration No. *</label>
                  <Input
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    required
                    placeholder="e.g. WBMC 48192"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Experience (Yrs)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Physical Fee (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.physical_fee_inr}
                    onChange={(e) => setFormData({ ...formData, physical_fee_inr: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telemed Fee (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.telemedicine_fee_inr}
                    onChange={(e) => setFormData({ ...formData, telemedicine_fee_inr: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Branch Association */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Affiliated Clinic Hubs</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2.5">
                  {branches.map((branch) => {
                    const checked = formData.branch_ids.includes(branch.id)
                    return (
                      <label key={branch.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={checked}
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Registering...' : 'Register Doctor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT DOCTOR MODAL */}
      {/* ============================================================== */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">Edit Doctor Details</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Doctor Code</label>
                  <Input value={formData.code} disabled className="h-8 text-xs font-mono bg-slate-50" />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Specialty *</label>
                  <Input
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Designation *</label>
                  <Input
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Qualifications *</label>
                  <Input
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Registration No. *</label>
                  <Input
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Experience (Yrs)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Physical Fee (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.physical_fee_inr}
                    onChange={(e) => setFormData({ ...formData, physical_fee_inr: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telemed Fee (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.telemedicine_fee_inr}
                    onChange={(e) => setFormData({ ...formData, telemedicine_fee_inr: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Branch Association */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Affiliated Clinic Hubs</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2.5">
                  {branches.map((branch) => {
                    const checked = formData.branch_ids.includes(branch.id)
                    return (
                      <label key={branch.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={checked}
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
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DOCTOR DETAIL & ROSTER SIDE DRAWER */}
      {/* ============================================================== */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Capsic Care" className="w-6 h-6 object-contain inline-block" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedDoctor ? selectedDoctor.name : 'Doctor Profile & Roster'}
                  </h3>
                  {selectedDoctor && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      {selectedDoctor.code} • {selectedDoctor.specialty}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 text-xs font-medium">
              <button
                onClick={() => setDrawerTab('schedules')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  drawerTab === 'schedules'
                    ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                OPD Chamber Timetable
                {selectedDoctor?.schedules && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                    {selectedDoctor.schedules.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setDrawerTab('exceptions')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  drawerTab === 'exceptions'
                    ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarOff className="w-3.5 h-3.5" />
                Leaves & Exceptions
                {selectedDoctor?.exceptions && selectedDoctor.exceptions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                    {selectedDoctor.exceptions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setDrawerTab('profile')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  drawerTab === 'profile'
                    ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Credentials & Bio
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
                  Loading doctor profile & roster...
                </div>
              ) : selectedDoctor ? (
                <>
                  {/* TAB 1: OPD CHAMBER TIMETABLE */}
                  {drawerTab === 'schedules' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Weekly OPD Chamber Roster</h4>
                          <p className="text-xs text-slate-500">Configure weekly chamber slots, consultation hours and patient limits.</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={openAddScheduleModal}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Session
                        </Button>
                      </div>

                      {/* Schedule Sessions List */}
                      <div className="space-y-2.5">
                        {selectedDoctor.schedules && selectedDoctor.schedules.length > 0 ? (
                          selectedDoctor.schedules
                            .slice()
                            .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                            .map((schedule) => (
                              <div
                                key={schedule.id}
                                className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                                      {DAYS[schedule.dayOfWeek]}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={`text-[10px] capitalize ${
                                        schedule.consultationType === 'physical'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : 'bg-purple-50 text-purple-800 border-purple-200'
                                      }`}
                                    >
                                      {schedule.consultationType}
                                    </Badge>
                                    {!schedule.isActive && (
                                      <Badge variant="outline" className="text-[10px] text-slate-400">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => openEditScheduleModal(schedule)}
                                      className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                                      title="Edit Session"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSchedule(schedule.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                                      title="Delete Session"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Chamber & Time Details */}
                                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Chamber Room</span>
                                    <span className="font-semibold text-slate-800">
                                      {schedule.chamberName || (schedule.chamberRoom ? `Room ${schedule.chamberRoom}` : 'General OPD Chamber')}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block truncate">
                                      {schedule.branchName}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Consultation Window</span>
                                    <span className="font-mono font-bold text-slate-900">
                                      {(schedule.startTime || '00:00').slice(0, 5)} - {(schedule.endTime || '00:00').slice(0, 5)}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                      {schedule.slotDurationMinutes} min / slot • {schedule.maxPatientsPerSlot || 1} pt max
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500">
                              No weekly OPD chamber sessions currently scheduled for Dr. {selectedDoctor.name}.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={openAddScheduleModal}
                              className="text-xs text-emerald-700 border-emerald-300"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add First OPD Session
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LEAVES & EXCEPTIONS */}
                  {drawerTab === 'exceptions' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Leaves & Roster Exceptions</h4>
                          <p className="text-xs text-slate-500">
                            Manage leaves, emergency cancellations, and clinic holidays. The booking engine automatically blocks these dates.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={openAddExceptionModal}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Record Leave
                        </Button>
                      </div>

                      {/* Exceptions List */}
                      <div className="space-y-2.5">
                        {selectedDoctor.exceptions && selectedDoctor.exceptions.length > 0 ? (
                          selectedDoctor.exceptions.map((ex) => (
                            <div
                              key={ex.id}
                              className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`text-[10px] capitalize font-bold ${
                                      ex.exceptionType === 'leave'
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : ex.exceptionType === 'cancelled'
                                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                                        : ex.exceptionType === 'holiday'
                                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    }`}
                                  >
                                    {ex.exceptionType.replace('_', ' ')}
                                  </Badge>

                                  <span className="font-bold text-xs text-slate-900">
                                    {new Date(ex.exceptionDate).toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleDeleteException(ex.id)}
                                  className="text-xs text-slate-400 hover:text-rose-600 p-1"
                                  title="Cancel exception"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-xs text-slate-600">
                                <p className="font-medium text-slate-800">{ex.reason || 'Medical Director Notice'}</p>
                                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                  <span>Scope: {ex.branchName || 'All Branches'}</span>
                                  {ex.startTime && ex.endTime ? (
                                    <span>Time: {ex.startTime.slice(0, 5)} - {ex.endTime.slice(0, 5)}</span>
                                  ) : (
                                    <span>Full Day</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                            <CalendarOff className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500">
                              No leaves or schedule cancellations recorded. Dr. {selectedDoctor.name} is fully active according to weekly roster.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CREDENTIALS & BIO */}
                  {drawerTab === 'profile' && (
                    <div className="space-y-5">
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
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration</span>
                            <span className="font-mono font-medium text-slate-700">{selectedDoctor.registrationNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Experience</span>
                            <span className="font-medium text-slate-700">{selectedDoctor.experienceYears} Years</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Physical Fee</span>
                            <span className="font-bold text-slate-900">₹{selectedDoctor.physicalFeeInr}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({selectedDoctor.physicalFeePaise} paise)</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Telemedicine Fee</span>
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

                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsDetailOpen(false)
                            openEditModal(selectedDoctor)
                          }}
                          className="text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Physician Profile
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsDetailOpen(false)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD / EDIT SCHEDULE MODAL */}
      {/* ============================================================== */}
      {isScheduleModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingSchedule ? 'Edit OPD Chamber Session' : 'Add Weekly OPD Session'}
                </h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-3.5 text-xs">
              {scheduleError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                  {scheduleError}
                </div>
              )}

              {/* Day of Week & Consultation Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Day of Week *</label>
                  <select
                    value={scheduleForm.day_of_week}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: parseInt(e.target.value) })}
                    className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                  >
                    {DAYS.map((day, idx) => (
                      <option key={day} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Consultation Type *</label>
                  <select
                    value={scheduleForm.consultation_type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, consultation_type: e.target.value as any })}
                    className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                  >
                    <option value="physical">Physical OPD</option>
                    <option value="telemedicine">Telemedicine</option>
                  </select>
                </div>
              </div>

              {/* Branch & Chamber Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Clinic Branch *</label>
                  <select
                    value={scheduleForm.branch_id}
                    onChange={(e) => {
                      const newBranchId = e.target.value
                      const filteredChambers = chambers.filter((c) => c.branchId === newBranchId)
                      setScheduleForm({
                        ...scheduleForm,
                        branch_id: newBranchId,
                        chamber_id: filteredChambers[0]?.id || '',
                      })
                    }}
                    className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Chamber Room</label>
                  <select
                    value={scheduleForm.chamber_id}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, chamber_id: e.target.value })}
                    className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                  >
                    <option value="">No Room Assigned (General)</option>
                    {chambers
                      .filter((c) => !scheduleForm.branch_id || c.branchId === scheduleForm.branch_id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          Room {c.roomNumber} - {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Start Time & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Session Start *</label>
                  <Input
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Session End *</label>
                  <Input
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Slot Duration & Max Patients */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Slot Duration</label>
                  <select
                    value={scheduleForm.slot_duration_minutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, slot_duration_minutes: parseInt(e.target.value) })}
                    className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                  >
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes (Standard)</option>
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Patients / Slot</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={scheduleForm.max_patients_per_slot}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, max_patients_per_slot: parseInt(e.target.value) || 1 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sched-active"
                  checked={scheduleForm.is_active}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, is_active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="sched-active" className="text-xs text-slate-700 cursor-pointer">
                  Session active on reception booking calendar
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={scheduleSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {scheduleSubmitting ? 'Saving...' : editingSchedule ? 'Save Changes' : 'Create Session'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RECORD LEAVE / EXCEPTION MODAL */}
      {/* ============================================================== */}
      {isExceptionModalOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Record Leave / OPD Exception</h3>
              </div>
              <button
                onClick={() => setIsExceptionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveException} className="p-6 space-y-3.5 text-xs">
              {exceptionError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
                  {exceptionError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Exception Date *</label>
                  <Input
                    type="date"
                    value={exceptionForm.exception_date}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, exception_date: e.target.value })}
                    required
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Type *</label>
                  <select
                    value={exceptionForm.exception_type}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, exception_type: e.target.value as any })}
                    className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                  >
                    <option value="leave">Doctor Leave</option>
                    <option value="cancelled">OPD Cancelled (Emergency)</option>
                    <option value="holiday">Clinic Holiday</option>
                    <option value="extended_hours">Extended OPD Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Branch Scope</label>
                <select
                  value={exceptionForm.branch_id}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, branch_id: e.target.value })}
                  className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                >
                  <option value="">All Branches (Doctor Unavailable Everywhere)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Time Window (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Time (Optional)</label>
                  <Input
                    type="time"
                    value={exceptionForm.start_time}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, start_time: e.target.value })}
                    placeholder="HH:MM"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Time (Optional)</label>
                  <Input
                    type="time"
                    value={exceptionForm.end_time}
                    onChange={(e) => setExceptionForm({ ...exceptionForm, end_time: e.target.value })}
                    placeholder="HH:MM"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Leave start/end time empty if doctor is unavailable for the entire day.</p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason / Notes</label>
                <Input
                  value={exceptionForm.reason}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                  placeholder="e.g. Attending National Cardiology Summit, Personal Leave"
                  className="h-8 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsExceptionModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={exceptionSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {exceptionSubmitting ? 'Recording...' : 'Record Exception'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CHAMBER ROOMS MODAL */}
      {/* ============================================================== */}
      {isChambersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <DoorClosed className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Clinic Chamber Rooms & Hubs</h3>
              </div>
              <button
                onClick={() => {
                  setIsChambersOpen(false)
                  setIsAddChamberOpen(false)
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Physical rooms and OPD chambers across all diagnostic hubs.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsAddChamberOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Chamber Room
                </Button>
              </div>

              {/* Inline Add Chamber Form */}
              {isAddChamberOpen && (
                <form onSubmit={handleCreateChamberSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Create Physical Chamber Room</span>
                    <button
                      type="button"
                      onClick={() => setIsAddChamberOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      &times;
                    </button>
                  </div>

                  {chamberError && (
                    <div className="p-2 bg-red-50 text-red-800 rounded text-xs">{chamberError}</div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-medium">Branch Hub *</label>
                      <select
                        value={chamberForm.branch_id}
                        onChange={(e) => setChamberForm({ ...chamberForm, branch_id: e.target.value })}
                        className="w-full h-8 text-xs rounded border border-slate-200 bg-white px-2"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-medium">Room Number *</label>
                      <Input
                        value={chamberForm.room_number}
                        onChange={(e) => setChamberForm({ ...chamberForm, room_number: e.target.value })}
                        placeholder="e.g. 101, 102, CH-1"
                        required
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-medium">Chamber Name *</label>
                      <Input
                        value={chamberForm.name}
                        onChange={(e) => setChamberForm({ ...chamberForm, name: e.target.value })}
                        placeholder="e.g. Cardiology OPD Chamber"
                        required
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-medium">Floor</label>
                      <Input
                        value={chamberForm.floor}
                        onChange={(e) => setChamberForm({ ...chamberForm, floor: e.target.value })}
                        placeholder="e.g. Ground Floor, 1st Floor"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddChamberOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={chamberSubmitting} className="bg-emerald-600 text-white">
                      {chamberSubmitting ? 'Creating...' : 'Save Chamber'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Chambers List */}
              <div className="space-y-2">
                {chambers.length > 0 ? (
                  chambers.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Room {c.roomNumber}
                          </span>
                          <span className="font-bold text-slate-800">{c.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {c.branchName} • {c.floor || 'Ground Floor'}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={c.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]' : 'text-slate-400 text-[10px]'}
                      >
                        {c.isActive ? 'Active Room' : 'Inactive'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No physical chamber rooms created yet.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsChambersOpen(false)} className="text-xs">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
