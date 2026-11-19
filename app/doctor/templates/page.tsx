'use client'

import React, { useState, useEffect } from 'react'
import {
  FileCode,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
} from 'lucide-react'

export default function DoctorTemplatesPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<any[]>([])
  const [specialtyFilter, setSpecialtyFilter] = useState('all')

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/doctor/templates')
      if (res.ok) {
        const json = await res.json()
        setTemplates(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const filtered = templates.filter((t) => {
    if (specialtyFilter !== 'all' && t.specialty !== specialtyFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>Clinical Templates & Prescribing Bundles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-configured specialty SOAP note templates, investigation bundles, and customized advice snippets
          </p>
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {['all', 'General Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Dermatology'].map((s) => (
          <button
            key={s}
            onClick={() => setSpecialtyFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              specialtyFilter === s
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                  {tmpl.specialty || 'General'}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                  {tmpl.template_name}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {tmpl.template_type?.toUpperCase()}
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {tmpl.content?.chief_complaint && (
                <div><strong>Complaint:</strong> {tmpl.content.chief_complaint}</div>
              )}
              {tmpl.content?.examination && (
                <div><strong>Exam:</strong> {tmpl.content.examination}</div>
              )}
              {tmpl.content?.assessment && (
                <div><strong>Assessment:</strong> {tmpl.content.assessment}</div>
              )}
              {tmpl.content?.advice && (
                <div><strong>Advice:</strong> {tmpl.content.advice}</div>
              )}
            </div>

            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              ✓ Available for 1-click insertion in consultation workspace
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
