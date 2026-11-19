'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  RefreshCw,
  ChevronRight,
  Printer,
  Table,
  Building2,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function CustomReportsPage() {
  const { selectedBranchId } = useBranch()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Builder State
  const [reportTitle, setReportTitle] = useState('Executive Monthly Performance Statement')
  const [reportCategory, setReportCategory] = useState('financial')
  const [fileFormat, setFileFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [exportDownloadData, setExportDownloadData] = useState<any | null>(null)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/analytics/reports/templates')
      const json = await res.json()
      if (json.success) {
        setTemplates(json.data.templates || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleGenerateExport = async (template?: any) => {
    setIsExporting(true)
    setExportDownloadData(null)

    const title = template?.name || reportTitle
    const cat = template?.category || reportCategory

    // Mock data rows aligned with template
    const sampleRows = [
      { Metric: 'Gross Billed Revenue', Value: '₹4,85,000', Branch: 'Main Clinic', Status: 'Verified' },
      { Metric: 'Collected Payments', Value: '₹4,62,500', Branch: 'Main Clinic', Status: 'Verified' },
      { Metric: 'Direct Service Costs', Value: '₹1,07,600', Branch: 'Main Clinic', Status: 'Verified' },
      { Metric: 'Gross Margin (INR)', Value: '₹3,77,400', Branch: 'Main Clinic', Status: 'Verified' },
      { Metric: 'Contribution Margin %', Value: '77.8%', Branch: 'Main Clinic', Status: 'Verified' },
      { Metric: 'Completed Consultations', Value: '284 Visits', Branch: 'Main Clinic', Status: 'Audited' },
      { Metric: 'Diagnostic Orders', Value: '192 Orders', Branch: 'Main Clinic', Status: 'Audited' },
      { Metric: '24-Hour SLA Compliance', Value: '94.2%', Branch: 'Main Clinic', Status: 'Audited' }
    ]

    try {
      const res = await fetch('/api/v1/analytics/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_title: title,
          report_type: cat,
          file_format: fileFormat,
          data: sampleRows,
          filters: { branch: selectedBranchId }
        })
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setExportDownloadData(json.data)
      } else {
        alert(json.error?.message || 'Failed to generate export')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadFile = () => {
    if (!exportDownloadData?.csvContent) return
    const blob = new Blob([exportDownloadData.csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Custom Reports & Exports</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            Custom Report Builder & Scheduled Export Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate verifiable operational exports in CSV, Excel, and PDF formats with curated semantic metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 rounded-xl">
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Saved Report Templates Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">
          Pre-Configured Enterprise Report Definitions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono bg-slate-50 dark:bg-slate-800">
                    {tmpl.category}
                  </Badge>
                  <span className="text-[11px] text-slate-400">Curated Semantic View</span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-base mt-2">
                  {tmpl.name}
                </h4>

                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Format: CSV / XLSX / PDF
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateExport(tmpl)}
                  disabled={isExporting}
                  className="gap-1 text-xs rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  Run & Export
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Report Export Builder Card */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Interactive Custom Report Generator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Report Title
            </label>
            <Input
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Category
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            >
              <option value="financial">Financial & Margin Accounting</option>
              <option value="clinical_opd">Doctor OPD Productivity</option>
              <option value="diagnostics">Diagnostic Labs & Turnaround Time</option>
              <option value="patient_continuity">Patient Retention & Cohort Continuity</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Export File Format
            </label>
            <select
              value={fileFormat}
              onChange={(e: any) => setFileFormat(e.target.value)}
              className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            >
              <option value="csv">Standard CSV (.csv)</option>
              <option value="xlsx">Microsoft Excel (.xlsx)</option>
              <option value="pdf">Printable PDF Statement (.pdf)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={() => handleGenerateExport()}
            disabled={isExporting}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating Report...' : 'Generate & Download Export'}
          </Button>
        </div>

        {/* Download Ready Banner */}
        {exportDownloadData && (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Report Generated Successfully! ({exportDownloadData.fileSizeBytes} bytes)</span>
            </div>

            <Button size="sm" onClick={handleDownloadFile} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
              <Download className="w-4 h-4" />
              Download {fileFormat.toUpperCase()}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
