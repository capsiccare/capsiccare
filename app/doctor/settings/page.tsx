'use client'

import React, { useState } from 'react'
import {
  Settings,
  ShieldCheck,
  Stethoscope,
  Bell,
  CheckCircle2,
  Printer,
  Globe,
} from 'lucide-react'

export default function DoctorSettingsPage() {
  const [bilingualPrint, setBilingualPrint] = useState(true)
  const [preferredLanguage, setPreferredLanguage] = useState<'bengali' | 'hindi'>('bengali')
  const [soundAlerts, setSoundAlerts] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <span>Doctor Practice Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize your clinical workspace, prescription printing preferences, and token alert tones
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Practice preferences saved successfully!</span>
          </div>
        )}

        {/* Section 1: Prescription Printing Preferences */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Prescription Printing & Localization</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Include Bilingual Dosage Instructions
              </span>
              <span className="text-[11px] text-slate-400">
                Prints verified patient instructions in regional languages (e.g. 'খাবারের পর', 'खाने के बाद')
              </span>
            </div>
            <input
              type="checkbox"
              checked={bilingualPrint}
              onChange={(e) => setBilingualPrint(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Primary Regional Language
              </span>
              <span className="text-[11px] text-slate-400">Preferred local language on A4 print slips</span>
            </div>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="bengali">বাংলা (Bengali)</option>
              <option value="hindi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Queue & Token Notification Sounds */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Reception & Queue Notifications</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Audible Chime on Patient Arrival
              </span>
              <span className="text-[11px] text-slate-400">Play a discrete chime when reception checks in your next patient</span>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
