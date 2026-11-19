'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react'

export default function PatientLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp' | 'link_uhid'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [uhid, setUhid] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setError(null)
    setStep('otp')
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp !== '123456' && otp.length < 4) {
      setError('Enter OTP (use 123456 in dev/demo mode)')
      return
    }
    setError(null)
    setStep('link_uhid')
  }

  const handleLinkUhid = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      if (uhid) {
        const res = await fetch('/api/v1/patient/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uhid,
            phone,
            birthDate,
          }),
        })

        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || json.message || 'UHID linking failed')
        }
      }

      router.push('/patient')
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check UHID and phone.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-teal-600 text-white items-center justify-center font-black text-2xl shadow-md mb-2">
          C
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          CAPSIC CARE Patient Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your prescriptions, diagnostic reports, and book doctor consultations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Phone */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                Send Verification OTP
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    6-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[11px] text-teal-600 hover:underline"
                  >
                    Change Phone
                  </button>
                </div>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="Enter 123456"
                  className="w-full p-2.5 text-center text-sm font-mono tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Demo hint: Enter code <span className="font-mono font-bold text-teal-600">123456</span> to continue.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all"
              >
                Verify & Continue
              </button>
            </form>
          )}

          {/* STEP 3: Link UHID */}
          {step === 'link_uhid' && (
            <form onSubmit={handleLinkUhid} className="space-y-4">
              <div className="text-center pb-2">
                <FileCheck className="h-8 w-8 text-teal-600 mx-auto mb-1" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Link Existing Clinic UHID
                </h3>
                <p className="text-[11px] text-slate-500">
                  Have a CAPSIC CARE Unique Health Identifier from your doctor slip or invoice?
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinic UHID (Optional)
                </label>
                <input
                  type="text"
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. CC-202611-001"
                  className="w-full p-2.5 text-xs font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : uhid ? 'Verify & Link My Records' : 'Continue to Dashboard'}
                </button>
                <Link
                  href="/patient"
                  className="text-center text-xs text-slate-400 hover:text-slate-600 py-1"
                >
                  Skip for now, go to dashboard
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
