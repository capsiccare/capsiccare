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
  FileText,
  Clock,
  Sparkles,
  Stethoscope,
  Lock,
  MessageSquare,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react'

// Safe fetch helper that guarantees no raw HTML parse crash
async function safeJsonFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options)
  const text = await res.text()
  let data: any = null
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Server responded with ${res.status}. Please check your connection or try again.`)
  }
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || data?.error || `Request failed (${res.status})`)
  }
  return data
}

function PatientLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectQuery = searchParams.get('redirect')

  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [whatsappDirectUrl, setWhatsappDirectUrl] = useState<string | null>(null)
  const [sentTargetMasked, setSentTargetMasked] = useState<string | null>(null)

  // 1. Send OTP to WhatsApp / Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const trimmed = identifier.trim()
    if (!trimmed) {
      setErrorMessage('Please enter your Mobile Number, UHID, or Email address.')
      return
    }

    setLoading(true)
    try {
      const json = await safeJsonFetch('/api/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmed }),
      })

      const result = json.data || {}
      setIsOtpSent(true)
      setSentTargetMasked(result.maskedTarget || trimmed)
      setWhatsappDirectUrl(result.whatsappDirectUrl || null)
      setSuccessMessage(
        result.message || 'Verification code sent via WhatsApp & SMS. (Demo code: 123456)'
      )
    } catch (err: any) {
      console.error('Send OTP error:', err)
      setErrorMessage(err.message || 'Unable to send verification code. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Verify OTP
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
      const json = await safeJsonFetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim(),
        }),
      })

      setSuccessMessage('Authentication successful! Opening your health records...')
      const targetUrl = redirectQuery || json.data?.redirectUrl || '/patient'
      setTimeout(() => {
        router.push(targetUrl)
      }, 400)
    } catch (err: any) {
      console.error('Verify OTP error:', err)
      setErrorMessage(err.message || 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Password / PIN Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter your Mobile/UHID and Password/PIN.')
      return
    }

    setLoading(true)
    try {
      const json = await safeJsonFetch('/api/v1/auth/password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          portal: 'patient',
        }),
      })

      setSuccessMessage('Login verified! Redirecting to Patient Portal...')
      const targetUrl = redirectQuery || json.data?.redirectUrl || '/patient'
      setTimeout(() => {
        router.push(targetUrl)
      }, 400)
    } catch (err: any) {
      console.error('Password login error:', err)
      setErrorMessage(err.message || 'Incorrect credentials. Try default PIN 123456 or request OTP.')
    } finally {
      setLoading(false)
    }
  }

  // 4. Quick Demo Sign-in with Tanuja Begum
  const quickDemoLogin = async () => {
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setIdentifier('9830225334')
    try {
      const json = await safeJsonFetch('/api/v1/auth/password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '9830225334',
          password: '123456',
          portal: 'patient',
        }),
      })

      setSuccessMessage('Logged in as Tanuja Begum (Demo Patient). Loading...')
      setTimeout(() => {
        router.push(redirectQuery || '/patient')
      }, 300)
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
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

      {/* Main Form Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
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

          {/* Dual Mode Switcher (OTP vs Password) */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp')
                setErrorMessage(null)
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={14} /> OTP (WhatsApp/Email)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password')
                setErrorMessage(null)
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound size={14} /> Password / PIN
            </button>
          </div>

          {/* METHOD 1: OTP AUTHENTICATION */}
          {authMethod === 'otp' && (
            <>
              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Mobile Number, UHID or Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. 9830225334 or CAP-2026-XXXXXX"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      We will send a 6-digit verification code directly to WhatsApp &amp; Email.
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Enter 6-Digit Code *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSent(false)
                          setOtp('')
                          setErrorMessage(null)
                        }}
                        className="text-[11px] text-teal-400 hover:underline"
                      >
                        Change number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-3 text-center tracking-[0.5em] font-mono text-xl bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Sent to {sentTargetMasked}</span>
                      <button
                        type="button"
                        onClick={() => setOtp('123456')}
                        className="text-xs font-bold text-teal-400 hover:underline bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20"
                      >
                        Use Demo PIN (123456)
                      </button>
                    </div>

                    {whatsappDirectUrl && (
                      <div className="mt-3">
                        <a
                          href={whatsappDirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2 hover:bg-emerald-900/60 transition-colors"
                        >
                          <ExternalLink size={14} /> Open OTP message in WhatsApp Web/App
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter Patient Portal'} <ArrowRight size={16} />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-xs text-slate-400 hover:text-teal-300 underline"
                    >
                      Didn&apos;t receive code? Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* METHOD 2: PASSWORD / PORTAL PIN AUTHENTICATION */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile or CAP-YYYY-XXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Password or 6-Digit Portal PIN *
                  </label>
                  <span className="text-[11px] text-teal-400/80 font-mono">
                    Default PIN: 123456
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Portal PIN or Password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'} <ArrowRight size={16} />
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
