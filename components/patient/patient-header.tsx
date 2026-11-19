'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Languages,
  PhoneCall,
  User,
  Users,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'
import { SupportedLanguage } from '@/lib/modules/patient-portal/i18n'

export function PatientHeader() {
  const { language, setLanguage, t, context, activePatientId, setActivePatientId } = usePatient()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const activePatientName =
    activePatientId === context?.patient.id
      ? context?.patient.full_name
      : context?.dependents.find((d) => d.patient_id === activePatientId)?.full_name || context?.patient.full_name

  const activeUhid =
    activePatientId === context?.patient.id
      ? context?.patient.uhid
      : context?.dependents.find((d) => d.patient_id === activePatientId)?.uhid || context?.patient.uhid

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      {/* Emergency Disclaimer Banner */}
      <div className="bg-red-600 px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-200 animate-pulse" />
          <span className="truncate">{t.emergencyBanner}</span>
        </div>
        <a
          href="tel:108"
          className="ml-3 shrink-0 flex items-center gap-1 bg-red-700 hover:bg-red-800 px-2.5 py-0.5 rounded text-[11px] font-bold text-white transition-colors"
        >
          <PhoneCall className="h-3 w-3" />
          {t.emergencyCall}
        </a>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/patient" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              C
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                CAPSIC CARE
              </span>
              <span className="ml-1.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                Patient OS
              </span>
            </div>
          </Link>

          {/* Active Family / Dependent Badge */}
          {context && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors border border-slate-200 dark:border-slate-700"
              >
                <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[130px] truncate">
                  {activePatientName || 'Patient'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">({activeUhid})</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Care Profile
                  </div>
                  <button
                    onClick={() => {
                      setActivePatientId(context.patient.id)
                      setUserMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                      activePatientId === context.patient.id
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div>{context.patient.full_name} (Self)</div>
                      <div className="text-[10px] text-slate-500 font-mono">{context.patient.uhid}</div>
                    </div>
                    {activePatientId === context.patient.id && (
                      <ShieldCheck className="h-4 w-4 text-teal-600" />
                    )}
                  </button>

                  {context.dependents && context.dependents.length > 0 && (
                    <>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                      <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase">
                        Family & Dependents
                      </div>
                      {context.dependents.map((dep) => (
                        <button
                          key={dep.id}
                          onClick={() => {
                            setActivePatientId(dep.patient_id)
                            setUserMenuOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                            activePatientId === dep.patient_id
                              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <div>{dep.full_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono capitalize">
                              {dep.relationship} • {dep.uhid}
                            </div>
                          </div>
                          {activePatientId === dep.patient_id && (
                            <ShieldCheck className="h-4 w-4 text-teal-600" />
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <Link
                    href="/patient/family"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 font-medium"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Manage Family Members
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Language Switcher, Notifications, Settings */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Change Language"
            >
              <Languages className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>
                {language === 'en' ? 'EN' : language === 'bn' ? 'বাংলা' : 'हिंदी'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                {(['en', 'bn', 'hi'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang)
                      setLangMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium ${
                      language === lang
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'en' ? 'English (EN)' : lang === 'bn' ? 'বাংলা (Bengali)' : 'हिंदी (Hindi)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <Link
            href="/patient/notifications"
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          </Link>
        </div>
      </div>
    </header>
  )
}
