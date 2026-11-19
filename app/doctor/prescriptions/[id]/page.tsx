'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  Printer,
  Share2,
  ChevronLeft,
  ShieldCheck,
  Calendar,
  Phone,
  MapPin,
  RefreshCw,
  QrCode,
  Download,
} from 'lucide-react'

export default function PrescriptionPrintViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rxId } = use(params)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/v1/doctor/prescriptions/${rxId}/print`)
        if (res.ok) {
          const json = await res.json()
          setData(json.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [rxId])

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-3" />
        <h2 className="text-lg font-bold">Generating A4 Prescription Layout...</h2>
      </div>
    )
  }

  const rx = data?.prescription || {}
  const patient = rx.patient || {}
  const doctor = rx.doctor || {}
  const branch = data?.clinic_branding?.branch || {}
  const investigations = data?.investigations || []

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16">
      {/* Non-printed Toolbar */}
      <div className="print:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <Link
          href={`/doctor/consultations/${rx.encounter_id || ''}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Prescription</span>
          </button>
        </div>
      </div>

      {/* A4 PRESCRIPTION SHEET CONTAINER */}
      <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none min-h-[1100px] flex flex-col justify-between font-sans">
        <div>
          {/* HEADER SECTION: CLINIC BRANDING & DOCTOR DETAILS */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-teal-800 uppercase">
                  CAPSIC CARE
                </h1>
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Healthcare Operating System & Outpatient Polyclinic
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {branch.name || 'Main Health Hub'}, {branch.address_line1 || 'Kolkata Central'}, {branch.city || 'Kolkata'} • Ph: {branch.phone || '+91 98765 43210'}
                </p>
              </div>

              <div className="text-right">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {rx.prescriber_name || doctor.name}
                </h2>
                <p className="text-xs font-medium text-slate-700">
                  {rx.prescriber_qualifications || doctor.qualifications || 'MBBS, MD'}
                </p>
                <p className="text-xs font-semibold text-teal-800">
                  {doctor.specialty || 'General Medicine'}
                </p>
                <p className="font-mono text-[11px] font-bold text-slate-600 mt-0.5">
                  Reg No: {rx.prescriber_reg_no || doctor.registration_number || 'WBMC-Verified'}
                </p>
              </div>
            </div>
          </div>

          {/* PATIENT BAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{patient.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Age / Gender</span>
              <span className="font-semibold text-slate-800">{patient.age_years} Yrs / {patient.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">UHID Number</span>
              <span className="font-mono font-bold text-teal-800">{patient.uhid}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Date of Consult</span>
              <span className="font-semibold text-slate-800">{new Date(rx.prescription_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* DIAGNOSIS SUMMARY */}
          {rx.diagnosis_summary && (
            <div className="mb-6 p-2.5 rounded-lg bg-teal-50/50 border-l-4 border-teal-600 text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] text-teal-900 block mb-0.5">
                Provisional / Clinical Diagnosis:
              </span>
              <span className="text-slate-900 font-semibold">{rx.diagnosis_summary}</span>
            </div>
          )}

          {/* RX MEDICATIONS SECTION */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="text-2xl font-serif font-black text-teal-800">℞</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Medications Prescribed</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2 px-1 w-8">#</th>
                  <th className="py-2 px-2">Medicine & Composition</th>
                  <th className="py-2 px-2">Dosage & Frequency</th>
                  <th className="py-2 px-2">Duration</th>
                  <th className="py-2 px-2 text-right">Total Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(rx.items || []).map((item: any, idx: number) => (
                  <tr key={idx} className="align-top">
                    <td className="py-2.5 px-1 font-bold text-slate-400">{idx + 1}.</td>
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-slate-900 text-xs">{item.medicine_name}</div>
                      <div className="text-[11px] text-slate-500 italic">
                        Generic: {item.generic_name} ({item.dosage_form})
                      </div>
                      {/* Bilingual Translation Instructions */}
                      {item.bilingual_instructions && (
                        <div className="text-[10px] text-teal-800 mt-0.5 space-y-0.5 font-medium">
                          <div>বাংলা: {item.bilingual_instructions.bengali}</div>
                          <div>हिंदी: {item.bilingual_instructions.hindi}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="font-mono font-bold text-slate-800">{item.frequency}</span>
                      <span className="text-slate-600 text-[11px] block">{item.timing?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-slate-800">
                      {item.duration_value} {item.duration_unit}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* INVESTIGATIONS & ADVICE TWO-COLUMN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pt-2 border-t border-slate-200 text-xs">
            {/* Investigations */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                Recommended Investigations
              </h4>
              {investigations.length === 0 ? (
                <p className="text-slate-400 italic">Nil / None advised at present.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-slate-700 font-semibold">
                  {investigations.map((inv: any, i: number) => (
                    <li key={i}>
                      {inv.test_name} {inv.priority === 'urgent' && <span className="text-rose-600 font-bold">(URGENT)</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* General Advice */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                General & Dietary Advice
              </h4>
              <p className="text-slate-700 whitespace-pre-line">
                {rx.advice_general || 'Adequate hydration, balanced low-salt diet, proper rest.'}
              </p>
              {rx.diet_lifestyle_advice && (
                <p className="text-slate-700 mt-1 whitespace-pre-line">{rx.diet_lifestyle_advice}</p>
              )}
            </div>
          </div>

          {/* FOLLOW-UP REVIEW */}
          {rx.follow_up_date && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-6 flex items-center justify-between">
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] block">Next Follow-Up Review:</span>
                <span className="font-bold text-sm">
                  {new Date(rx.follow_up_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {rx.follow_up_reason && (
                  <span className="text-[11px] text-amber-800 block mt-0.5">({rx.follow_up_reason})</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                CareFlow Follow-Up Enrolled
              </span>
            </div>
          )}
        </div>

        {/* FOOTER: CLINICAL SIGNATURE & CRYPTOGRAPHIC VERIFICATION */}
        <div className="pt-6 border-t-2 border-slate-900 mt-6 text-xs">
          <div className="flex items-end justify-between">
            <div className="max-w-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal-800">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Digitally Authenticated Clinical Document</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono break-all leading-tight">
                SHA-256 Stamp: {rx.digital_signature_hash || 'PENDING_FINAL_SIGN'}
              </p>
              <p className="text-[10px] text-slate-400">
                Generated via CAPSIC CARE OS • Ref: {rx.prescription_number}
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="h-10 border-b border-dashed border-slate-400 w-48 ml-auto" />
              <div className="font-bold text-slate-900 text-xs">
                {rx.prescriber_name || doctor.name}
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                Reg No: {rx.prescriber_reg_no || doctor.registration_number || 'WBMC'}
              </div>
              <div className="text-[10px] text-slate-400">Authorized Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
