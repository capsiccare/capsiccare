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
  Building2,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

type InternalPortalType = 'doctor' | 'staff' | 'admin'

function InternalLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPortal = (searchParams.get('portal') as InternalPortalType) || 'doctor'
  const redirectQuery = searchParams.get('redirect')

  const [portal, setPortal] = useState<InternalPortalType>(initialPortal)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    if (initialPortal && ['doctor', 'staff', 'admin'].includes(initialPortal)) {
      setPortal(initialPortal)
    }
  }, [initialPortal])

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
        const hasDoctor = roleNames.includes('doctor')
        const hasAdmin = roleNames.some((r: string) => ['super_admin', 'org_admin', 'branch_admin'].includes(r))
        const hasBilling = roleNames.includes('billing_staff')
        const hasReception = roleNames.some((r: string) => ['receptionist', 'nurse', 'phlebotomist'].includes(r))

        const uniqueWorkspaces = [
          hasDoctor && { name: 'Doctor Chamber EMR', path: '/doctor', icon: 'stethoscope' },
          hasAdmin && { name: 'Administrative OS & MIS', path: '/admin', icon: 'building' },
          hasBilling && { name: 'Billing & POS Counter', path: '/admin/billing', icon: 'billing' },
          hasReception && { name: 'OPD Reception & Queue', path: '/admin/appointments/queue', icon: 'users' },
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
        if (hasAdmin) {
          router.push('/admin')
          return
        }
      }
    } catch (e) {
      console.warn('Smart routing fallback triggered:', e)
    }
    router.push(fallbackPath)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        throw new Error(error.message || 'Invalid email or password.')
      }

      if (data.session) {
        setSuccessMessage('Authentication successful! Routing to authorized workspace...')
        const targetPath = portal === 'doctor' ? '/doctor' : '/admin'
        await handleSmartRouting(targetPath)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setErrorMessage(err.message || 'Failed to authenticate. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) {
      setForgotMessage('Please enter your registered email address.')
      return
    }
    setForgotLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/portal/login?reset=true`,
      })
      if (error) throw error
      setForgotMessage('Password reset link sent! Check your email inbox.')
    } catch (err: any) {
      setForgotMessage(err.message || 'Failed to send password reset email.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              CAPSIC <span className="text-teal-400">CARE OS</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Internal Clinical &amp; Operations Portal
          </div>
          <p className="text-xs text-slate-400">
            Secure enterprise access for Doctors, Clinical Staff, Phlebotomists &amp; Administrators
          </p>
        </div>

        {/* Portal Type Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setPortal('doctor')
              setErrorMessage(null)
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portal === 'doctor'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Stethoscope size={16} />
            <span>Doctor Chamber</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortal('staff')
              setErrorMessage(null)
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portal === 'staff'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users size={16} />
            <span>Staff / Ops</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortal('admin')
              setErrorMessage(null)
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portal === 'admin'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 size={16} />
            <span>Admin / MIS</span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Email Address / Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    portal === 'doctor'
                      ? 'doctor@capsiccare.com'
                      : portal === 'staff'
                      ? 'staff@capsiccare.com'
                      : 'admin@capsiccare.com'
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Forgot password?
                </button>
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
                  placeholder="Enter your security password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
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
              {loading ? (
                <>Verifying Credentials...</>
              ) : (
                <>
                  Sign In to {portal === 'doctor' ? 'Doctor Chamber' : portal === 'staff' ? 'Staff Workspace' : 'Admin MIS'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              Staff Self-Registration &amp; Quick Access:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/register?role=doctor"
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-400 transition-colors text-center font-medium"
              >
                Register as Doctor
              </Link>
              <Link
                href="/register?role=staff"
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-400 transition-colors text-center font-medium"
              >
                Register as Staff
              </Link>
            </div>
          </div>
        </div>

        {/* Segregation Link: Direct back to Patient Portal */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
          >
            Looking for patient reports, prescriptions &amp; appointments? <span className="underline text-teal-400 font-bold">Go to Patient Portal</span>
          </Link>
        </div>
      </div>

      {/* Multi-role Workspace Selector Modal */}
      {userRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Select Your Active Workspace</h3>
            <p className="text-xs text-slate-400">
              Your profile holds multiple operational roles. Choose which department you want to access:
            </p>
            <div className="space-y-2 pt-2">
              {userRoles.map((role) => (
                <button
                  key={role.path}
                  type="button"
                  onClick={() => router.push(role.path)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white transition-all cursor-pointer"
                >
                  <span>{role.name}</span>
                  <ChevronRight size={16} className="text-teal-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Reset Staff Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registered staff email address to receive password reset instructions.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="staff@capsiccare.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              {forgotMessage && (
                <p className="text-xs text-teal-300 bg-teal-950/40 p-2.5 rounded-lg border border-teal-800/40">
                  {forgotMessage}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-teal-400 transition-colors"
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

export default function InternalLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 font-bold">Loading Staff Portal...</div>}>
      <InternalLoginForm />
    </Suspense>
  )
}
