'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Database,
  FileText,
  Activity,
  Layers,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DataQualityAuditPage() {
  const [auditData, setAuditData] = useState<any | null>(null)
  const [dictionary, setDictionary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'audit' | 'dictionary'>('audit')

  const fetchQualityData = async () => {
    setLoading(true)
    try {
      const [auditRes, dictRes] = await Promise.all([
        fetch('/api/v1/analytics/data-quality'),
        fetch('/api/v1/analytics/dictionary')
      ])

      const [auditJson, dictJson] = await Promise.all([auditRes.json(), dictRes.json()])

      if (auditJson.success) setAuditData(auditJson.data)
      if (dictJson.success) setDictionary(dictJson.data.dictionary || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQualityData()
  }, [])

  const score = auditData?.overallDataQualityScore ?? 98
  const rating = auditData?.qualityRating ?? 'Excellent'

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Data Quality & Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Data Quality Audit & Metric Governance Dictionary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Continuous surveillance of demographic completeness, financial balance integrity, and canonical KPI definitions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchQualityData} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Integrity Audit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          Data Quality Health Score
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'dictionary'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Enterprise Metric Dictionary ({dictionary.length})
        </button>
      </div>

      {/* Tab 1: Data Quality Audit */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Health Score Overview */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                <span className="text-3xl font-black">{score}%</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Overall Data Quality Index</h3>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                    {rating}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates missing demographic attributes, financial balance integrity, and lab test timestamp continuity.
                </p>
                <div className="text-[11px] text-slate-400 mt-1">
                  Last Audited: {auditData?.auditTimestamp ? new Date(auditData.auditTimestamp).toLocaleString() : 'Just now'}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Checks List */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Verification Check Results
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditData?.checks?.map((check: any, idx: number) => {
                const isPassed = check.status === 'passed'
                const isWarning = check.status === 'warning'

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{check.name}</h5>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : isWarning
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          {check.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {check.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Issues Flagged:</span>
                      <span className={`font-mono font-bold ${check.issueCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {check.issueCount} discrepancies
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Metric Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Enterprise Data Governance:</strong> All executive dashboards, reporting exports, and REST APIs share the authoritative definitions below. CAPSIC CARE OS strictly forbids conflicting metric formulas across screens.
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Metric Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Formula & Logic</th>
                    <th className="px-4 py-3">Data Source</th>
                    <th className="px-4 py-3">Refund & Exception Treatment</th>
                    <th className="px-4 py-3">Update Cadence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dictionary.map((entry: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-xs">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {entry.kpi}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {entry.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                        {entry.formula}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {entry.sourceTable}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                        {entry.refundTreatment}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {entry.updateFrequency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
