'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  Heart,
  Activity,
  AlertTriangle,
  Pill,
  FileText,
  FlaskConical,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  Printer,
  Share2,
  Plus,
  Trash2,
  Search,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  HelpCircle,
  X,
  RefreshCw,
} from 'lucide-react'

export default function DoctorConsultationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id: encounterId } = use(params)

  const [loading, setLoading] = useState(true)
  const [encounter, setEncounter] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // Clinical Workspace Form States (Center Column)
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [hpi, setHpi] = useState('')
  const [examination, setExamination] = useState('')
  const [assessment, setAssessment] = useState('')
  const [treatmentPlan, setTreatmentPlan] = useState('')
  const [advice, setAdvice] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpReason, setFollowUpReason] = useState('')

  // Vitals State
  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [pulse, setPulse] = useState('')
  const [temp, setTemp] = useState('')
  const [spo2, setSpo2] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [vitalsSaved, setVitalsSaved] = useState(false)

  // Diagnoses List
  const [diagnoses, setDiagnoses] = useState<any[]>([])
  const [newDiagnosisText, setNewDiagnosisText] = useState('')
  const [newIcdCode, setNewIcdCode] = useState('')
  const [newDiagnosisType, setNewDiagnosisType] = useState('provisional')

  // Prescription Items
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([])
  const [prescriptionStatus, setPrescriptionStatus] = useState('draft')
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null)
  const [signatureHash, setSignatureHash] = useState<string | null>(null)

  // Medicine Search & Add
  const [medSearchQuery, setMedSearchQuery] = useState('')
  const [medSearchResults, setMedSearchResults] = useState<any[]>([])
  const [isSearchingMeds, setIsSearchingMeds] = useState(false)

  // Investigation Requests
  const [investigations, setInvestigations] = useState<any[]>([])
  const [newTestName, setNewTestName] = useState('')
  const [newTestPriority, setNewTestPriority] = useState('routine')

  // Patient EMR Data (Left Column)
  const [patientAllergies, setPatientAllergies] = useState<any[]>([])
  const [chronicConditions, setChronicConditions] = useState<any[]>([])
  const [pastPrescriptions, setPastPrescriptions] = useState<any[]>([])
  const [pastReports, setPastReports] = useState<any[]>([])

  // Clinical Templates (Right Column)
  const [templates, setTemplates] = useState<any[]>([])
  const [safetyReport, setSafetyReport] = useState<any>(null)
  const [safetyChecking, setSafetyChecking] = useState(false)
  const [showSignModal, setShowSignModal] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [deliverySuccess, setDeliverySuccess] = useState<string | null>(null)

  // Fetch Encounter and EMR details
  const fetchEncounterData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/doctor/consultations/${encounterId}`)
      if (res.ok) {
        const json = await res.json()
        const enc = json.data
        setEncounter(enc)

        // Initialize Center Column
        setChiefComplaint(enc.chief_complaint || '')
        setHpi(enc.history_of_present_illness || '')
        setExamination(enc.physical_examination || '')
        setAssessment(enc.assessment || '')
        setTreatmentPlan(enc.treatment_plan || '')
        setAdvice(enc.advice || '')
        setFollowUpDate(enc.follow_up_date || '')
        setFollowUpReason(enc.follow_up_instructions || '')

        // Initialize Diagnoses
        setDiagnoses(enc.diagnoses || [])

        // Initialize Vitals
        if (enc.vitals && enc.vitals.length > 0) {
          const v = enc.vitals[0]
          setBpSystolic(v.blood_pressure_systolic ? String(v.blood_pressure_systolic) : '')
          setBpDiastolic(v.blood_pressure_diastolic ? String(v.blood_pressure_diastolic) : '')
          setPulse(v.pulse_rate ? String(v.pulse_rate) : '')
          setTemp(v.temperature_f ? String(v.temperature_f) : '')
          setSpo2(v.spo2_percent ? String(v.spo2_percent) : '')
          setWeightKg(v.weight_kg ? String(v.weight_kg) : '')
        }

        // Initialize Prescription
        if (enc.prescription) {
          setPrescriptionId(enc.prescription.id)
          setPrescriptionStatus(enc.prescription.status)
          setSignatureHash(enc.prescription.digital_signature_hash)
          setPrescriptionItems(enc.prescription.items || [])
          setDeliveryPhone(enc.patient?.phone || '')
        }

        // Initialize Investigations
        setInvestigations(enc.investigations || [])

        // Fetch Patient Full EMR (Allergies, Chronic Conditions, Past Prescriptions)
        if (enc.patient_id) {
          const emrRes = await fetch(`/api/v1/doctor/patients/${enc.patient_id}/emr`)
          if (emrRes.ok) {
            const emrJson = await emrRes.json()
            setPatientAllergies(emrJson.data?.allergies || [])
            setChronicConditions(emrJson.data?.conditions || [])
            setPastPrescriptions(emrJson.data?.prescriptions || [])
            setPastReports(emrJson.data?.reports || [])
          }
        }
      }

      // Fetch Clinical Templates
      const tmplRes = await fetch('/api/v1/doctor/templates')
      if (tmplRes.ok) {
        const tmplJson = await tmplRes.json()
        setTemplates(tmplJson.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEncounterData()
  }, [encounterId])

  // Autosave Clinical Draft Notes
  const handleAutosave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/v1/doctor/consultations/${encounterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chief_complaint: chiefComplaint,
          history_of_present_illness: hpi,
          physical_examination: examination,
          assessment: assessment,
          treatment_plan: treatmentPlan,
          advice: advice,
          follow_up_date: followUpDate || null,
          follow_up_instructions: followUpReason,
        }),
      })

      // Also save prescription draft if items exist
      if (encounter?.doctor_id) {
        await fetch('/api/v1/doctor/prescriptions/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encounterId,
            doctorId: encounter.doctor_id,
            diagnosisSummary: assessment,
            adviceGeneral: advice,
            followUpDate: followUpDate || null,
            followUpReason: followUpReason,
            items: prescriptionItems,
          }),
        })
      }

      setLastSaved(new Date().toLocaleTimeString())
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Record Vitals
  const handleSaveVitals = async () => {
    if (!encounter?.patient_id) return
    try {
      await fetch('/api/v1/doctor/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: encounter.patient_id,
          encounterId: encounter.id,
          blood_pressure_systolic: bpSystolic ? Number(bpSystolic) : null,
          blood_pressure_diastolic: bpDiastolic ? Number(bpDiastolic) : null,
          pulse_rate: pulse ? Number(pulse) : null,
          temperature_f: temp ? Number(temp) : null,
          spo2_percent: spo2 ? Number(spo2) : null,
          weight_kg: weightKg ? Number(weightKg) : null,
        }),
      })
      setVitalsSaved(true)
      setTimeout(() => setVitalsSaved(false), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  // Search Medicines
  useEffect(() => {
    if (!medSearchQuery || medSearchQuery.length < 2) {
      setMedSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingMeds(true)
      try {
        const res = await fetch(`/api/v1/clinical/medicines/search?q=${encodeURIComponent(medSearchQuery)}&limit=10`)
        if (res.ok) {
          const json = await res.json()
          setMedSearchResults(json.data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsSearchingMeds(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [medSearchQuery])

  // Add Medicine Item to Prescription
  const handleAddMedicine = (med: any) => {
    const newItem = {
      medicine_id: med.id,
      medicine_name: `${med.brand_name} (${med.strength})`,
      generic_name: med.generic_name,
      brand_name: med.brand_name,
      dosage_form: med.dosage_form || 'tablet',
      strength: med.strength || '500mg',
      dose: `1 ${med.dosage_form || 'tablet'}`,
      route: med.route || 'Oral',
      frequency: '1-0-1',
      timing: 'after_food',
      duration_value: 5,
      duration_unit: 'days',
      quantity: 10,
      is_prn: false,
      sequence_order: prescriptionItems.length + 1,
    }
    setPrescriptionItems([...prescriptionItems, newItem])
    setMedSearchQuery('')
    setMedSearchResults([])
  }

  // Remove Medicine Item
  const handleRemoveMedicine = (idx: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx))
  }

  // Add Diagnosis
  const handleAddDiagnosis = async () => {
    if (!newDiagnosisText.trim() || !encounter) return
    try {
      const res = await fetch('/api/v1/doctor/diagnoses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounterId,
          patientId: encounter.patient_id,
          doctorId: encounter.doctor_id,
          diagnosisText: newDiagnosisText,
          icd10Code: newIcdCode || null,
          diagnosisType: newDiagnosisType,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setDiagnoses([...diagnoses, json.data])
        setNewDiagnosisText('')
        setNewIcdCode('')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Add Investigation Request
  const handleAddInvestigation = async () => {
    if (!newTestName.trim() || !encounter) return
    try {
      const res = await fetch('/api/v1/doctor/investigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounterId,
          patientId: encounter.patient_id,
          doctorId: encounter.doctor_id,
          testName: newTestName,
          priority: newTestPriority,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setInvestigations([...investigations, json.data])
        setNewTestName('')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Run Safety Checks
  const handleRunSafetyCheck = async () => {
    if (!encounter?.patient_id || prescriptionItems.length === 0) return
    setSafetyChecking(true)
    try {
      const res = await fetch('/api/v1/doctor/prescriptions/safety-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: encounter.patient_id,
          items: prescriptionItems,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setSafetyReport(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSafetyChecking(false)
    }
  }

  // Apply Clinical Template
  const handleApplyTemplate = (tmpl: any) => {
    const c = tmpl.content || {}
    if (c.chief_complaint) setChiefComplaint(c.chief_complaint)
    if (c.hpi) setHpi(c.hpi)
    if (c.examination) setExamination(c.examination)
    if (c.assessment) setAssessment(c.assessment)
    if (c.treatment_plan) setTreatmentPlan(c.treatment_plan)
    if (c.advice) setAdvice(c.advice)
    if (c.follow_up_instructions) setFollowUpReason(c.follow_up_instructions)
  }

  // Sign & Finalize Prescription
  const handleSignPrescription = async () => {
    if (!prescriptionId || !encounter?.doctor_id) return
    try {
      // First save latest draft
      await handleAutosave()

      const res = await fetch('/api/v1/doctor/prescriptions/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId,
          doctorId: encounter.doctor_id,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setPrescriptionStatus('signed')
        setSignatureHash(json.data?.signature_hash)
        setShowSignModal(false)

        // Complete consultation encounter as well
        await fetch(`/api/v1/doctor/consultations/${encounterId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorId: encounter.doctor_id }),
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Deliver Prescription (WhatsApp / SMS)
  const handleDeliver = async (method: 'whatsapp' | 'sms' | 'print') => {
    if (!prescriptionId) return
    try {
      const res = await fetch('/api/v1/doctor/prescriptions/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId,
          method,
          recipientPhone: deliveryPhone,
        }),
      })
      if (res.ok) {
        setDeliverySuccess(`Prescription successfully dispatched via ${method.toUpperCase()}`)
        setTimeout(() => setDeliverySuccess(null), 4000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Loading Clinical Workspace...</h2>
        <p className="text-xs text-slate-400 mt-1">Retrieving longitudinal patient records and formulary</p>
      </div>
    )
  }

  const patient = encounter?.patient || {}
  const doctor = encounter?.doctor || {}

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-16">
      {/* Workspace Header Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sticky top-16 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
            title="Return to Queue"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                {encounter.encounter_number}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {encounter.consultation_type?.toUpperCase()} CONSULTATION
              </span>
              {prescriptionStatus === 'signed' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Digitally Signed</span>
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{patient.full_name}</span>
              <span className="text-xs font-normal text-slate-500">
                ({patient.age_years} yrs, {patient.gender} • UHID: {patient.uhid})
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {lastSaved && (
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">
              Autosaved at {lastSaved}
            </span>
          )}

          <button
            onClick={handleAutosave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleRunSafetyCheck}
            disabled={safetyChecking || prescriptionItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{safetyChecking ? 'Checking...' : 'Safety Check'}</span>
          </button>

          {prescriptionId && (
            <Link
              href={`/doctor/prescriptions/${prescriptionId}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </Link>
          )}

          {prescriptionStatus !== 'signed' ? (
            <button
              onClick={() => setShowSignModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign & Finalize</span>
            </button>
          ) : (
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Share2 className="w-4 h-4" />
              <span>Deliver Rx</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Report Notice if triggered */}
      {safetyReport && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            safetyReport.is_safe
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              {safetyReport.is_safe ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {safetyReport.is_safe
                    ? 'No Allergy or Duplicate Formulary Conflicts Detected'
                    : `Clinical Safety Alert: ${safetyReport.alerts.length} conflict(s) detected`}
                </h4>
                <div className="space-y-1.5 mt-2">
                  {safetyReport.alerts.map((alert: any, idx: number) => (
                    <div key={idx} className="text-xs bg-white/70 dark:bg-black/30 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                      <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 mr-2">
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="font-semibold">{alert.medicine_name}:</span> {alert.message}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                        Action: {alert.action}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  {safetyReport.disclaimer}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSafetyReport(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3-COLUMN CLINICAL WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Patient Summary, EMR, Allergies, Vitals (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold">
                {patient.full_name?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {patient.full_name}
                </h3>
                <p className="font-mono text-xs text-teal-600 dark:text-teal-400 font-medium">
                  {patient.uhid}
                </p>
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Age / Gender:</span>
                <span className="font-semibold">{patient.age_years} yrs, {patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-semibold">{patient.blood_group || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold">{patient.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">City:</span>
                <span className="font-semibold">{patient.city || 'Kolkata'}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/doctor/patients/${patient.id}`}
                target="_blank"
                className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center justify-between"
              >
                <span>View Longitudinal EMR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Allergies Alert Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Documented Allergies</span>
            </h4>
            {patientAllergies.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No drug allergies documented.</p>
            ) : (
              <div className="space-y-1.5">
                {patientAllergies.map((alg: any) => (
                  <div
                    key={alg.id}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs"
                  >
                    <span className="font-bold text-rose-700 dark:text-rose-300">
                      {alg.allergen_name}
                    </span>
                    <span className="text-rose-500 text-[10px] ml-1.5 uppercase font-semibold">
                      ({alg.severity})
                    </span>
                    {alg.reaction && <p className="text-[11px] text-slate-500 mt-0.5">{alg.reaction}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Heart className="w-3.5 h-3.5 text-purple-500" />
              <span>Chronic Conditions</span>
            </h4>
            {chronicConditions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No chronic diseases registered.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {chronicConditions.map((cond: any) => (
                  <span
                    key={cond.id}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                  >
                    {cond.condition_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Vital Signs Pre-Consultation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Patient Vitals</span>
              </h4>
              {vitalsSaved && (
                <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">BP (Sys/Dia)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="120"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-14 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    placeholder="80"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-14 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">Pulse (bpm)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="65"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleSaveVitals}
              className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Update Vitals
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: Clinical Documentation & Prescription Builder (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Section 1: Chief Complaint & HPI */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Chief Complaint & Clinical History (SOAP - S)</span>
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Chief Complaint</label>
              <input
                type="text"
                placeholder="e.g. Fever, productive cough, and breathlessness on exertion for 3 days"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">History of Present Illness (HPI)</label>
              <textarea
                rows={2}
                placeholder="Onset, duration, character, radiation, aggravating/relieving factors..."
                value={hpi}
                onChange={(e) => setHpi(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Section 2: Physical Examination */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Physical Examination (SOAP - O)</span>
            </h3>
            <textarea
              rows={2}
              placeholder="General appearance, pallor, icterus, chest auscultation, abdominal palpation, systemic review..."
              value={examination}
              onChange={(e) => setExamination(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Section 3: Diagnoses (ICD-10 / Clinical) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Diagnosis & Assessment (SOAP - A)</span>
              </h3>
            </div>

            {/* Existing Diagnoses */}
            <div className="space-y-1.5">
              {diagnoses.map((diag, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{diag.diagnosis_text}</span>
                    {diag.icd10_code && (
                      <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {diag.icd10_code}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">
                      ({diag.diagnosis_type})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (diag.id) {
                        fetch(`/api/v1/doctor/diagnoses?id=${diag.id}`, { method: 'DELETE' })
                      }
                      setDiagnoses(diagnoses.filter((_, i) => i !== idx))
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Diagnosis */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Diagnosis name (e.g. Type 2 Diabetes Mellitus, Essential Hypertension)..."
                value={newDiagnosisText}
                onChange={(e) => setNewDiagnosisText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="ICD-10 (e.g. E11.9)"
                value={newIcdCode}
                onChange={(e) => setNewIcdCode(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <button
                onClick={handleAddDiagnosis}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Section 4: DIGITAL PRESCRIPTION COMPOSER (SOAP - P) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Digital Prescription (Formulary & Dosage Builder)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Search generic ingredients or Indian brand formulations</p>
              </div>

              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                {prescriptionItems.length} Medication(s)
              </span>
            </div>

            {/* Medicine Fast Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by brand (Dolo, Pan, Augmentin, Telma...) or generic (Paracetamol, Metformin)..."
                value={medSearchQuery}
                onChange={(e) => setMedSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />

              {/* Autocomplete Dropdown */}
              {medSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-30 divide-y divide-slate-100 dark:divide-slate-800">
                  {medSearchResults.map((med) => (
                    <div
                      key={med.id}
                      onClick={() => handleAddMedicine(med)}
                      className="p-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {med.brand_name} <span className="text-teal-600 dark:text-teal-400 font-normal">({med.strength})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Generic: {med.generic_name} • {med.dosage_form} • {med.therapeutic_class}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {med.schedule_category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescription Items Table */}
            <div className="space-y-3">
              {prescriptionItems.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No medications added. Search formulary above or click a template from the right panel.
                </div>
              ) : (
                prescriptionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {idx + 1}. {item.medicine_name}
                        </span>
                        <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                          {item.generic_name} • {item.dosage_form}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Dosage, Frequency, Timing, Duration Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400">Frequency</label>
                        <select
                          value={item.frequency}
                          onChange={(e) => {
                            const updated = [...prescriptionItems]
                            updated[idx].frequency = e.target.value
                            setPrescriptionItems(updated)
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                        >
                          <option value="1-0-1">1-0-1 (Twice daily)</option>
                          <option value="1-0-0">1-0-0 (Morning once)</option>
                          <option value="0-0-1">0-0-1 (Night once)</option>
                          <option value="1-1-1">1-1-1 (Thrice daily)</option>
                          <option value="SOS">SOS (As needed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400">Timing</label>
                        <select
                          value={item.timing}
                          onChange={(e) => {
                            const updated = [...prescriptionItems]
                            updated[idx].timing = e.target.value
                            setPrescriptionItems(updated)
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                        >
                          <option value="after_food">After food</option>
                          <option value="before_food">Before food</option>
                          <option value="empty_stomach">Empty stomach</option>
                          <option value="at_bedtime">At bedtime</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400">Duration</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.duration_value}
                            onChange={(e) => {
                              const updated = [...prescriptionItems]
                              updated[idx].duration_value = Number(e.target.value)
                              setPrescriptionItems(updated)
                            }}
                            className="w-14 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                          />
                          <span className="text-[11px] text-slate-500">{item.duration_unit}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400">Qty (Total)</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...prescriptionItems]
                            updated[idx].quantity = Number(e.target.value)
                            setPrescriptionItems(updated)
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 5: Investigation Requests (Diagnostics Integration) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-rose-500" />
              <span>Recommended Diagnostic Investigations</span>
            </h3>

            <div className="space-y-1.5">
              {investigations.map((inv, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{inv.test_name}</span>
                    <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                      {inv.priority}
                    </span>
                  </div>
                  <button
                    onClick={() => setInvestigations(investigations.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Test name (e.g. Complete Hemogram, HbA1c, Lipid Profile, ECG, X-Ray Chest)..."
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <select
                value={newTestPriority}
                onChange={(e) => setNewTestPriority(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
              <button
                onClick={handleAddInvestigation}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                + Add Test
              </button>
            </div>
          </div>

          {/* Section 6: Advice & Follow-Up (CareFlow Integration) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>General Advice & Follow-Up Plan</span>
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">General & Dietary Advice</label>
              <textarea
                rows={2}
                placeholder="Hydration, low-sodium diet, rest, warning signs..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Follow-Up Review Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Follow-Up Reason</label>
                <input
                  type="text"
                  placeholder="Review blood glucose / BP / SOS"
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical Templates, Past Prescriptions, Diagnostic Reports (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick 1-Click Specialty Templates */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Specialty SOAP Templates</span>
            </h4>
            <div className="space-y-1.5">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-all text-xs group"
                >
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600">
                    {tmpl.template_name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tmpl.specialty}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Previous Prescriptions History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Previous Prescriptions</span>
            </h4>
            {pastPrescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous prescriptions recorded.</p>
            ) : (
              <div className="space-y-2">
                {pastPrescriptions.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                        {p.prescription_number}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.prescription_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                      Dr: {p.prescriber_name}
                    </div>
                    {p.items && p.items.length > 0 && (
                      <div className="text-[11px] text-slate-500 truncate">
                        {p.items.map((i: any) => i.medicine_name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic Reports History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-rose-500" />
              <span>Recent Diagnostic Reports</span>
            </h4>
            {pastReports.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No lab reports on file.</p>
            ) : (
              <div className="space-y-2">
                {pastReports.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">{r.test?.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>Status: {r.status}</span>
                      <span>{r.released_at ? new Date(r.released_at).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SIGN & FINALIZE MODAL */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Confirm & Digitally Sign Prescription</span>
              </h3>
              <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                You are about to sign this digital prescription as{' '}
                <strong className="text-slate-900 dark:text-white">{doctor.name}</strong> (Reg No:{' '}
                <strong className="font-mono">{doctor.registration_number || 'WBMC-Verified'}</strong>).
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 space-y-1">
                <div>Patient: <strong>{patient.full_name}</strong> (UHID: {patient.uhid})</div>
                <div>Medications: <strong>{prescriptionItems.length} item(s)</strong></div>
                <div>Investigations: <strong>{investigations.length} test(s)</strong></div>
                {followUpDate && <div>Follow-up: <strong>{followUpDate}</strong></div>}
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Signing creates an immutable cryptographic SHA-256 snapshot. Any subsequent changes require the
                formal clinical amendment workflow.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSignPrescription}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
              >
                Confirm & Sign Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION DELIVERY MODAL */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <span>Deliver Prescription</span>
              </h3>
              <button onClick={() => setShowDeliveryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {deliverySuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {deliverySuccess}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Patient Phone Number</label>
                <input
                  type="text"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleDeliver('whatsapp')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <span>Send WhatsApp</span>
                </button>
                <button
                  onClick={() => handleDeliver('sms')}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <span>Send SMS Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
