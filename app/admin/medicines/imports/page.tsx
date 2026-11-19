'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react'

export default function AdminMedicinesImportPage() {
  const [csvContent, setCsvContent] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCsvContent(event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!csvContent.trim()) return
    setImporting(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/v1/clinical/medicines/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent }),
      })
      const json = await res.json()
      if (res.ok) {
        setResult(json.data)
      } else {
        setError(json.error?.message || 'Bulk import failed')
      }
    } catch (e: any) {
      setError(e.message || 'Import error')
    } finally {
      setImporting(false)
    }
  }

  const sampleCsv = `generic_name,brand_name,dosage_form,strength,route,therapeutic_class,manufacturer
Paracetamol,Crocin Advance,tablet,500mg,oral,Analgesic,GlaxoSmithKline
Azithromycin,Azee 500,tablet,500mg,oral,Antibiotic,Cipla Ltd
Telmisartan,Telmikind 40,tablet,40mg,oral,Antihypertensive,Mankind Pharma`

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/medicines"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Bulk CSV Medicine Import</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bulk upload verified generic ingredients, brand formulations, and therapeutic classes
          </p>
        </div>
      </div>

      {result && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            Successfully imported <strong>{result.imported}</strong> medicine formulations into the master catalogue!
            (Skipped: {result.skipped})
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* CSV Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
            Choose CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-950 dark:file:text-teal-300"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-900 dark:text-white">
              Or Paste CSV Text Directly
            </label>
            <button
              onClick={() => setCsvContent(sampleCsv)}
              className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              Load Sample CSV
            </button>
          </div>
          <textarea
            rows={8}
            placeholder="generic_name,brand_name,dosage_form,strength,route,therapeutic_class,manufacturer..."
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleImport}
            disabled={importing || !csvContent.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50"
          >
            {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{importing ? 'Importing...' : 'Validate & Import Records'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
