'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  Building2,
  Stethoscope,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  FileText,
  Printer,
  UploadCloud,
  CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function PracticeHubPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const practiceId = resolvedParams.id

  const [practice, setPractice] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'import' | 'billing'>('overview')

  // CSV Import State
  const [csvRawText, setCsvRawText] = useState('')
  const [csvFileName, setCsvFileName] = useState('patients.csv')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any | null>(null)

  // Manual Enroll State
  const [isManualEnrollModalOpen, setIsManualEnrollModalOpen] = useState(false)
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientPhone, setNewPatientPhone] = useState('')
  const [newPatientEmail, setNewPatientEmail] = useState('')
  const [newPatientGender, setNewPatientGender] = useState<'male' | 'female' | 'other'>('male')
  const [newPatientAge, setNewPatientAge] = useState<number>(35)
  const [newPatientTags, setNewPatientTags] = useState('')
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false)

  // Invoicing
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)

  const fetchPractice = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/careflow/practices/${practiceId}`)
      const data = await res.json()
      if (data.success) {
        setPractice(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPractice()
  }, [practiceId])

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true)
    try {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

      const res = await fetch('/api/v1/careflow/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practice_id: practiceId,
          billing_period_start: firstDay,
          billing_period_end: lastDay
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert('Practice service invoice generated successfully!')
        fetchPractice()
      } else {
        alert(data.error?.message || 'Failed to generate invoice')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsGeneratingInvoice(false)
    }
  }

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingPatient(true)
    try {
      const res = await fetch(`/api/v1/careflow/practices/${practiceId}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newPatientName,
          phone: newPatientPhone,
          email: newPatientEmail || undefined,
          gender: newPatientGender,
          age_years: Number(newPatientAge),
          tags: newPatientTags ? [newPatientTags] : [],
          consent_granted: true
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsManualEnrollModalOpen(false)
        setNewPatientName('')
        setNewPatientPhone('')
        setNewPatientEmail('')
        setNewPatientTags('')
        fetchPractice()
      } else {
        alert(data.error?.message || 'Failed to enroll patient')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmittingPatient(false)
    }
  }

  const handleCsvImport = async () => {
    if (!csvRawText.trim()) {
      alert('Please enter or paste CSV content first.')
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      // Parse CSV text into rows
      const lines = csvRawText.trim().split(/\r?\n/)
      if (lines.length < 2) {
        throw new Error('CSV must contain a header line and at least one data row.')
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
      const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('patient'))
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'))
      const emailIdx = headers.findIndex(h => h.includes('email'))
      const genderIdx = headers.findIndex(h => h.includes('gender') || h.includes('sex'))
      const ageIdx = headers.findIndex(h => h.includes('age'))
      const tagsIdx = headers.findIndex(h => h.includes('condition') || h.includes('tag'))

      if (nameIdx === -1 || phoneIdx === -1) {
        throw new Error('CSV must contain at least "full_name" and "phone" columns.')
      }

      const parsedRows = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
        const fullName = cols[nameIdx]
        const phone = cols[phoneIdx]

        if (!fullName || !phone) continue

        let gender: 'male' | 'female' | 'other' | undefined = undefined
        if (genderIdx !== -1 && cols[genderIdx]) {
          const g = cols[genderIdx].toLowerCase()
          if (g.startsWith('m')) gender = 'male'
          else if (g.startsWith('f')) gender = 'female'
          else gender = 'other'
        }

        let ageYears: number | undefined = undefined
        if (ageIdx !== -1 && cols[ageIdx] && !isNaN(Number(cols[ageIdx]))) {
          ageYears = parseInt(cols[ageIdx], 10)
        }

        parsedRows.push({
          full_name: fullName,
          phone: phone,
          email: emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : '',
          gender,
          age_years: ageYears,
          tags: tagsIdx !== -1 && cols[tagsIdx] ? cols[tagsIdx] : '',
          consent_granted: true
        })
      }

      if (parsedRows.length === 0) {
        throw new Error('No valid patient rows found in CSV.')
      }

      const res = await fetch(`/api/v1/careflow/practices/${practiceId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: csvFileName,
          rows: parsedRows
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setImportResult(data.data)
        fetchPractice()
      } else {
        alert(data.error?.message || 'Failed to process import')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsImporting(false)
    }
  }

  const handlePrintValueReport = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
        <p className="text-sm text-slate-500">Loading Doctor Practice Hub...</p>
      </div>
    )
  }

  if (!practice) {
    return (
      <div className="py-24 text-center">
        <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
        <h2 className="text-lg font-bold">Practice Not Found</h2>
        <Link href="/admin/careflow/practices" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
          Return to Practices Directory
        </Link>
      </div>
    )
  }

  const enrolledCount = practice.active_patients_count || 0
  const callsCount = practice.completed_calls_count || 0
  const preservedConsultations = Math.floor(callsCount * 0.72)
  const estimatedRetainedValue = preservedConsultations * 600

  return (
    <div className="space-y-6">
      {/* Breadcrumbs and Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/careflow" className="hover:text-teal-600 transition-colors">CareFlow OS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/admin/careflow/practices" className="hover:text-teal-600 transition-colors">External Practices</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">{practice.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            {practice.name}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
            <Stethoscope className="w-4 h-4 text-indigo-500" />
            <span>Dr. {practice.primary_doctor?.name || practice.contact_person}</span>
            <span>•</span>
            <span>{practice.primary_doctor?.specialty || 'General Practice'}</span>
            <span>•</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              {practice.code}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handlePrintValueReport} className="gap-1.5">
            <Printer className="w-4 h-4" />
            Print Value Report
          </Button>

          <Button size="sm" onClick={() => setIsManualEnrollModalOpen(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4" />
            Enroll Patient
          </Button>
        </div>
      </div>

      {/* Doctor Value Dashboard KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">Enrolled Practice Patients</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
            {enrolledCount}
            <span className="text-xs font-normal text-emerald-600">Active Registry</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Continuity Calls Completed</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
            {callsCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Preserved Return Consults</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            ~{preservedConsultations}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20">
          <div className="text-xs font-medium text-teal-700 dark:text-teal-400">Estimated Preserved Revenue</div>
          <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1">
            ₹{estimatedRetainedValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Doctor Value Report
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'roster'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Enrolled Patients ({enrolledCount})
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          CSV Patient Import
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'billing'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          CareFlow Billing & Invoices
        </button>
      </div>

      {/* Tab 1: Doctor Value Report */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Value Story */}
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Retention & Clinical Continuity Summary
                  </h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    High Adherence Practice
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  CareFlow acts as the dedicated continuity desk for <strong>{practice.name}</strong>. Every patient visiting Dr. {practice.primary_doctor?.name || practice.contact_person} receives scheduled day-3 post-consultation calls in their preferred regional dialect (Bengali/Hindi/English) plus proactive chronic recall notifications.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">93.4%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Patient Satisfaction</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">72.1%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Follow-up Adherence</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">0</div>
                    <div className="text-xs text-slate-500 mt-0.5">Unresolved Escalations</div>
                  </div>
                </div>
              </div>

              {/* Chamber Info */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Chamber Locations & Timings
                </h4>
                {practice.chambers && Array.isArray(practice.chambers) && practice.chambers.length > 0 ? (
                  <div className="space-y-2">
                    {practice.chambers.map((ch: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{ch.name || 'Main Chamber'}</div>
                        <div className="text-slate-500">{ch.days} • {ch.timings}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Address: {practice.address || 'Address registered with agreement'}
                  </p>
                )}
              </div>
            </div>

            {/* Right Col: Service Agreement Card */}
            <div className="space-y-6">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">SUBSCRIPTION TIER</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {practice.service_plan?.code || 'CF_PRO'}
                  </Badge>
                </div>

                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {practice.service_plan?.name || 'Professional Continuity Tier'}
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Enrolled Patient Fee:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{practice.service_plan?.price_per_enrolled_patient_inr || 49}/pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Included Calls / Patient:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{practice.service_plan?.included_calls_per_patient || 2} calls</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra Call Rate:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{practice.service_plan?.price_per_additional_call_inr || 12}/call</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agreement Status:</span>
                    <span className="font-semibold text-emerald-600 uppercase">{practice.service_agreement_status || 'Active'}</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateInvoice}
                  disabled={isGeneratingInvoice}
                  variant="outline"
                  className="w-full text-xs gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {isGeneratingInvoice ? 'Calculating...' : 'Generate Monthly Invoice'}
                </Button>
              </div>

              {/* Data Isolation Notice */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Strict Mode B Data Boundary
                </div>
                <p className="text-[11px] leading-relaxed">
                  Patients enrolled under {practice.name} are logically partitioned. They are excluded from CAPSIC CARE cross-promotions or marketing unless patient grants cross-entity consent.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Enrolled Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Enrolled Practice Patients
            </h3>
            <Button size="sm" onClick={() => setIsManualEnrollModalOpen(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4" />
              Enroll Patient
            </Button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">UHID / Phone</th>
                  <th className="px-4 py-3">Demographics</th>
                  <th className="px-4 py-3">Enrolled At</th>
                  <th className="px-4 py-3">Consent</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!practice.recent_enrollments || practice.recent_enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No patients enrolled under this practice yet. Use the CSV Import tool or manual enrollment above.
                    </td>
                  </tr>
                ) : (
                  practice.recent_enrollments.map((enr: any) => (
                    <tr key={enr.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">
                        {enr.patients?.full_name || 'Enrolled Patient'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
                        {enr.patients?.uhid || 'EXTERNAL'} • {enr.patients?.phone}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                        {enr.patients?.age_years ? `${enr.patients.age_years}y` : ''} {enr.patients?.gender ? `• ${enr.patients.gender}` : ''}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {new Date(enr.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                          {enr.consent_verified ? 'Verified' : 'Implicit'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px] text-slate-700 bg-slate-50">
                          {enr.status || 'Active'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: CSV Patient Import */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  Bulk CSV Patient Enrollment Engine
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload or paste patient lists from your chamber software (e.g. Practo, HealthPlix, Excel). Duplicate phone numbers will be automatically reconciled.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCsvRawText(
`full_name,phone,email,gender,age,condition
Amit Banerjee,9830111222,amit@test.com,male,45,Diabetes
Priyanka Sen,9830222333,priyanka@test.com,female,38,Hypertension
Sourav Ganguly,9830333444,,male,52,Cardiac`
                  )
                }}
                className="text-xs"
              >
                Load Sample CSV
              </Button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                CSV Data (Headers: full_name, phone, email, gender, age, condition)
              </label>
              <textarea
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                rows={8}
                placeholder="Paste CSV rows here..."
                className="w-full font-mono text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Supported formats: CSV, Comma-delimited text with header row.
              </span>

              <Button
                onClick={handleCsvImport}
                disabled={isImporting || !csvRawText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                {isImporting ? 'Processing Import...' : 'Import Patient Batch'}
              </Button>
            </div>
          </div>

          {/* Import Result Notification */}
          {importResult && (
            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Import Batch Completed (Batch #{importResult.batchId?.slice(0, 8)})
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-slate-500 block">Total Rows</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">{importResult.totalRows}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-emerald-600 block">Imported Patients</span>
                  <span className="text-base font-bold text-emerald-600">{importResult.importedCount}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-amber-600 block">Duplicates Handled</span>
                  <span className="text-base font-bold text-amber-600">{importResult.duplicateCount}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-red-600 block">Row Errors</span>
                  <span className="text-base font-bold text-red-600">{importResult.errorCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: CareFlow Invoices */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Practice Service Invoices
            </h3>
            <Button
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice}
              size="sm"
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <CreditCard className="w-4 h-4" />
              {isGeneratingInvoice ? 'Generating...' : 'Generate New Invoice'}
            </Button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Billing Cycle</th>
                  <th className="px-4 py-3">Enrolled Pts</th>
                  <th className="px-4 py-3">Calls Billed</th>
                  <th className="px-4 py-3">Amount (INR)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!practice.invoices || practice.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No invoices generated yet. Click "Generate New Invoice" above to compute the current monthly cycle.
                    </td>
                  </tr>
                ) : (
                  practice.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {inv.invoice_number || inv.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                        {inv.billing_period_start} to {inv.billing_period_end}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {inv.enrolled_patients_count}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {inv.calls_completed_count} ({inv.additional_calls_count} extra)
                      </td>
                      <td className="px-4 py-3.5 font-bold text-sm text-slate-900 dark:text-white">
                        ₹{Number(inv.total_inr ?? inv.total_amount_inr ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-semibold ${
                            (inv.payment_status ?? inv.status) === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {inv.payment_status ?? inv.status ?? 'unpaid'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Patient Enrollment Modal */}
      {isManualEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Enroll Patient to Practice
            </h3>
            <p className="text-xs text-slate-500">
              Add a new patient to {practice.name}'s isolated CareFlow registry.
            </p>

            <form onSubmit={handleManualEnroll} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="E.g., Anirban Roy"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Contact Phone *
                </label>
                <Input
                  required
                  placeholder="E.g., 9830012345"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className="text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={newPatientGender}
                    onChange={(e: any) => setNewPatientGender(e.target.value)}
                    className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Age (Years)
                  </label>
                  <Input
                    type="number"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(Number(e.target.value))}
                    className="text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Tags / Chronic Condition
                </label>
                <Input
                  placeholder="E.g., Hypertension, Diabetic"
                  value={newPatientTags}
                  onChange={(e) => setNewPatientTags(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsManualEnrollModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingPatient}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmittingPatient ? 'Enrolling...' : 'Enroll Patient'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
