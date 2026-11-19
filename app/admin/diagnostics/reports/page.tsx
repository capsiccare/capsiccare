'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Upload,
  Download,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  User,
  Phone,
  FlaskConical,
  Eye,
  Check
} from 'lucide-react'

interface DiagnosticReport {
  id: string
  reportNumber: string
  orderId: string
  orderNumber: string
  patientName: string
  patientUhid: string
  patientPhone: string
  branchName: string
  status: string
  fileUrl?: string
  fileName?: string
  clinicalNotes?: string
  verifiedBy?: string
  verifiedAt?: string
  deliveredAt?: string
  createdAt: string
}

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<DiagnosticReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null)
  const [verifyNotes, setVerifyNotes] = useState('')
  const [verifyFileUrl, setVerifyFileUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Register new report modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [newOrderId, setNewOrderId] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newFileUrl, setNewFileUrl] = useState('')
  const [newStatus, setNewStatus] = useState<'pending' | 'received_from_lab' | 'verified'>('received_from_lab')

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/v1/diagnostics/reports?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setReports(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching diagnostic reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [statusFilter])

  const handleOpenVerifyModal = (report: DiagnosticReport) => {
    setSelectedReport(report)
    setVerifyNotes(report.clinicalNotes || '')
    setVerifyFileUrl(report.fileUrl || '')
    setVerifyModalOpen(true)
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReport) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/v1/diagnostics/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'verified',
          clinical_notes: verifyNotes || undefined,
          file_url: verifyFileUrl || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setVerifyModalOpen(false)
        fetchReports()
      } else {
        alert(data.error?.message || 'Failed to verify report')
      }
    } catch (err: any) {
      alert(err.message || 'Error updating report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkDelivered = async (reportId: string) => {
    if (!confirm('Confirm delivery of report to patient (via WhatsApp / SMS / Hard copy)?')) return

    try {
      const res = await fetch(`/api/v1/diagnostics/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      })
      const data = await res.json()
      if (data.success) {
        fetchReports()
      } else {
        alert(data.error?.message || 'Failed to update delivery status')
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred')
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrderId) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/diagnostics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: newOrderId,
          status: newStatus,
          clinical_notes: newNotes || undefined,
          file_url: newFileUrl || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setRegisterModalOpen(false)
        setNewOrderId('')
        setNewNotes('')
        setNewFileUrl('')
        fetchReports()
      } else {
        alert(data.error?.message || 'Failed to register report')
      }
    } catch (err: any) {
      alert(err.message || 'Error registering report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredReports = reports.filter(r => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      r.reportNumber.toLowerCase().includes(q) ||
      (r.orderNumber && r.orderNumber.toLowerCase().includes(q)) ||
      r.patientName.toLowerCase().includes(q) ||
      r.patientUhid.toLowerCase().includes(q) ||
      r.patientPhone.includes(q)
    )
  })

  // Quick stats
  const totalCount = reports.length
  const pendingVerifyCount = reports.filter(r => r.status === 'received_from_lab' || r.status === 'pending').length
  const verifiedCount = reports.filter(r => r.status === 'verified' || r.status === 'ready_for_delivery').length
  const deliveredCount = reports.filter(r => r.status === 'delivered').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">Pending Lab</span>
      case 'received_from_lab':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">Received from Lab</span>
      case 'verified':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">Pathologist Verified</span>
      case 'ready_for_delivery':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">Ready for Dispatch</span>
      case 'delivered':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">Delivered to Patient</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">{status}</span>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/diagnostics" className="hover:underline">Diagnostics</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Diagnostic Lab Reports</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Diagnostic Reports & Pathologist Verification
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage lab report ingestion, certified pathologist sign-offs, clinical notes & multi-channel patient dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchReports()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            + Register Lab Report
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Total Reports</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Diagnostic records generated</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Needs Sign-off</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingVerifyCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting Pathologist review</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Verified & Ready</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{verifiedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Ready for patient dispatch</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{deliveredCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Sent via WhatsApp / SMS</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search report #, order #, patient name, UHID, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            <option value="received_from_lab">Needs Pathologist Sign-off</option>
            <option value="verified">Verified</option>
            <option value="ready_for_delivery">Ready for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p>Loading diagnostic reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium text-foreground">No reports found</h3>
            <p className="text-sm mt-1">Try modifying your filters or register a new report.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Report Details</th>
                  <th className="py-3 px-4">Patient Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pathologist Sign-off</th>
                  <th className="py-3 px-4">Report File</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-primary">{report.reportNumber}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span>Order:</span>
                        <Link href={`/admin/diagnostics/orders`} className="font-mono hover:underline text-foreground">
                          {report.orderNumber || 'View Order'}
                        </Link>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{report.patientName}</div>
                      <div className="text-xs text-muted-foreground font-mono">UHID: {report.patientUhid}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{report.patientPhone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(report.status)}
                      {report.deliveredAt && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                          Delivered: {new Date(report.deliveredAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {report.verifiedAt ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Signed Off</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By: <strong className="text-foreground">{report.verifiedBy || 'Certified Pathologist'}</strong>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {new Date(report.verifiedAt).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Pending Review</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {report.fileUrl ? (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{report.fileName || 'View PDF Report'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No file attached</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status !== 'verified' && report.status !== 'delivered' && (
                          <button
                            onClick={() => handleOpenVerifyModal(report)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verify
                          </button>
                        )}

                        {report.status === 'verified' && (
                          <button
                            onClick={() => handleMarkDelivered(report.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Send Patient
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenVerifyModal(report)}
                          className="px-2 py-1 text-xs font-medium border rounded hover:bg-muted transition-colors"
                          title="Edit or inspect notes"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify & Pathologist Sign-Off Modal */}
      {verifyModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Pathologist Verification & Sign-off
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Digitally verify report <span className="font-mono font-semibold text-foreground">{selectedReport.reportNumber}</span> for patient <strong className="text-foreground">{selectedReport.patientName}</strong> (UHID: {selectedReport.patientUhid})
            </p>

            <form onSubmit={handleVerifySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Pathologist Clinical Observations / Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. CBC within normal biological reference ranges. Mild neutrophilia noted. Correlate with clinical findings."
                  value={verifyNotes}
                  onChange={e => setVerifyNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Report Document URL / Cloud Link (PDF)</label>
                <input
                  type="text"
                  placeholder="https://storage.capsiccare.com/reports/..."
                  value={verifyFileUrl}
                  onChange={e => setVerifyFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                Digitally signing this report certifies that all pathological and biochemical parameters conform to internal quality controls and NABL guidelines.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing...' : 'Confirm & Sign-off Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Report Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Register Diagnostic Lab Report
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ingest a new laboratory report record linked to an existing diagnostic order.
            </p>

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Diagnostic Order ID (UUID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7f2081d0-bbf7-48f8-b391-9aa2a849b27b"
                  value={newOrderId}
                  onChange={e => setNewOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="received_from_lab">Received from Lab</option>
                  <option value="verified">Verified (Pathologist Signed)</option>
                  <option value="pending">Pending Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Report PDF URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newFileUrl}
                  onChange={e => setNewFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Observations or test summary..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newOrderId}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
