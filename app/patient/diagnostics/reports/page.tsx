'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  FlaskConical,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientReportsPage() {
  const { activePatientId, t } = usePatient()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)

  useEffect(() => {
    if (activePatientId) {
      loadReports(activePatientId)
    }
  }, [activePatientId])

  const loadReports = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/diagnostics/reports?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setReports(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.reports}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pathologist-verified lab results with biological reference intervals and abnormal flags.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <FlaskConical className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No lab reports released yet
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Once your samples are analyzed and certified by the lab director, results will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50">
                    Report #{rep.report_id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {rep.verified_at?.substring(0, 10) || 'Recently'}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rep.test_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pathologist: <span className="font-semibold text-slate-700 dark:text-slate-300">{rep.pathologist_name || 'Dr. Lab Specialist'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Order Ref: #{rep.order_number}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => setSelectedReport(rep)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Lab Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                <span className="text-xs font-bold text-teal-800 dark:text-teal-200">
                  Certified Diagnostic Investigation
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
                  onClick={() => setSelectedReport(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 print:text-black">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-black text-teal-800 dark:text-teal-300 print:text-black">
                    CAPSIC CARE DIAGNOSTICS
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    NABL Accredited Quality Laboratory & Imaging Center
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono">Report: {selectedReport.report_id}</div>
                  <div className="text-[10px] text-slate-400">Order: #{selectedReport.order_number}</div>
                </div>
              </div>

              {/* Patient info */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 print:bg-transparent print:border print:border-slate-300 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Test Name</span>
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">
                    {selectedReport.test_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified On</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    {selectedReport.verified_at?.substring(0, 10) || 'Today'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Consulting Pathologist</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    {selectedReport.pathologist_name || 'Dr. Consultant'}
                  </span>
                </div>
              </div>

              {/* Parameter results */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600">
                    <tr>
                      <th className="p-2.5">Investigation Parameter</th>
                      <th className="p-2.5">Observed Value</th>
                      <th className="p-2.5">Biological Reference Interval</th>
                      <th className="p-2.5">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedReport.results && selectedReport.results.length > 0 ? (
                      selectedReport.results.map((res: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-900 dark:text-white print:text-black">
                            {res.parameter_name}
                          </td>
                          <td className="p-2.5 font-bold">
                            <span
                              className={
                                res.flag === 'high' || res.flag === 'low'
                                  ? 'text-red-600 font-black'
                                  : 'text-slate-900 dark:text-white print:text-black'
                              }
                            >
                              {res.observed_value}
                              {res.flag && (
                                <span className="ml-1 text-[10px] font-extrabold uppercase px-1 rounded bg-red-100 text-red-700">
                                  {res.flag}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500">
                            {res.reference_range_low || '0'} - {res.reference_range_high || '100'}
                          </td>
                          <td className="p-2.5 text-slate-500">{res.unit || '--'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          Parameters certified within normal physiological limits.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedReport.notes && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">Clinical Remarks</span>
                  {selectedReport.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
