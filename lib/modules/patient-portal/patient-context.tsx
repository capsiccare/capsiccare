'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { PatientPortalContext } from './types'
import { translations, SupportedLanguage, I18nDictionary } from './i18n'

interface PatientPortalState {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: I18nDictionary
  context: PatientPortalContext | null
  activePatientId: string | null
  setActivePatientId: (id: string | null) => void
  refreshContext: () => Promise<void>
  loading: boolean
}

const PatientContext = createContext<PatientPortalState | null>(null)

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en')
  const [context, setContext] = useState<PatientPortalContext | null>(null)
  const [activePatientId, setActivePatientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedLang = localStorage.getItem('capsic_patient_lang') as SupportedLanguage
    if (savedLang && (savedLang === 'en' || savedLang === 'bn' || savedLang === 'hi')) {
      setLanguageState(savedLang)
    }
    loadContext()
  }, [])

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
    localStorage.setItem('capsic_patient_lang', lang)
  }

  const loadContext = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/patient/me')
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setContext(json.data)
          if (!activePatientId) {
            setActivePatientId(json.data.patient.id)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load patient portal context:', err)
    } finally {
      setLoading(false)
    }
  }

  const t = translations[language] || translations.en

  return (
    <PatientContext.Provider
      value={{
        language,
        setLanguage,
        t,
        context,
        activePatientId,
        setActivePatientId,
        refreshContext: loadContext,
        loading,
      }}
    >
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const ctx = useContext(PatientContext)
  if (!ctx) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return ctx
}
