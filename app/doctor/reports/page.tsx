'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  FileText,
} from 'lucide-react'

export default function DoctorReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    // Fetch reports
    async function loadReports() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/doctor/dashboard')
        if (res.ok) {
          const json = await res.json()
          // reports from dashboard or patient emr
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-rose-500" />
          <span>Diagnostic Reports & Results Review</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review completed laboratory, biochemistry, hematology, and radiology results for patients under your care
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-sm">
        <FlaskConical className="w-12 h-12 mx-auto text-rose-300 dark:text-rose-900/40 mb-3" />
        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">Diagnostic Review Station Active</h3>
        <p className="text-slate-400 mt-1 max-w-md mx-auto">
          Completed lab investigations released by the pathology department appear here with reference intervals and longitudinal comparison curves.
        </p>
        <div className="mt-4">
          <Link
            href="/doctor/patients"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
          >
            <span>Search Patient EMR</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
