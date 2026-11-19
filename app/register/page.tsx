'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Stethoscope,
  Users,
  Building2,
  Heart,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
} from 'lucide-react'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = (searchParams.get('role') as 'patient' | 'doctor' | 'staff') || 'doctor'

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor' | 'staff'>(defaultTab)
  const [branches, setBranches] = useState<Array<{ id: string; name: string; city: string }>>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Doctor Form State
  const [docForm, setDocForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    registration_number: '',
    specialty: 'General Medicine',
    qualifications: 'MBBS',
    experience_years: 5,
    consultation_fee: 500,
    telemedicine_fee: 400,
    branch_id: '',
    about: '',
  })

  // Patient Form State
  const [patForm, setPatForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'male' as 'male' | 'female' | 'other',
    date_of_birth: '',
    age_years: '',
    blood_group: '',
    address_line1: '',
    city: 'Howrah',
    pincode: '',
    branch_id: '',
  })

  // Staff Form State
  const [staffForm, setStaffForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'receptionist' as 'receptionist' | 'nurse' | 'lab_staff' | 'phlebotomist' | 'billing_staff' | 'calling_executive' | 'branch_admin',
    branch_id: '',
    designation: '',
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/v1/branches')
      if (res.ok) {
        const json = await res.json()
        const branchList = json.data || []
        setBranches(branchList)
        if (branchList.length > 0) {
          setDocForm((prev) => ({ ...prev, branch_id: prev.branch_id || branchList[0].id }))
          setPatForm((prev) => ({ ...prev, branch_id: prev.branch_id || branchList[0].id }))
          setStaffForm((prev) => ({ ...prev, branch_id: prev.branch_id || branchList[0].id }))
        }
      }
    } catch (e) {
      console.error('Failed to load branches', e)
    }
  }

  // Handle Doctor Registration
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/register/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Registration failed')
      }

      setSuccessMessage('Doctor chamber registration successful! Redirecting to doctor workspace...')
      setTimeout(() => {
        router.push('/login?portal=doctor')
      }, 1200)
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle Patient Registration
  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/register/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patForm),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Registration failed')
      }

      setSuccessMessage(`UHID Generated: ${json.data?.patient?.uhid}. Entering Patient Portal...`)
      setTimeout(() => {
        router.push(json.data?.redirectUrl || '/patient')
      }, 1000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle Staff Registration
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/register/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Registration failed')
      }

      setSuccessMessage(`Registered as ${json.data?.role}. Redirecting to login...`)
      setTimeout(() => {
        router.push('/login?portal=staff')
      }, 1200)
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-teal-500/20">
            C
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              CAPSIC CARE <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">OS</span>
            </h1>
            <p className="text-[11px] text-slate-400">Healthcare Network & Operating System</p>
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
        <p className="mt-1 text-xs text-slate-400">
          Join our integrated healthcare platform as a Doctor, Patient, or Healthcare Staff member.
        </p>

        {/* Persona Selector Tabs */}
        <div className="mt-6 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-3 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('doctor')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'doctor'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            <span>Doctor Chamber</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('patient')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'patient'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Patient Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('staff')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'staff'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Clinic Staff</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl">
          {errorMessage && (
            <div className="mb-6 rounded-xl bg-red-950/60 border border-red-800/80 p-4 text-xs text-red-300 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl bg-teal-950/60 border border-teal-800/80 p-4 text-xs text-teal-300 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* 1. DOCTOR REGISTRATION FORM */}
          {activeTab === 'doctor' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Doctor Clinical Onboarding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                    placeholder="Dr. Anirban Roy"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Medical Council Reg No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.registration_number}
                    onChange={(e) => setDocForm({ ...docForm, registration_number: e.target.value })}
                    placeholder="WBMC-12345"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Medical Specialty *
                  </label>
                  <select
                    value={docForm.specialty}
                    onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="General Medicine">General Medicine / Physician</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="ENT">ENT</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="Endocrinology">Endocrinology / Diabetes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Degrees / Qualifications *
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.qualifications}
                    onChange={(e) => setDocForm({ ...docForm, qualifications: e.target.value })}
                    placeholder="MBBS, MD (Medicine)"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={docForm.email}
                    onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                    placeholder="doctor@capsic.in"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={docForm.phone}
                    onChange={(e) => setDocForm({ ...docForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    OPD Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={docForm.consultation_fee}
                    onChange={(e) => setDocForm({ ...docForm, consultation_fee: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tele-Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={docForm.telemedicine_fee}
                    onChange={(e) => setDocForm({ ...docForm, telemedicine_fee: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Experience (Yrs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={docForm.experience_years}
                    onChange={(e) => setDocForm({ ...docForm, experience_years: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Chamber / Branch
                </label>
                <select
                  value={docForm.branch_id}
                  onChange={(e) => setDocForm({ ...docForm, branch_id: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={docForm.password}
                    onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  {loading ? 'Creating Doctor Profile...' : 'Complete Doctor Registration'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* 2. PATIENT FAST REGISTRATION FORM */}
          {activeTab === 'patient' && (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Patient Health ID (UHID) Fast Sign Up
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patForm.full_name}
                    onChange={(e) => setPatForm({ ...patForm, full_name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Mondal"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={patForm.phone}
                    onChange={(e) => setPatForm({ ...patForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={patForm.gender}
                    onChange={(e) => setPatForm({ ...patForm, gender: e.target.value as any })}
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={patForm.age_years}
                    onChange={(e) => setPatForm({ ...patForm, age_years: e.target.value })}
                    placeholder="35"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={patForm.blood_group}
                    onChange={(e) => setPatForm({ ...patForm, blood_group: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Address / Area
                  </label>
                  <input
                    type="text"
                    value={patForm.address_line1}
                    onChange={(e) => setPatForm({ ...patForm, address_line1: e.target.value })}
                    placeholder="Bankra Bazar, Domjur"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City / Pincode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={patForm.city}
                      onChange={(e) => setPatForm({ ...patForm, city: e.target.value })}
                      placeholder="Howrah"
                      className="w-1/2 text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                    <input
                      type="text"
                      value={patForm.pincode}
                      onChange={(e) => setPatForm({ ...patForm, pincode: e.target.value })}
                      placeholder="711403"
                      className="w-1/2 text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  {loading ? 'Creating UHID...' : 'Generate UHID & Access Portal'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* 3. STAFF / HEALTHCARE WORKER REGISTRATION */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Healthcare Staff & Operations Desk
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffForm.full_name}
                    onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                    placeholder="e.g. Priya Mukherjee"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operational Role *
                  </label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="receptionist">Front Desk Receptionist</option>
                    <option value="billing_staff">Billing & POS Cashier</option>
                    <option value="nurse">Staff Nurse / OPD Assistant</option>
                    <option value="lab_staff">Medical Lab Technician</option>
                    <option value="phlebotomist">Phlebotomist (Home & Lab)</option>
                    <option value="calling_executive">Calling & CareFlow Executive</option>
                    <option value="branch_admin">Branch Operations Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Staff Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="staff@capsic.in"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Branch *
                </label>
                <select
                  value={staffForm.branch_id}
                  onChange={(e) => setStaffForm({ ...staffForm, branch_id: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  {loading ? 'Registering Staff...' : 'Register Staff Account'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                href={`/login?portal=${activeTab}`}
                className="text-teal-400 font-semibold hover:underline"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <RegisterContent />
    </Suspense>
  )
}
