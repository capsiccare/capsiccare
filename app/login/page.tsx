'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Heart,
  Users,
  Building2,
  Smartphone,
  ChevronRight,
} from 'lucide-react'

type PortalType = 'doctor' | 'patient' | 'staff' | 'admin'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const portalParam = (searchParams.get('portal') as PortalType) || 'patient'
  const redirectQuery = searchParams.get('redirect')

  const [portal, setPortal] = useState<PortalType>(portalParam)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneOrUhid, setPhoneOrUhid] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Multiple roles workspace selector modal
  const [userRoles, setUserRoles] = useState<any[] | null>(null)

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)

  useEffect(() => {
    if (portalParam) {
      setPortal(portalParam)
    }
  }, [portalParam])

  // Handle Smart Routing based on User Roles
  const handleSmartRouting = async (fallbackPath: string) => {
    try {
      const res = await fetch('/api/v1/me')
      if (res.ok) {
        const json = await res.json()
        const roles = json.data?.roles || []

        if (redirectQuery) {
          router.push(redirectQuery)
          return
        }

        const roleNames = roles.map((r: any) => r.role)

        // If multiple distinct portal permissions exist, let the user choose
        const hasDoctor = roleNames.includes('doctor')
        const hasAdmin = roleNames.some((r: string) => ['super_admin', 'org_admin', 'branch_admin'].includes(r))
        const hasBilling = roleNames.includes('billing_staff')
        const hasReception = roleNames.some((r: string) => ['receptionist', 'nurse'].includes(r))
        const hasPatient = roleNames.includes('patient')

        const uniqueWorkspaces = [
          hasDoctor && { name: 'Doctor Chamber EMR', path: '/doctor', icon: 'stethoscope' },
          hasAdmin && { name: 'Administrative OS & MIS', path: '/admin', icon: 'building' },
          hasBilling && { name: 'Billing & POS Counter', path: '/admin/billing', icon: 'billing' },
          hasReception && { name: 'OPD Reception & Queue', path: '/admin/appointments/queue', icon: 'users' },
          hasPatient && { name: 'Personal Patient Portal', path: '/patient', icon: 'heart' },
        ].filter(Boolean) as Array<{ name: string; path: string; icon: string }>

        if (uniqueWorkspaces.length > 1) {
          setUserRoles(uniqueWorkspaces)
          return
        }

        if (hasDoctor) {
          router.push('/doctor')
          return
        }
        if (hasBilling) {
          router.push('/admin/billing')
          return
        }
        if (hasReception) {
          router.push('/admin/appointments/queue')
          return
        }
        if (hasAdmin) {
          router.push('/admin')
          return
        }
        if (hasPatient) {
          router.push('/patient')
          return
        }
      }
    } catch (e) {
      console.warn('Smart routing lookup skipped:', e)
    }
    router.push(fallbackPath)
  }

  // Handle Standard Email/Password Login (Doctor, Staff, Admin)
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid credentials. Please verify your email and password, or register a new account.')
        } else {
          setErrorMessage(error.message)
        }
        setLoading(false)
        return
      }

      if (data?.user) {
        setSuccessMessage('Authentication verified! Loading your clinical workspace...')
        const fallback =
          portal === 'doctor'
            ? '/doctor'
            : portal === 'staff'
            ? '/admin/billing'
            : portal === 'patient'
            ? '/patient'
            : '/admin'

        setTimeout(() => {
          handleSmartRouting(fallback)
        }, 600)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.')
      setLoading(false)
    }
  }

  // Handle Patient Fast Phone/UHID Login
  const handlePatientFastLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!phoneOrUhid.trim()) {
      setErrorMessage('Please enter your 10-digit mobile number or UHID.')
      return
    }

    if (!isOtpSent) {
      setIsOtpSent(true)
      setSuccessMessage('Verification code sent to your registered mobile (demo mode: enter 123456).')
      return
    }

    // Verify OTP
    setLoading(true)
    try {
      const res = await fetch('/api/v1/patient/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneOrUhid.trim().startsWith('CAP-') ? undefined : phoneOrUhid.trim(),
          uhid: phoneOrUhid.trim().startsWith('CAP-') ? phoneOrUhid.trim() : undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Patient verification failed')
      }

      setSuccessMessage(`Welcome back! Loading records for UHID ${json.data?.patient?.uhid}...`)
      setTimeout(() => {
        router.push(`/patient?patientId=${json.data?.patient?.id}&uhid=${json.data?.patient?.uhid}`)
      }, 700)
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check mobile/UHID or register.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/login?reset=success`,
      })

      if (error) {
        setForgotMessage(`Error: ${error.message}`)
      } else {
        setForgotMessage('Password reset instructions sent. Please check your inbox.')
      }
    } catch (err: any) {
      setForgotMessage('Failed to trigger reset email. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
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
        <h2 className="text-xl font-bold text-slate-200">
          {portal === 'patient'
            ? 'Patient Portal Sign In'
            : portal === 'doctor'
            ? 'Doctor Chamber EMR Sign In'
            : portal === 'staff'
            ? 'Staff & Operations Sign In'
            : 'Administrator Sign In'}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {portal === 'patient'
            ? 'Access your prescriptions, diagnostic reports, and medical history.'
            : 'Enter your credentials to open your authorized workspace.'}
        </p>

        {/* Portal Selection Tabs */}
        <div className="mt-5 p-1 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-4 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setPortal('patient')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              portal === 'patient'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortal('doctor')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              portal === 'doctor'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortal('staff')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              portal === 'staff'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Staff</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortal('admin')
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
            className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              portal === 'admin'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
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

          {/* Multiple Workspace Selector Modal */}
          {userRoles && (
            <div className="space-y-3 py-2 animate-in fade-in">
              <h3 className="text-sm font-bold text-white text-center">
                Select Your Workspace For This Session:
              </h3>
              <p className="text-xs text-slate-400 text-center mb-4">
                You hold multiple authorized operational roles in CAPSIC CARE.
              </p>
              <div className="space-y-2">
                {userRoles.map((ws, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(ws.path)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500 flex items-center justify-between text-left text-xs font-semibold text-white transition-all group"
                  >
                    <span>{ws.name}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-teal-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!userRoles && (
            <>
              {/* PATIENT PORTAL FAST LOGIN (Phone / OTP / UHID) */}
              {portal === 'patient' ? (
                <form className="space-y-4" onSubmit={handlePatientFastLogin}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Patient Mobile Number or UHID
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={phoneOrUhid}
                        onChange={(e) => setPhoneOrUhid(e.target.value)}
                        placeholder="e.g. 9876543210 or CAP-2026-..."
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {isOtpSent && (
                    <div className="animate-in fade-in">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        6-Digit OTP (Use 123456)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-center font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 disabled:opacity-50 shadow-lg shadow-teal-500/20 transition-all"
                  >
                    {loading ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <span>{isOtpSent ? 'Verify OTP & Enter Portal' : 'Send Fast Sign-In OTP'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/register?role=patient"
                      className="text-xs text-teal-400 hover:underline"
                    >
                      New patient? Register here for an instant UHID
                    </Link>
                  </div>
                </form>
              ) : (
                /* CLINICAL, STAFF & ADMIN EMAIL/PASSWORD LOGIN */
                <form className="space-y-4" onSubmit={handleEmailLogin}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {portal === 'doctor'
                        ? 'Doctor Email'
                        : portal === 'staff'
                        ? 'Staff Work Email'
                        : 'Administrator Email'}
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          portal === 'doctor'
                            ? 'doctor@capsic.in'
                            : portal === 'staff'
                            ? 'staff@capsic.in'
                            : 'admin@capsic.in'
                        }
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 disabled:opacity-50 shadow-lg shadow-teal-500/20 transition-all"
                  >
                    {loading ? (
                      <span>Verifying Session...</span>
                    ) : (
                      <>
                        <span>
                          {portal === 'doctor'
                            ? 'Open Doctor Chamber EMR'
                            : portal === 'staff'
                            ? 'Open Staff Workspace'
                            : 'Sign In to Administrator MIS'}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href={`/register?role=${portal === 'admin' ? 'doctor' : portal}`}
                      className="text-xs text-teal-400 hover:underline"
                    >
                      {portal === 'doctor'
                        ? 'New Doctor? Register your chamber here'
                        : portal === 'staff'
                        ? 'New Staff Member? Register your account'
                        : 'Need an account? Register as Doctor or Staff'}
                    </Link>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Security Assurance */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>Multi-Tenant Enterprise RBAC • ABDM Compliant</span>
            </div>
            {portal === 'admin' && (
              <div className="mt-2">
                <Link
                  href="/admin/setup"
                  className="text-[11px] text-slate-500 hover:text-teal-400 underline"
                >
                  Bootstrap initial Super Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered email address to receive password reset instructions.
            </p>
            {forgotMessage && (
              <div className="mb-4 text-xs p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                {forgotMessage}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="doctor@capsic.in"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false)
                    setForgotMessage(null)
                  }}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginForm />
    </Suspense>
  )
}
