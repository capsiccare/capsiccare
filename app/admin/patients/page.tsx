'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Building2,
  Calendar,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  RefreshCw,
  AlertCircle,
  FileText,
  Activity,
  Heart,
  ShieldCheck,
  MapPin,
  ClipboardList,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface PatientItem {
  id: string
  uhid: string
  fullName: string
  phone: string
  email: string | null
  gender: string
  dateOfBirth: string | null
  ageYears: number | null
  bloodGroup: string | null
  addressLine1: string | null
  landmark: string | null
  city: string
  district: string
  state: string
  pincode: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  isActive: boolean
  primaryBranchId: string
  branchName: string
  createdAt: string
  updatedAt: string
}

interface PatientDetail extends PatientItem {
  contacts?: Array<{
    id: string
    contact_type: string
    value: string
    is_primary: boolean
    is_verified: boolean
  }>
  consents?: Array<{
    id: string
    consent_type: string
    is_granted: boolean
    granted_at: string
  }>
  appointments?: Array<{
    id: string
    appointmentNumber: string
    consultationType: string
    scheduledDate: string
    startTime: string
    status: string
    feeInr: number
    doctorName: string
    specialty: string
  }>
  orders?: Array<{
    id: string
    orderNumber: string
    status: string
    fulfillmentType: string
    totalInr: number
    paymentStatus: string
    createdAt: string
  }>
}

export default function AdminPatientsPage() {
  const { selectedBranchId, branches } = useBranch()
  const [patients, setPatients] = useState<PatientItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modals & Drawers
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailTab, setDetailTab] = useState<'overview' | 'appointments' | 'orders'>('overview')

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'male' as 'male' | 'female' | 'other',
    age_years: 30,
    date_of_birth: '',
    blood_group: 'B+' as any,
    address_line1: '',
    landmark: '',
    city: 'Howrah',
    district: 'Howrah',
    pincode: '711409',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    primary_branch_id: '',
    is_active: true,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPatients = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('q', search.trim())
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId)
      if (statusFilter === 'active') params.set('active', 'true')
      if (statusFilter === 'inactive') params.set('active', 'false')

      const res = await fetch(`/api/v1/admin/patients?${params.toString()}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load patients')
      }

      setPatients(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [selectedBranchId, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPatients()
  }

  const openDetailDrawer = async (patient: PatientItem) => {
    setIsDetailOpen(true)
    setDetailLoading(true)
    setDetailTab('overview')
    setSelectedPatient(null)
    try {
      const res = await fetch(`/api/v1/admin/patients/${patient.id}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setSelectedPatient(data.data)
      } else {
        setSelectedPatient(patient as PatientDetail)
      }
    } catch {
      setSelectedPatient(patient as PatientDetail)
    } finally {
      setDetailLoading(false)
    }
  }

  const openRegisterModal = () => {
    const defaultBranchId = selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || '')
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      gender: 'male',
      age_years: 30,
      date_of_birth: '',
      blood_group: 'B+',
      address_line1: '',
      landmark: '',
      city: 'Howrah',
      district: 'Howrah',
      pincode: '711409',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      primary_branch_id: defaultBranchId,
      is_active: true,
    })
    setFormError(null)
    setIsRegisterOpen(true)
  }

  const openEditModal = (patient: PatientItem) => {
    setSelectedPatient(patient as PatientDetail)
    setFormData({
      full_name: patient.fullName,
      phone: patient.phone,
      email: patient.email || '',
      gender: (patient.gender as any) || 'male',
      age_years: patient.ageYears || 30,
      date_of_birth: patient.dateOfBirth || '',
      blood_group: (patient.bloodGroup as any) || 'B+',
      address_line1: patient.addressLine1 || '',
      landmark: patient.landmark || '',
      city: patient.city || 'Howrah',
      district: patient.district || 'Howrah',
      pincode: patient.pincode || '',
      emergency_contact_name: patient.emergencyContactName || '',
      emergency_contact_phone: patient.emergencyContactPhone || '',
      primary_branch_id: patient.primaryBranchId,
      is_active: patient.isActive,
    })
    setFormError(null)
    setIsEditOpen(true)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        gender: formData.gender,
        age_years: Number(formData.age_years) || null,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        address_line1: formData.address_line1.trim() || null,
        landmark: formData.landmark.trim() || null,
        city: formData.city.trim() || 'Howrah',
        district: formData.district.trim() || 'Howrah',
        pincode: formData.pincode.trim() || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
        primary_branch_id: formData.primary_branch_id,
        is_active: formData.is_active,
      }

      const res = await fetch('/api/v1/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to register patient')
      }

      setIsRegisterOpen(false)
      fetchPatients()
    } catch (err: any) {
      setFormError(err.message || 'Failed to register patient')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return
    setIsSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        gender: formData.gender,
        age_years: Number(formData.age_years) || null,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        address_line1: formData.address_line1.trim() || null,
        landmark: formData.landmark.trim() || null,
        city: formData.city.trim() || 'Howrah',
        district: formData.district.trim() || 'Howrah',
        pincode: formData.pincode.trim() || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
        is_active: formData.is_active,
      }

      const res = await fetch(`/api/v1/admin/patients/${selectedPatient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update patient')
      }

      setIsEditOpen(false)
      fetchPatients()
    } catch (err: any) {
      setFormError(err.message || 'Failed to update patient')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Directory</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
              {patients.length} Registered
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Decoupled clinical intake, auto-generated UHID (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">CC-YYYY-XXXXX</code>), and patient lifetime health records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={openRegisterModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register Patient
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
              placeholder="Search by patient name, phone (+91), or UHID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-slate-200 focus-visible:ring-emerald-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-4">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" onClick={fetchPatients} className="ml-auto text-xs border-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">UHID & Patient</th>
                <th className="px-4 py-3.5">Demographics</th>
                <th className="px-4 py-3.5">Contact & Emergency</th>
                <th className="px-4 py-3.5">Primary Branch</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading patient records from database...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-700">No patient records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or register a new patient.</p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {patient.uhid}
                        </span>
                        <p className="font-semibold text-slate-900 mt-1">{patient.fullName}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-700 capitalize">
                        {patient.gender} • {patient.ageYears ? `${patient.ageYears} yrs` : 'Age N/A'}
                      </p>
                      {patient.bloodGroup && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-semibold mt-0.5">
                          <Heart className="w-2.5 h-2.5 fill-red-600" /> {patient.bloodGroup}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <p className="font-mono text-xs text-slate-800 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{patient.phone}</span>
                        </p>
                        {patient.emergencyContactPhone && (
                          <p className="text-[11px] text-slate-400">
                            ICE: {patient.emergencyContactPhone} ({patient.emergencyContactName || 'Family'})
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-700">
                        {patient.branchName.replace('(Synthetic)', '').trim()}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(patient.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {patient.isActive ? (
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
                          onClick={() => openDetailDrawer(patient)}
                          className="h-8 px-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="View Clinical Profile"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="text-xs">Profile</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(patient)}
                          className="h-8 px-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit Patient"
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
      {/* REGISTER PATIENT MODAL */}
      {/* ============================================================== */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Front-Desk Patient Registration</h3>
                  <p className="text-xs text-slate-500">Auto-generates UHID. Does not require login credentials.</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Subir Kumar Mukherjee"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (10 digits) *</label>
                  <Input
                    type="tel"
                    required
                    placeholder="e.g. 9830123456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                    <Input
                      type="number"
                      min="0"
                      max="130"
                      value={formData.age_years}
                      onChange={(e) => setFormData({ ...formData, age_years: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Intake Branch *</label>
                  <select
                    value={formData.primary_branch_id}
                    onChange={(e) => setFormData({ ...formData, primary_branch_id: e.target.value })}
                    className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                  <Input
                    type="email"
                    placeholder="patient@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Landmark</label>
                  <Input
                    type="text"
                    placeholder="House/Street, Landmark (e.g. Near Bankra Police Outpost)"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / District</label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, district: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                  <Input
                    type="text"
                    placeholder="711409"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Rita Mukherjee (Wife)"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <Input
                    type="tel"
                    placeholder="e.g. 9830987654"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Registering...' : 'Register Patient & Issue UHID'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT PATIENT MODAL */}
      {/* ============================================================== */}
      {isEditOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Edit Patient: {selectedPatient.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedPatient.uhid}</p>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <Input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.age_years}
                      onChange={(e) => setFormData({ ...formData, age_years: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <Input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                  <Input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <Input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="h-9 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-pat-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="edit-pat-active" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Active Patient Record
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
      {/* PATIENT DETAIL DRAWER */}
      {/* ============================================================== */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Patient Health Record</h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6">
              <button
                onClick={() => setDetailTab('overview')}
                className={`py-3 text-xs font-semibold border-b-2 mr-4 transition-colors ${
                  detailTab === 'overview'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Demographics & Contacts
              </button>
              <button
                onClick={() => setDetailTab('appointments')}
                className={`py-3 text-xs font-semibold border-b-2 mr-4 transition-colors ${
                  detailTab === 'appointments'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Appointments ({selectedPatient?.appointments?.length || 0})
              </button>
              <button
                onClick={() => setDetailTab('orders')}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
                  detailTab === 'orders'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Diagnostic Orders ({selectedPatient?.orders?.length || 0})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  Loading patient record...
                </div>
              ) : selectedPatient ? (
                <>
                  {detailTab === 'overview' && (
                    <div className="space-y-5">
                      {/* Patient Banner */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                              {selectedPatient.uhid}
                            </span>
                            <h4 className="font-bold text-lg text-slate-900 mt-1">{selectedPatient.fullName}</h4>
                            <p className="text-xs text-slate-500 capitalize">
                              {selectedPatient.gender} • {selectedPatient.ageYears ? `${selectedPatient.ageYears} Years Old` : 'Age N/A'}
                            </p>
                          </div>
                          {selectedPatient.bloodGroup && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 text-xs font-bold">
                              {selectedPatient.bloodGroup}
                            </Badge>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Primary Phone</span>
                            <span className="font-mono font-semibold text-slate-800">{selectedPatient.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Intake Branch</span>
                            <span className="font-medium text-slate-800">{selectedPatient.branchName}</span>
                          </div>
                          {selectedPatient.emergencyContactPhone && (
                            <div className="col-span-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                              <span className="text-amber-800 block text-[10px] uppercase font-bold">Emergency Contact (ICE)</span>
                              <span className="font-mono text-xs font-medium text-amber-900">
                                {selectedPatient.emergencyContactPhone} ({selectedPatient.emergencyContactName || 'Family'})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1">
                        <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> Residential Address
                        </h5>
                        <p className="text-slate-700">{selectedPatient.addressLine1 || 'No street address specified'}</p>
                        {selectedPatient.landmark && <p className="text-slate-500">Landmark: {selectedPatient.landmark}</p>}
                        <p className="text-slate-500">{selectedPatient.city}, {selectedPatient.district}, {selectedPatient.state} {selectedPatient.pincode && `- ${selectedPatient.pincode}`}</p>
                      </div>

                      {/* Consents */}
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Patient Consents (DPDP Act)
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                            <span>WhatsApp Reports</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                            <span>Home Sample</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                            <span>Telemedicine</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                            <span>Data Processing</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {detailTab === 'appointments' && (
                    <div className="space-y-3">
                      {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                        selectedPatient.appointments.map((a) => (
                          <div key={a.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900">{a.appointmentNumber}</span>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {a.status}
                              </Badge>
                            </div>
                            <p className="font-semibold text-slate-800">{a.doctorName} • <span className="font-normal text-slate-500">{a.specialty}</span></p>
                            <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                              <span>{a.scheduledDate} at {a.startTime?.substring(0, 5)}</span>
                              <span className="font-bold text-slate-900">₹{a.feeInr}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                          No previous appointments recorded for this patient.
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'orders' && (
                    <div className="space-y-3">
                      {selectedPatient.orders && selectedPatient.orders.length > 0 ? (
                        selectedPatient.orders.map((o) => (
                          <div key={o.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {o.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                              <span>Fulfillment: {o.fulfillmentType}</span>
                              <span className="font-bold text-slate-900">₹{o.totalInr} ({o.paymentStatus})</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                          No diagnostic orders recorded for this patient.
                        </div>
                      )}
                    </div>
                  )}
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
