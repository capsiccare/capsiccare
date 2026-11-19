'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  Heart,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  Stethoscope,
} from 'lucide-react'

function PatientLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectQuery = searchParams.get('redirect')

  const [phoneOrUhid, setPhoneOrUhid] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanInput = phoneOrUhid.trim().replace(/\D/g, '')
    const isUhid = phoneOrUhid.trim().toUpperCase().startsWith('CAP-')

    if (!isUhid && cleanInput.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number or UHID (e.g. CAP-2026-XXXXXX).')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/patient-fast-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: isUhid ? undefined : cleanInput.slice(-10),
          uhid: isUhid ? phoneOrUhid.trim().toUpperCase() : undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Patient verification failed.')
      }

      setIsOtpSent(true)
      setSuccessMessage('6-digit verification code sent via WhatsApp & SMS. (Demo PIN: 123456)')
    } catch (err: any) {
      console.error('Fast login error:', err)
      setErrorMessage(err.message || 'Unable to find patient. Please check phone number or register.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    try {
      const cleanPhone = phoneOrUhid.trim().replace(/\D/g, '').slice(-10)
      const isUhid = phoneOrUhid.trim().toUpperCase().startsWith('CAP-')

      const res = await fetch('/api/v1/patient/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: isUhid ? undefined : cleanPhone,
          uhid: isUhid ? phoneOrUhid.trim().toUpperCase() : undefined,
          otp: otp.trim(),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Verification failed')
      }

      const patientData = json.data?.patient
      setSuccessMessage(`Welcome back, ${patientData?.full_name || 'Patient'}! Loading records...`)

      setTimeout(() => {
        if (redirectQuery) {
          router.push(redirectQuery)
        } else {
          router.push(`/patient?patientId=${patientData?.id}&uhid=${patientData?.uhid}`)
        }
      }, 600)
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const quickDemoLogin = async () => {
    setPhoneOrUhid('9830225334')
    setErrorMessage(null)
    setLoading(true)
    try {
      const res = await fetch('/api/v1/patient/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9830225334' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Demo login failed')
      const p = json.data?.patient
      setSuccessMessage(`Signed in as ${p.full_name}! Redirecting to portal...`)
      setTimeout(() => {
        router.push(`/patient?patientId=${p.id}&uhid=${p.uhid}`)
      }, 500)
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo patient not found.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Header */}
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4 group">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity size={26} />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              CAPSIC CARE <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">PATIENT</span>
            </h1>
            <p className="text-[11px] text-slate-400">Digital Health Records &amp; Self-Service</p>
          </div>
        </Link>

        <h2 className="text-2xl font-black text-white">
          Patient Portal Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          View your e-prescriptions, diagnostic test reports, queue tokens, and medical history in one place.
        </p>

        {/* Benefits Ribbon */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-left">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <FileText size={16} className="text-teal-400 mb-1" />
            <p className="font-bold text-slate-200">Prescriptions</p>
            <p className="text-[10px] text-slate-400">Digital &amp; Paper</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Heart size={16} className="text-rose-400 mb-1" />
            <p className="font-bold text-slate-200">Lab Reports</p>
            <p className="text-[10px] text-slate-400">Direct Download</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Clock size={16} className="text-emerald-400 mb-1" />
            <p className="font-bold text-slate-200">Live Tokens</p>
            <p className="text-[10px] text-slate-400">Doctor Queue</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Mobile Number or UHID *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={phoneOrUhid}
                    onChange={(e) => setPhoneOrUhid(e.target.value)}
                    placeholder="Enter 10-digit mobile or CAP-YYYY-XXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We will send a one-time login code via SMS / WhatsApp.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Get Login Code'} <ArrowRight size={16} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={quickDemoLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-3 bg-slate-800/80 hover:bg-slate-800 text-teal-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-teal-500/20 cursor-pointer"
                >
                  <Sparkles size={14} className="text-teal-400" /> Quick Sign-in with Demo Patient (Tanuja Begum)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Enter Verification Code *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="text-xs text-teal-400 hover:underline"
                  >
                    Change Phone / UHID
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code (e.g. 123456)"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono tracking-widest text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Access My Health Records'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Quick Registration Helper */}
          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            First time at Capsic Care?{' '}
            <Link href="/lab-tests" className="text-teal-400 font-bold hover:underline">
              Book a Test
            </Link>{' '}
            or{' '}
            <Link href="/doctors" className="text-teal-400 font-bold hover:underline">
              Consult a Doctor
            </Link>
          </div>
        </div>

        {/* Complete Separation: Discreet Internal Portal Link */}
        <div className="text-center mt-6">
          <Link
            href="/portal/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Stethoscope size={14} className="text-teal-500" />
            Doctor or Staff Member? <span className="underline font-semibold text-slate-400">Internal Clinical Portal</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-bold">Loading Patient Portal...</div>}>
      <PatientLoginForm />
    </Suspense>
  )
}
