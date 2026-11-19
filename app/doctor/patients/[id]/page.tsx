'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  Users,
  User,
  Heart,
  Activity,
  AlertTriangle,
  Pill,
  FileText,
  FlaskConical,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
} from 'lucide-react'

export default function DoctorPatientEmrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: patientId } = use(params)
  const [loading, setLoading] = useState(true)
  const [emr, setEmr] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'encounters' | 'prescriptions' | 'vitals' | 'reports' | 'documents'>('encounters')

  const fetchEmr = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/doctor/patients/${patientId}/emr`)
      if (res.ok) {
        const json = await res.json()
        setEmr(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmr()
  }, [patientId])

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Loading Longitudinal EMR...</h2>
      </div>
    )
  }

  const patient = emr?.patient || {}

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/doctor/patients" className="hover:text-teal-600 font-semibold">
            Patient Directory
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-800 dark:text-slate-200">{patient.full_name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>Audited EMR Access</span>
          </span>
        </div>
      </div>

      {/* Patient Demographic Master Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/20">
              {patient.full_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  {patient.uhid}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {patient.gender}, {patient.age_years} Years
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Blood Group: {patient.blood_group || 'Unknown'}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {patient.full_name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{patient.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{patient.city || 'Kolkata'}, {patient.state || 'West Bengal'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Summary Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Allergies ({emr?.allergies?.length || 0})</span>
            </h4>
            {emr?.allergies?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No allergies recorded</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {emr?.allergies?.map((a: any) => (
                  <span
                    key={a.id}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 text-xs font-bold"
                  >
                    {a.allergen_name} ({a.severity})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-2">
              <Heart className="w-3.5 h-3.5" />
              <span>Chronic Conditions ({emr?.conditions?.length || 0})</span>
            </h4>
            {emr?.conditions?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No chronic conditions registered</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {emr?.conditions?.map((c: any) => (
                  <span
                    key={c.id}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs font-bold"
                  >
                    {c.condition_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Longitudinal History Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-800 px-4 flex gap-4 overflow-x-auto">
          {[
            { key: 'encounters', label: 'Consultations', count: emr?.encounters?.length || 0 },
            { key: 'prescriptions', label: 'Prescriptions', count: emr?.prescriptions?.length || 0 },
            { key: 'vitals', label: 'Vitals Timeline', count: emr?.vitals?.length || 0 },
            { key: 'reports', label: 'Lab Reports', count: emr?.reports?.length || 0 },
            { key: 'documents', label: 'Documents & Certificates', count: emr?.documents?.length || 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3.5 border-b-2 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-semibold">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TAB 1: ENCOUNTERS */}
          {activeTab === 'encounters' && (
            <div className="space-y-4">
              {emr?.encounters?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No past consultations recorded.</p>
              ) : (
                emr.encounters.map((enc: any) => (
                  <div
                    key={enc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                          {enc.encounter_number}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{new Date(enc.encounter_date).toLocaleDateString()}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          (Dr. {enc.doctor?.name})
                        </span>
                      </div>
                      <Link
                        href={`/doctor/consultations/${enc.id}`}
                        className="font-bold text-teal-600 hover:underline"
                      >
                        Open Workspace
                      </Link>
                    </div>
                    <div>
                      <strong>Chief Complaint:</strong> {enc.chief_complaint || 'General Checkup'}
                    </div>
                    {enc.assessment && (
                      <div>
                        <strong>Assessment:</strong> {enc.assessment}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {emr?.prescriptions?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No prescriptions found.</p>
              ) : (
                emr.prescriptions.map((rx: any) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                          {rx.prescription_number}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{new Date(rx.prescription_date).toLocaleDateString()}</span>
                        <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                          {rx.status}
                        </span>
                      </div>
                      <Link
                        href={`/doctor/prescriptions/${rx.id}`}
                        target="_blank"
                        className="font-bold text-teal-600 hover:underline"
                      >
                        Print A4 Prescription
                      </Link>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-700/60 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {rx.items?.map((item: any, idx: number) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.medicine_name}
                            </span>
                            <span className="text-slate-500 text-[11px] ml-2">
                              {item.frequency} • {item.timing?.replace('_', ' ')} • {item.duration_value} {item.duration_unit}
                            </span>
                          </div>
                          <span className="font-mono text-slate-500">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: VITALS TIMELINE */}
          {activeTab === 'vitals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">BP (Sys/Dia)</th>
                    <th className="py-2.5 px-3">Pulse</th>
                    <th className="py-2.5 px-3">Temp (°F)</th>
                    <th className="py-2.5 px-3">SpO2</th>
                    <th className="py-2.5 px-3">Weight (kg)</th>
                    <th className="py-2.5 px-3">BMI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {emr?.vitals?.map((v: any) => (
                    <tr key={v.id}>
                      <td className="py-2.5 px-3 font-mono">{new Date(v.recorded_at).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 font-semibold">{v.blood_pressure_systolic}/{v.blood_pressure_diastolic || '-'}</td>
                      <td className="py-2.5 px-3">{v.pulse_rate || '-'} bpm</td>
                      <td className="py-2.5 px-3">{v.temperature_f || '-'}</td>
                      <td className="py-2.5 px-3">{v.spo2_percent || '-'}%</td>
                      <td className="py-2.5 px-3">{v.weight_kg || '-'}</td>
                      <td className="py-2.5 px-3">{v.bmi || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: LAB REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {emr?.reports?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No diagnostic lab reports on file.</p>
              ) : (
                emr.reports.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{r.test?.name}</div>
                      <div className="text-[11px] text-slate-400">Sample: {r.test?.sample_type || 'Blood'}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase text-[10px]">
                      {r.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: CLINICAL DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {emr?.documents?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No medical certificates or referral letters uploaded.</p>
              ) : (
                emr.documents.map((d: any) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{d.title}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{d.document_type?.replace('_', ' ')}</div>
                    </div>
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                      {d.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
