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
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientPrescriptionsPage() {
  const { activePatientId, t } = usePatient()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRx, setSelectedRx] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    if (activePatientId) {
      loadPrescriptions(activePatientId)
    }
  }, [activePatientId])

  const loadPrescriptions = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/prescriptions?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setPrescriptions(json.data || [])
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.prescriptions}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your finalized electronic prescriptions, medicine regimens, and doctor instructions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No signed prescriptions on record
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Completed prescriptions issued by your attending physician will appear here.
          </p>
        </div>
      ) : (
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
                  View Prescription & Print
                </button>
              </div>
            </div>
          ))}
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
                    Chamber: {selectedRx.branch?.name || 'Main Health Center'} • Ph: +91 98765 43210
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
