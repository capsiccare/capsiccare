'use client'

import React, { useState, useEffect } from 'react'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Camera,
  Image as ImageIcon,
  Copy,
  ExternalLink,
} from 'lucide-react'

interface UploadPaperPrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  patientPhone: string
  patientUhid: string
  onSuccess?: () => void
}

export function UploadPaperPrescriptionModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientPhone,
  patientUhid,
  onSuccess,
}: UploadPaperPrescriptionModalProps) {
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; specialty: string }>>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medicinesSummary, setMedicinesSummary] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [dispatchWhatsapp, setDispatchWhatsapp] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<{
    secureUrl: string
    prescriptionNumber: string
    whatsappDispatched: boolean
  } | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadDoctors()
      setSuccessResult(null)
      setError(null)
    }
  }, [isOpen])

  const loadDoctors = async () => {
    try {
      const res = await fetch('/api/v1/doctors?limit=50')
      if (res.ok) {
        const json = await res.json()
        setDoctors(json.data || [])
      }
    } catch (e) {
      console.error('Failed to load doctors', e)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fileUrl) {
      setError('Please take a photo or select a prescription file/image to upload.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patients/${patientId}/prescriptions/upload-paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: fileUrl,
          file_name: fileName || 'paper_prescription.jpg',
          doctor_id: selectedDoctorId || undefined,
          diagnosis: diagnosis.trim() || undefined,
          medicines_summary: medicinesSummary.trim() || undefined,
          dispatch_whatsapp: dispatchWhatsapp,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to upload paper prescription')
      }

      setSuccessResult({
        secureUrl: json.data?.secureUrl || '',
        prescriptionNumber: json.data?.prescriptionNumber || '',
        whatsappDispatched: json.data?.whatsappDispatched || false,
      })

      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to upload prescription')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        {successResult ? (
          <div className="space-y-4 text-center py-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Prescription Digitized Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ref No: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{successResult.prescriptionNumber}</span>
              </p>
            </div>

            {successResult.whatsappDispatched && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 justify-center">
                <Send className="h-4 w-4" />
                <span>One-click WhatsApp notification sent to <strong>{patientPhone}</strong>.</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Patient Secure Access Link (Valid 72 hrs):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={successResult.secureUrl}
                  className="w-full text-xs bg-transparent border-0 text-teal-600 dark:text-teal-400 font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successResult.secureUrl)
                    alert('Copied link to clipboard!')
                  }}
                  className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-300 shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all"
              >
                Done & Return to Desk
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Quick Scan / Upload Paper Prescription
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-800 dark:text-slate-200">{patientName}</strong> ({patientUhid})
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prescription Slip Photo / Scan *
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                {fileUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-medium">
                      <ImageIcon className="h-4 w-4" />
                      <span className="truncate max-w-[250px]">{fileName || 'Prescription Image Selected'}</span>
                    </div>
                    <label className="cursor-pointer text-[11px] text-teal-600 hover:underline block">
                      Click to change photo
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Take a photo or upload scan
                      </span>
                      <p className="text-[10px] text-slate-400">JPG, PNG, PDF up to 10MB</p>
                    </div>
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

            {/* Attending Doctor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prescribing Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Doctor (or leave blank if outside)</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Clinical Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnosis / Chief Complaint
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchitis"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Medicines / Notes
                </label>
                <input
                  type="text"
                  value={medicinesSummary}
                  onChange={(e) => setMedicinesSummary(e.target.value)}
                  placeholder="e.g. Paracetamol 650, Azithromycin"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* WhatsApp Dispatch Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="dispatch-wa"
                checked={dispatchWhatsapp}
                onChange={(e) => setDispatchWhatsapp(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="dispatch-wa" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                Send instant digitized prescription link to patient via WhatsApp (<span className="text-slate-900 dark:text-white font-medium">{patientPhone}</span>)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5 shadow-md transition-all"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Digitizing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload & Deliver to Patient</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
