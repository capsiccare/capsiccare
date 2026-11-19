'use client'

import React, { useEffect, useState } from 'react'
import {
  Activity,
  Calendar,
  FileText,
  FlaskConical,
  Heart,
  Droplet,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  Upload,
  Camera,
  ExternalLink,
  Download,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientHealthRecordsPage() {
  const { activePatientId, t } = usePatient()
  const [timeline, setTimeline] = useState<any[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])
  const [summary, setSummary] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState<'prescription' | 'diagnostic_report' | 'discharge_summary' | 'consent_form' | 'other'>('diagnostic_report')
  const [uploadFileUrl, setUploadFileUrl] = useState('')
  const [uploadFileName, setUploadFileName] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (activePatientId) {
      loadRecords(activePatientId)
    }
  }, [activePatientId])

  const loadRecords = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/health-records?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setTimeline(json.data.timeline || [])
        setUploadedDocs(json.data.uploaded_documents || [])
        setSummary(json.data.summary || null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadFileUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFileUrl || !uploadTitle.trim()) return

    try {
      setUploadLoading(true)
      const res = await fetch(`/api/v1/patient/health-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          document_type: uploadType,
          file_url: uploadFileUrl,
          file_name: uploadFileName || 'health_document.pdf',
        }),
      })

      if (res.ok) {
        setUploadSuccess(true)
        setTimeout(() => {
          setShowUploadModal(false)
          setUploadSuccess(false)
          setUploadTitle('')
          setUploadFileUrl('')
          if (activePatientId) loadRecords(activePatientId)
        }, 1500)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploadLoading(false)
    }
  }

  const filteredTimeline = timeline.filter((item) => {
    if (filterType === 'all') return true
    return item.type === filterType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.records}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete chronological timeline of your clinic consultations, vitals, prescriptions, and health documents.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Medical Document</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Consultations</span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {summary?.consultations_count || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Prescriptions</span>
          <div className="mt-2 text-2xl font-black text-teal-600 dark:text-teal-400">
            {summary?.prescriptions_count || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Lab Reports</span>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {summary?.reports_count || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Uploaded Files</span>
          <div className="mt-2 text-2xl font-black text-blue-600">
            {uploadedDocs.length}
          </div>
        </div>
      </div>

      {/* Uploaded Documents Shelf */}
      {uploadedDocs.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Digital Health Locker Documents ({uploadedDocs.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                    {doc.document_type.replace('_', ' ')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                    {doc.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {doc.created_at?.substring(0, 10)}
                  </span>
                </div>
                {doc.security_token ? (
                  <a
                    href={`/api/v1/documents/${doc.security_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors shrink-0"
                    title="View Document"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors shrink-0"
                    title="Download File"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'consultation', label: 'Consultations' },
          { id: 'prescription', label: 'Prescriptions' },
          { id: 'report', label: 'Lab Reports' },
          { id: 'vitals', label: 'Vitals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chronological Timeline */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No health records matching this filter
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Clinical entries, doctor visits, and lab reports will populate here as care is delivered.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredTimeline.map((item, idx) => {
            const isPrescription = item.type === 'prescription'
            const isConsultation = item.type === 'consultation'
            const isReport = item.type === 'report' || item.type === 'lab_report'

            return (
              <div key={item.id || idx} className="relative group">
                <div
                  className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                    isPrescription
                      ? 'bg-teal-600'
                      : isConsultation
                      ? 'bg-blue-600'
                      : isReport
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-teal-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.type.replace('_', ' ')} • {item.date?.substring(0, 10)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.date?.substring(11, 16) || ''}
                    </span>
                  </div>

                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Patient Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Upload Medical Document to Locker
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload outside diagnostic reports, previous hospital discharge summaries, or outside prescriptions.
            </p>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Document Saved to Health Locker!
                </h4>
                <p className="text-xs text-slate-400">
                  Your record is now safely stored in your digital profile.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Apollo Hospital Discharge Summary 2025"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="diagnostic_report">Laboratory / Diagnostic Report</option>
                    <option value="prescription">Outside Prescription (Rx)</option>
                    <option value="discharge_summary">Hospital Discharge Summary</option>
                    <option value="consent_form">Signed Consent Form</option>
                    <option value="other">Other Medical Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Document File / Photo *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                    {uploadFileUrl ? (
                      <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                        ✓ {uploadFileName || 'File selected'}
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                        <Upload className="h-6 w-6 text-teal-600" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Choose PDF or image file
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading || !uploadFileUrl || !uploadTitle.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                  >
                    {uploadLoading ? 'Saving...' : 'Upload to Locker'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
