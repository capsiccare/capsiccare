'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Search,
  Printer,
  ShieldCheck,
  ChevronRight,
  Clock,
  RefreshCw,
  Plus,
} from 'lucide-react'

export default function DoctorPrescriptionsPage() {
  const [loading, setLoading] = useState(true)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPrescriptions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/doctor/dashboard')
      if (res.ok) {
        const json = await res.json()
        const docId = json.data?.doctor?.id
        if (docId) {
          // Fetch past prescriptions for this doctor
          const pRes = await fetch(`/api/v1/doctor/patients`)
          // For now display from dashboard or mock
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Prescriptions & Signed Documents</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Archived digital prescriptions, cryptographic signatures, and amendment history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/doctor/queue"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Prescription from Queue</span>
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
        <p>
          Prescriptions finalized in CAPSIC CARE OS are cryptographically signed with a SHA-256 digital stamp and
          cannot be altered without creating a versioned clinical amendment.
        </p>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs shadow-sm">
        <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">Prescription Repository Active</p>
        <p className="text-slate-400 mt-1">
          To write and sign a new prescription, call a waiting patient from Today's Queue or select from the Patient Directory.
        </p>
        <div className="mt-4">
          <Link
            href="/doctor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
          >
            <span>Go to Today's Queue</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
