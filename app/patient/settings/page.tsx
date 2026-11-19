'use client'

import React, { useEffect, useState } from 'react'
import {
  Settings,
  ShieldCheck,
  Bell,
  Languages,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'
import { SupportedLanguage } from '@/lib/modules/patient-portal/i18n'

export default function PatientSettingsPage() {
  const { activePatientId, language, setLanguage, t } = usePatient()
  const [loading, setLoading] = useState(true)
  const [privacySettings, setPrivacySettings] = useState<any | null>(null)

  // Communication Preferences State
  const [whatsapp, setWhatsapp] = useState(true)
  const [sms, setSms] = useState(true)
  const [email, setEmail] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [prefsSaved, setPrefsSaved] = useState(false)

  // ABHA State
  const [abhaNumber, setAbhaNumber] = useState('')
  const [abhaAddress, setAbhaAddress] = useState('')
  const [linkingAbha, setLinkingAbha] = useState(false)
  const [abhaSuccess, setAbhaSuccess] = useState(false)
  const [abhaError, setAbhaError] = useState<string | null>(null)

  useEffect(() => {
    if (activePatientId) {
      loadSettings(activePatientId)
    }
  }, [activePatientId])

  const loadSettings = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/settings/privacy?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        const data = json.data
        setPrivacySettings(data)
        if (data.communication_preferences) {
          setWhatsapp(Boolean(data.communication_preferences.whatsapp_enabled ?? true))
          setSms(Boolean(data.communication_preferences.sms_enabled ?? true))
          setEmail(Boolean(data.communication_preferences.email_enabled ?? false))
          setMarketing(Boolean(data.communication_preferences.marketing_opt_in ?? false))
        }
        if (data.abha_profile) {
          setAbhaNumber(data.abha_profile.abha_number || '')
          setAbhaAddress(data.abha_profile.abha_address || '')
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!activePatientId) return
    try {
      setSavingPrefs(true)
      setPrefsSaved(false)
      const res = await fetch(`/api/v1/patient/settings/privacy?patientId=${activePatientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            whatsapp_enabled: whatsapp,
            sms_enabled: sms,
            email_enabled: email,
            marketing_opt_in: marketing,
          },
        }),
      })

      if (res.ok) {
        setPrefsSaved(true)
        setTimeout(() => setPrefsSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleLinkAbha = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePatientId) return
    try {
      setLinkingAbha(true)
      setAbhaError(null)
      setAbhaSuccess(false)

      const res = await fetch(`/api/v1/patient/settings/privacy?patientId=${activePatientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abhaNumber,
          abhaAddress,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to link ABHA profile')
      }

      setAbhaSuccess(true)
      loadSettings(activePatientId)
    } catch (err: any) {
      setAbhaError(err.message || 'ABHA linking failed')
    } finally {
      setLinkingAbha(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-teal-600" />
          {t.nav.settings}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your portal language, communication channels, Ayushman Bharat (ABHA) integration, and data privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Languages className="h-5 w-5 text-teal-600" />
            Language Preference / ভাষা / भाषा
          </div>
          <p className="text-xs text-slate-500">
            Choose your preferred portal language. All navigation labels and instructions will update instantly.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { id: 'en', label: 'English', sub: 'Default' },
              { id: 'bn', label: 'বাংলা', sub: 'Bengali' },
              { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLanguage(item.id as SupportedLanguage)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  language === item.id
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:border-teal-400'
                }`}
              >
                <div className="text-sm font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Bell className="h-5 w-5 text-teal-600" />
              Communication Channels
            </div>
            {prefsSaved && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Select how you would like to receive appointment tokens, lab reports and medicine reminders.
          </p>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">WhatsApp Updates</div>
                <div className="text-[10px] text-slate-400">Receive Rx PDFs and report download links</div>
              </div>
              <input
                type="checkbox"
                checked={whatsapp}
                onChange={(e) => setWhatsapp(e.target.checked)}
                className="h-4 w-4 text-teal-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">SMS Alerts</div>
                <div className="text-[10px] text-slate-400">Critical appointment tokens and OTP verification</div>
              </div>
              <input
                type="checkbox"
                checked={sms}
                onChange={(e) => setSms(e.target.checked)}
                className="h-4 w-4 text-teal-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Notifications</div>
                <div className="text-[10px] text-slate-400">Comprehensive summary statements and receipts</div>
              </div>
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
                className="h-4 w-4 text-teal-600 rounded"
              />
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              disabled={savingPrefs}
              onClick={handleSavePreferences}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>

      {/* ABHA Integration & Privacy Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voluntary ABHA Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            Ayushman Bharat Health Account (ABHA)
          </div>
          <p className="text-xs text-slate-500">
            Link your national 14-digit ABHA Number and ABHA Address (`@abdm`) for seamless interoperability across hospitals under the Ayushman Bharat Digital Mission (ABDM).
          </p>

          {privacySettings?.abha_profile ? (
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300">
                  ABHA Status: Linked & Verified
                </span>
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">ABHA Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {privacySettings.abha_profile.abha_number}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">ABHA Address</span>
                <span className="font-mono text-teal-700 dark:text-teal-300 font-semibold">
                  {privacySettings.abha_profile.abha_address}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLinkAbha} className="space-y-3 pt-1">
              {abhaError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {abhaError}
                </div>
              )}
              {abhaSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ABHA account linked successfully!
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  14-Digit ABHA Number
                </label>
                <input
                  required
                  type="text"
                  maxLength={17}
                  value={abhaNumber}
                  onChange={(e) => setAbhaNumber(e.target.value)}
                  placeholder="e.g. 14-1234-5678-9012"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ABHA Address
                </label>
                <input
                  required
                  type="text"
                  value={abhaAddress}
                  onChange={(e) => setAbhaAddress(e.target.value)}
                  placeholder="e.g. yourname@abdm"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  disabled={linkingAbha}
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {linkingAbha ? 'Linking...' : 'Link ABHA Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Data Privacy Center */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Lock className="h-5 w-5 text-teal-600" />
            Security & Authorized Device Sessions
          </div>
          <p className="text-xs text-slate-500">
            Your medical records are encrypted with AES-256 and protected by role-based access control. Review active logins:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-4 w-4 text-teal-600" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Current Web Browser Session</div>
                  <div className="text-[10px] text-slate-400">Active • Last active just now</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                This Device
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            CAPSIC CARE adheres to the Digital Personal Data Protection Act (DPDP) and clinical confidentiality guidelines.
          </div>
        </div>
      </div>
    </div>
  )
}
