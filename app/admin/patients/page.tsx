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
  MessageSquare,
  Send,
  Upload,
  ExternalLink,
  Share2,
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
  const [detailTab, setDetailTab] = useState<'overview' | 'appointments' | 'orders' | 'documents' | 'communications'>('overview')
  const [patientDocs, setPatientDocs] = useState<any[]>([])
  const [patientMessages, setPatientMessages] = useState<any[]>([])
  const [docsLoading, setDocsLoading] = useState(false)

  // Clinical & Workforce Data
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; specialty: string }>>([])

  // Document Upload Modal State
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false)
  const [uploadSubmitting, setUploadSubmitting] = useState(false)
  const [docForm, setDocForm] = useState({
    document_type: 'prescription' as 'prescription' | 'diagnostic_report' | 'consent_form' | 'other',
    title: '',
    file_url: '',
    file_name: '',
    doctor_id: '',
    validity_hours: 48,
  })

  // 1-Click Patient Communication Modal State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [messageTargetPatient, setMessageTargetPatient] = useState<PatientItem | null>(null)
  const [messageChannel, setMessageChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp')
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>('APPOINTMENT_CONFIRMED')
  const [customMessageText, setCustomMessageText] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)

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
    fetchPatientDocs(patient.id)
    fetchPatientMessages(patient.id)
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

  const fetchPatientDocs = async (patientId?: string) => {
    if (!patientId) return
    setDocsLoading(true)
    try {
      const res = await fetch(`/api/v1/patients/${patientId}/documents`)
      const data = await res.json()
      if (data.success) setPatientDocs(data.data.documents || [])
    } catch (e) {
      console.error(e)
    } finally {
      setDocsLoading(false)
    }
  }

  const fetchPatientMessages = async (patientId?: string) => {
    if (!patientId) return
    try {
      const res = await fetch(`/api/v1/communications/messages?patientId=${patientId}`)
      const data = await res.json()
      if (data.success) setPatientMessages(data.data.messages || [])
    } catch (e) {
      console.error(e)
    }
  }

  const PRESET_TEMPLATES = [
    {
      code: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment Confirmation',
      category: 'service',
      getBody: (name: string, p: any) =>
        `Dear ${name}, your medical appointment at CAPSIC CARE (${p.branchName || 'Main Clinic'}) has been confirmed. Please arrive 15 minutes prior to your scheduled time. Call us at 8910260709 for any inquiries. Wishing you good health!`,
    },
    {
      code: 'DIAGNOSTIC_REPORT_READY',
      title: 'Diagnostic Test Report Ready',
      category: 'service',
      getBody: (name: string, _p: any) =>
        `Dear ${name}, your diagnostic lab test reports are verified and digitally signed. You can review and download them from your patient records or collect at the reception counter. CAPSIC CARE Diagnostics.`,
    },
    {
      code: 'FOLLOW_UP_REMINDER',
      title: 'Doctor Follow-up Consultation',
      category: 'service',
      getBody: (name: string, _p: any) =>
        `Dear ${name}, this is a gentle reminder from CAPSIC CARE regarding your scheduled follow-up consultation. Regular monitoring ensures timely health recovery. Reply to book your priority slot.`,
    },
    {
      code: 'HEALTH_CHECKUP_PROMO',
      title: 'Preventive Health Package (Offer)',
      category: 'promotional',
      getBody: (name: string, _p: any) =>
        `Dear ${name}, protect your family's health! CAPSIC CARE offers a Comprehensive 65+ Parameter Full Body Health Checkup with 25% special discount this month. Home sample collection available. Reply to this message to book today.`,
    },
    {
      code: 'CUSTOM',
      title: 'Custom Operational Message',
      category: 'service',
      getBody: (_name: string, _p: any) => '',
    },
  ]

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/v1/doctors')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setDoctors(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const openSendMessageModal = (patient: PatientItem) => {
    setMessageTargetPatient(patient)
    setMessageChannel('whatsapp')
    setSelectedTemplateCode('APPOINTMENT_CONFIRMED')
    const t = PRESET_TEMPLATES.find((x) => x.code === 'APPOINTMENT_CONFIRMED')
    setCustomMessageText(t ? t.getBody(patient.fullName, patient) : '')
    setIsMessageModalOpen(true)
  }

  const handleTemplateChange = (code: string) => {
    setSelectedTemplateCode(code)
    if (!messageTargetPatient) return
    const t = PRESET_TEMPLATES.find((x) => x.code === code)
    if (t && code !== 'CUSTOM') {
      setCustomMessageText(t.getBody(messageTargetPatient.fullName, messageTargetPatient))
    }
  }

  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageTargetPatient) return
    if (!customMessageText.trim()) {
      alert('Please enter or select message content.')
      return
    }

    setIsSendingMessage(true)
    try {
      const cleanPhone = messageTargetPatient.phone.replace(/\D/g, '')
      const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone

      // 1. Log & dispatch through OS communication API
      const res = await fetch('/api/v1/communications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: messageTargetPatient.id,
          channel: messageChannel,
          template_code: selectedTemplateCode !== 'CUSTOM' ? selectedTemplateCode : undefined,
          custom_body: customMessageText,
        }),
      })
      const result = await res.json()

      // 2. Open WhatsApp direct link for instantaneous 1-click delivery
      if (messageChannel === 'whatsapp') {
        const directUrl =
          result.data?.whatsapp_direct_url ||
          `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(customMessageText)}`
        window.open(directUrl, '_blank')
      }

      setIsMessageModalOpen(false)
      if (selectedPatient?.id === messageTargetPatient.id) {
        fetchPatientMessages(selectedPatient.id)
      }
      alert(`Message dispatched to ${messageTargetPatient.fullName}! WhatsApp conversation opened.`)
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch message')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleSendDocWhatsApp = async (doc: any) => {
    if (!selectedPatient) return
    try {
      const cleanPhone = selectedPatient.phone.replace(/\D/g, '')
      const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
      const secureDocUrl = `${window.location.origin}/api/v1/documents/${doc.security_token}`

      const templateCode =
        doc.document_type === 'prescription' ? 'PRESCRIPTION_AVAILABLE' : 'DIAGNOSTIC_REPORT_READY'

      const doctorObj = doctors.find((d) => d.id === doc.doctor_id)
      const doctorName = doctorObj ? doctorObj.name : 'CAPSIC CARE Specialist'

      const variables: Record<string, string | number> = {
        patient_name: selectedPatient.fullName,
        doctor_name: doctorName,
        consultation_date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        prescription_url: secureDocUrl,
        order_number: doc.document_number,
        report_url: secureDocUrl,
      }

      // Dispatch via API
      const res = await fetch('/api/v1/communications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          channel: 'whatsapp',
          template_code: templateCode,
          variables,
          related_entity_type: 'patient_document',
          related_entity_id: doc.id,
        }),
      })
      const result = await res.json()

      const docName = doc.document_type === 'prescription' ? 'prescription' : 'laboratory test report'
      const waText = `Dear ${selectedPatient.fullName}, your digital ${docName} (${doc.title}) is ready. Access your private document securely: ${secureDocUrl} (valid for 48 hours). CAPSIC CARE.`
      const directUrl =
        result.data?.whatsapp_direct_url ||
        `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(waText)}`

      window.open(directUrl, '_blank')
      fetchPatientMessages(selectedPatient.id)
    } catch (err: any) {
      alert(`Failed to dispatch document: ${err.message}`)
    }
  }

  const handleUploadDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return
    if (!docForm.title.trim()) {
      alert('Please enter a document title.')
      return
    }
    setUploadSubmitting(true)
    try {
      const fileUrl =
        docForm.file_url.trim() ||
        `https://storage.capsiccare.in/records/${docForm.document_type}-${Date.now()}.pdf`
      const fileName =
        docForm.file_name.trim() || `${docForm.title.replace(/\s+/g, '_')}.pdf`

      const res = await fetch(`/api/v1/patients/${selectedPatient.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: docForm.document_type,
          title: docForm.title,
          file_url: fileUrl,
          file_name: fileName,
          doctor_id: docForm.doctor_id || undefined,
          validity_hours: Number(docForm.validity_hours) || 48,
          mime_type: 'application/pdf',
        }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setIsUploadDocOpen(false)
        fetchPatientDocs(selectedPatient.id)
        alert(`Document "${docForm.title}" uploaded & secured with 48h expiring token!`)
      } else {
        alert(result.error?.message || 'Failed to upload document')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploadSubmitting(false)
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
                          onClick={() => openSendMessageModal(patient)}
                          className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="1-Click WhatsApp / SMS Message"
                        >
                          <MessageSquare className="w-4 h-4 mr-1 text-emerald-600" />
                          <span className="text-xs">Message</span>
                        </Button>
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
                className={`py-3 text-xs font-semibold border-b-2 mr-4 transition-colors ${
                  detailTab === 'orders'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Diagnostic Orders ({selectedPatient?.orders?.length || 0})
              </button>
              <button
                onClick={() => {
                  setDetailTab('documents')
                  fetchPatientDocs(selectedPatient?.id)
                }}
                className={`py-3 text-xs font-semibold border-b-2 mr-4 transition-colors ${
                  detailTab === 'documents'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Documents & RX ({patientDocs.length})
              </button>
              <button
                onClick={() => {
                  setDetailTab('communications')
                  fetchPatientMessages(selectedPatient?.id)
                }}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
                  detailTab === 'communications'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Communications ({patientMessages.length})
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

                  {detailTab === 'documents' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Prescriptions & Lab Reports
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            DPDP-compliant secure vault with 1-click WhatsApp delivery & expiring tokens
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setDocForm({
                              document_type: 'prescription',
                              title: '',
                              file_url: 'https://storage.capsiccare.in/records/doc-' + Date.now() + '.pdf',
                              file_name: 'Document-' + (selectedPatient?.uhid || 'Patient') + '.pdf',
                              doctor_id: doctors[0]?.id || '',
                              validity_hours: 48,
                            })
                            setIsUploadDocOpen(true)
                          }}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Upload Rx / Report
                        </Button>
                      </div>

                      {patientDocs && patientDocs.length > 0 ? (
                        patientDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2.5 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
                                  {doc.document_number}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] uppercase font-mono ${
                                    doc.document_type === 'prescription'
                                      ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
                                      : doc.document_type === 'diagnostic_report'
                                      ? 'border-blue-300 text-blue-700 dark:text-blue-300'
                                      : 'border-slate-300 text-slate-700'
                                  }`}
                                >
                                  {doc.document_type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(doc.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                            </div>

                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{doc.title}</div>
                              {doc.doctor_id && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Doctor:{' '}
                                  <strong className="text-slate-700 dark:text-slate-300">
                                    {doctors.find((d) => d.id === doc.doctor_id)?.name || 'Consultant Doctor'}
                                  </strong>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const link = `${window.location.origin}/api/v1/documents/${doc.security_token}`
                                    navigator.clipboard.writeText(link)
                                    alert('Copied 48-hour secure expiring delivery link to clipboard!')
                                  }}
                                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  📋 Copy Link
                                </button>
                                {doc.file_url && (
                                  <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                                  >
                                    <ExternalLink className="w-3 h-3" /> View
                                  </a>
                                )}
                              </div>

                              {/* Prominent 1-Click WhatsApp Button */}
                              <Button
                                size="sm"
                                onClick={() => handleSendDocWhatsApp(doc)}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs font-semibold"
                              >
                                <Send className="w-3 h-3" />
                                Send on WhatsApp
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                          No digital prescriptions or lab reports uploaded yet. Click &quot;Upload Rx / Report&quot; to add.
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'communications' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            Communication Logs
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            WhatsApp, SMS, and transactional clinical alerts
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openSendMessageModal(selectedPatient)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send WhatsApp
                        </Button>
                      </div>
                      {patientMessages && patientMessages.length > 0 ? (
                        patientMessages.map((msg) => (
                          <div key={msg.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                {msg.channel}
                              </Badge>
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                {msg.status}
                              </Badge>
                            </div>
                            <div className="text-slate-700 leading-relaxed">{msg.message_body}</div>
                            <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-100">
                              {msg.delivered_at ? new Date(msg.delivered_at).toLocaleString() : 'Pending'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                          No communication messages dispatched to this patient yet.
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

      {/* Upload Prescription / Lab Report Modal */}
      {isUploadDocOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  Upload Medical Document
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  For {selectedPatient.fullName} ({selectedPatient.uhid})
                </p>
              </div>
              <button
                onClick={() => setIsUploadDocOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDocSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Document Type *
                </label>
                <select
                  value={docForm.document_type}
                  onChange={(e) =>
                    setDocForm({
                      ...docForm,
                      document_type: e.target.value as any,
                      title:
                        docForm.title ||
                        (e.target.value === 'prescription'
                          ? 'General Consultation Prescription'
                          : 'Pathology Diagnostic Test Report'),
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="prescription">Prescription (Rx)</option>
                  <option value="diagnostic_report">Diagnostic Lab Report</option>
                  <option value="discharge_summary">Discharge Summary</option>
                  <option value="consent_form">Signed Consent Form</option>
                  <option value="other">Other Clinical Document</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Document Title *
                </label>
                <Input
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. CBC & Thyroid Profile / Cardiology Rx"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Prescribing / Authorizing Doctor
                </label>
                <select
                  value={docForm.doctor_id}
                  onChange={(e) => setDocForm({ ...docForm, doctor_id: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="">Clinic Specialist / Internal Lab</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  File Repository URL / Storage Location *
                </label>
                <Input
                  required
                  value={docForm.file_url}
                  onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })}
                  placeholder="https://storage.capsiccare.in/records/..."
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    File Name
                  </label>
                  <Input
                    value={docForm.file_name}
                    onChange={(e) => setDocForm({ ...docForm, file_name: e.target.value })}
                    placeholder="e.g. Report.pdf"
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Token Validity
                  </label>
                  <select
                    value={docForm.validity_hours}
                    onChange={(e) => setDocForm({ ...docForm, validity_hours: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours (Standard)</option>
                    <option value={168}>7 Days</option>
                    <option value={720}>30 Days</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                🔒 Generating an encrypted, DPDP-compliant time-limited token so the patient can open this document directly without login hurdles.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDocOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadSubmitting}
                  className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {uploadSubmitting ? 'Uploading...' : 'Save & Link Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Send Communication Modal */}
      {isMessageModalOpen && messageTargetPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  1-Click Patient Communication
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recipient: <strong className="text-slate-800 dark:text-slate-200">{messageTargetPatient.fullName}</strong> • Tel: {messageTargetPatient.phone}
                </p>
              </div>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Communication Channel
                  </label>
                  <select
                    value={messageChannel}
                    onChange={(e) => setMessageChannel(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                  >
                    <option value="whatsapp">WhatsApp (Instant 1-Click)</option>
                    <option value="sms">SMS Text Alert</option>
                    <option value="email">Email Notification</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Preset Template
                  </label>
                  <select
                    value={selectedTemplateCode}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                  >
                    {PRESET_TEMPLATES.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Message Content (Preview & Edit)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {customMessageText.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={customMessageText}
                  onChange={(e) => setCustomMessageText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                  placeholder="Type or customize your communication message..."
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
                <Send className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Clicking <strong>Send WhatsApp Message</strong> will record this message in the patient ledger and immediately open the chat in WhatsApp Web/Desktop with text pre-filled.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSendingMessage}
                  className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSendingMessage ? 'Dispatching...' : '⚡ Send WhatsApp Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
