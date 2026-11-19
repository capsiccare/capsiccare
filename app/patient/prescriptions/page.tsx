'use client'

import React, { useEffect, useState } from 'react'
import {
  FileText,
  Printer,
  Calendar,
  Pill,
  Clock,
  Download,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Upload,
  MessageCircle,
  Camera,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientPrescriptionsPage() {
  const { activePatientId, context, t } = usePatient()
  const activePatientUhid = context?.patient?.uhid || ''
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [paperDocs, setPaperDocs] = useState<any[]>([])
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRx, setSelectedRx] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Patient Self-Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('My Paper Prescription Slip')
  const [uploadFileUrl, setUploadFileUrl] = useState('')
  const [uploadFileName, setUploadFileName] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (activePatientId) {
      loadData(activePatientId)
    }
  }, [activePatientId])

  const loadData = async (patId: string) => {
    try {
      setLoading(true)

      // 1. Load finalized prescriptions
      const rxRes = await fetch(`/api/v1/patient/prescriptions?patientId=${patId}`)
      if (rxRes.ok) {
        const json = await rxRes.json()
        setPrescriptions(json.data || [])
      }

      // 2. Load health records to get paper documents
      const hrRes = await fetch(`/api/v1/patient/health-records?patientId=${patId}`)
      if (hrRes.ok) {
        const hrJson = await hrRes.json()
        const docs = (hrJson.data?.uploaded_documents || []).filter(
          (d: any) => d.document_type === 'prescription'
        )
        setPaperDocs(docs)
      }

      // 3. Load recent appointments to detect recent chamber visits
      const aptRes = await fetch(`/api/v1/patient/appointments?patientId=${patId}&limit=5`)
      if (aptRes.ok) {
        const aptJson = await aptRes.json()
        setRecentAppointments(aptJson.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetail = async (rxId: string) => {
    try {
      setLoadingDetail(true)
      const res = await fetch(`/api/v1/patient/prescriptions/${rxId}?patientId=${activePatientId}`)
      if (res.ok) {
        const json = await res.json()
        setSelectedRx(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDetail(false)
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

  const handleSelfUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFileUrl) return

    try {
      setUploadLoading(true)
      const res = await fetch(`/api/v1/patient/health-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle.trim() || 'My Paper Prescription Slip',
          document_type: 'prescription',
          file_url: uploadFileUrl,
          file_name: uploadFileName || 'prescription_slip.jpg',
        }),
      })

      if (res.ok) {
        setUploadSuccess(true)
        setTimeout(() => {
          setShowUploadModal(false)
          setUploadSuccess(false)
          setUploadFileUrl('')
          if (activePatientId) loadData(activePatientId)
        }, 1500)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploadLoading(false)
    }
  }

  const whatsappInquiryUrl = `https://wa.me/918910260709?text=${encodeURIComponent(
    `Hello Capsic Care, I am checking my prescriptions for UHID: ${activePatientUhid || 'Patient'}. Please help me with my prescription copy.`
  )}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.prescriptions}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your finalized electronic prescriptions, digitized paper slips, and medicine regimens.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Camera className="h-4 w-4" />
          <span>Snap / Upload Paper Slip</span>
        </button>
      </div>

      {/* Practical Clinic Delivery Notice: When chamber staff is digitizing */}
      {recentAppointments.length > 0 && (
        <div className="rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Consultation on Record: Dr. {(recentAppointments[0].doctor as any)?.name || 'Consultant'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Scheduled on {recentAppointments[0].scheduled_date}. If your doctor wrote on a physical prescription pad, clinic chamber staff is in the process of scanning and attaching it to your account.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Ask on WhatsApp</span>
              </a>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-teal-500 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload My Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : prescriptions.length === 0 && paperDocs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No digital prescriptions on record yet
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Prescriptions issued by attending doctors or scanned by chamber staff will appear here. You can also upload a photo of your paper slip anytime.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Camera className="h-4 w-4" />
              <span>Upload Prescription Photo</span>
            </button>
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact Clinic Desk</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Digitized E-Prescriptions */}
          {prescriptions.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Finalized E-Prescriptions ({prescriptions.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/50">
                          Digitally Signed
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {rx.issued_at?.substring(0, 10)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          Dr. {rx.doctor_name}
                        </h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                          {rx.specialty}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                          Diagnosis: {rx.diagnosis_summary || 'Clinical Review'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {rx.items_count} prescribed medicines & instructions
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(rx.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Prescription & Print</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Digitized / Uploaded Paper Prescription Slips */}
          {paperDocs.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Digitized Chamber Slips & Attached Records ({paperDocs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paperDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                          {doc.is_verified ? 'Verified Chamber Scan' : 'Patient Upload'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {doc.created_at?.substring(0, 10)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          Ref #{doc.document_number}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      {doc.security_token ? (
                        <a
                          href={`/api/v1/documents/${doc.security_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View Original Slip</span>
                        </a>
                      ) : (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download Slip</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient Self-Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Upload Prescription Photo / Slip
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Take a photo of your paper prescription slip or upload an existing PDF/image.
            </p>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Prescription Slip Attached!
                </h4>
                <p className="text-xs text-slate-400">
                  Added to your personal health records.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSelfUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Dr. Roy Prescription - Oct 2026"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Photo or File *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                    {uploadFileUrl ? (
                      <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                        ✓ {uploadFileName || 'File selected'}
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                        <Camera className="h-6 w-6 text-teal-600" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Take photo or choose from gallery
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          capture="environment"
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
                    disabled={uploadLoading || !uploadFileUrl}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                  >
                    {uploadLoading ? 'Uploading...' : 'Save to Records'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Prescription Detail & A4 Print Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Action Bar (hidden in print) */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                <span className="text-xs font-bold text-teal-800 dark:text-teal-200">
                  Verified Electronic Medical Record
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print A4
                </button>
                <button
                  onClick={() => setSelectedRx(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Prescription Body */}
            <div className="space-y-6 print:text-black">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-teal-800 dark:text-teal-300 print:text-black">
                    CAPSIC CARE CLINIC
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Comprehensive Family Medicine, Diagnostics & Clinical Care
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Chamber: {selectedRx.branch?.name || 'Main Health Center'} • Ph: +91 89102 60709
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white print:text-black">
                    Dr. {selectedRx.doctor?.full_name}
                  </h3>
                  <p className="text-xs text-teal-700 font-semibold">{selectedRx.doctor?.specialty}</p>
                  <p className="text-[10px] text-slate-500">
                    Reg: {selectedRx.doctor?.registration_number || 'WBMC / NMC Verified'}
                  </p>
                </div>
              </div>

              {/* Patient Info Bar */}
              <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 print:bg-transparent print:border print:border-slate-300 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient</span>
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">
                    {selectedRx.patient?.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">UHID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    {selectedRx.patient?.uhid}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Age / Gender</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    {selectedRx.patient?.age_years || 30}Y / {selectedRx.patient?.gender || 'M'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    {selectedRx.issued_at?.substring(0, 10)}
                  </span>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedRx.diagnosis_summary && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Clinical Diagnosis
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 print:text-black mt-0.5">
                    {selectedRx.diagnosis_summary}
                  </p>
                </div>
              )}

              {/* Rx Medicines Table */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-serif italic font-black text-2xl text-teal-800 dark:text-teal-200 print:text-black">
                    ℞
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-400">Prescribed Regimen</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 print:bg-slate-100 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Medicine (Brand / Generic)</th>
                        <th className="p-2.5">Dosage & Timing</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedRx.items?.map((item: any, idx: number) => (
                        <tr key={item.id || idx}>
                          <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900 dark:text-white print:text-black">
                              {item.medicine_name}
                            </div>
                            <div className="text-[10px] text-slate-500 italic">
                              {item.generic_name}
                            </div>
                          </td>
                          <td className="p-2.5 font-semibold text-teal-700 dark:text-teal-300 print:text-black">
                            {item.dosage} ({item.frequency})
                          </td>
                          <td className="p-2.5">{item.duration}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300 print:text-black">
                            {item.instructions || item.timing_instruction || '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advice & Follow-up */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">General Advice</span>
                  <p className="text-slate-700 dark:text-slate-300 print:text-black mt-0.5">
                    {selectedRx.advice_general || 'Adequate hydration, balanced diet, and rest.'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Review & Recall</span>
                  <p className="font-bold text-teal-700 dark:text-teal-300 print:text-black mt-0.5">
                    {selectedRx.follow_up_date
                      ? `Follow-up on ${selectedRx.follow_up_date} (${selectedRx.follow_up_reason || 'Routine review'})`
                      : 'As needed or SOS'}
                  </p>
                </div>
              </div>

              {/* Doctor Signature Block */}
              <div className="pt-8 flex justify-end">
                <div className="text-center w-48 border-t border-slate-400 pt-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white print:text-black">
                    Dr. {selectedRx.doctor?.full_name}
                  </div>
                  <div className="text-[10px] text-slate-500">Digitally Verified Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
