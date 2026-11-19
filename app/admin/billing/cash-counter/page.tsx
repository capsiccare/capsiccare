'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Building,
  User,
  DollarSign,
  TrendingUp,
  Receipt,
  FileCheck
} from 'lucide-react'

interface CashSession {
  id: string
  branch_id: string
  branchName?: string
  staff_id: string
  staffName?: string
  session_date: string
  opened_at: string
  closed_at?: string
  status: 'open' | 'closed'
  openingBalanceInr: number
  cashCollectedInr: number
  cashRefundedInr: number
  expectedClosingInr: number
  actualClosingInr?: number | null
  varianceInr?: number | null
  closing_notes?: string
}

interface Branch {
  id: string
  name: string
  code: string
}

export default function CashCounterShiftPage() {
  const [activeSession, setActiveSession] = useState<CashSession | null>(null)
  const [pastSessions, setPastSessions] = useState<CashSession[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  // Open Modal State
  const [openModalVisible, setOpenModalVisible] = useState(false)
  const [openBranchId, setOpenBranchId] = useState('')
  const [openingBalanceInr, setOpeningBalanceInr] = useState<number>(2000)
  const [isOpeningSession, setIsOpeningSession] = useState(false)

  // Close Modal State
  const [closeModalVisible, setCloseModalVisible] = useState(false)
  const [countedCashInr, setCountedCashInr] = useState<number>(0)
  const [closingNotes, setClosingNotes] = useState('')
  const [isClosingSession, setIsClosingSession] = useState(false)

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      const [sessionRes, branchRes] = await Promise.all([
        fetch('/api/v1/billing/cash-counter'),
        fetch('/api/v1/branches'),
      ])

      const sessionData = await sessionRes.json()
      const branchData = await branchRes.json()

      if (sessionData.success && sessionData.data) {
        setActiveSession(sessionData.data.activeSession || null)
        setPastSessions(sessionData.data.todaySessions || [])
      }

      if (branchData.success) {
        const brs = branchData.data || []
        setBranches(brs)
        if (brs.length > 0 && !openBranchId) {
          setOpenBranchId(brs[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching cash counter data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessionData()
  }, [])

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!openBranchId || openingBalanceInr < 0) return

    setIsOpeningSession(true)
    try {
      const res = await fetch('/api/v1/billing/cash-counter/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: openBranchId,
          opening_balance_paise: Math.round(openingBalanceInr * 100),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setOpenModalVisible(false)
        fetchSessionData()
        alert('Cash counter shift opened successfully!')
      } else {
        alert(data.error?.message || 'Failed to open shift')
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred')
    } finally {
      setIsOpeningSession(false)
    }
  }

  const handleOpenCloseModal = () => {
    if (!activeSession) return
    const expected = activeSession.openingBalanceInr + activeSession.cashCollectedInr - activeSession.cashRefundedInr
    setCountedCashInr(expected)
    setClosingNotes('')
    setCloseModalVisible(true)
  }

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSession) return

    setIsClosingSession(true)
    try {
      const res = await fetch('/api/v1/billing/cash-counter/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSession.id,
          actual_closing_paise: Math.round(countedCashInr * 100),
          closing_notes: closingNotes || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setCloseModalVisible(false)
        fetchSessionData()
        alert(`Shift closed successfully! Recorded variance: ₹${data.data?.varianceInr || 0}`)
      } else {
        alert(data.error?.message || 'Failed to close shift')
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred')
    } finally {
      setIsClosingSession(false)
    }
  }

  // Active expected calculation
  const currentExpectedInr = activeSession
    ? activeSession.openingBalanceInr + activeSession.cashCollectedInr - activeSession.cashRefundedInr
    : 0

  const calculatedVariance = activeSession ? countedCashInr - currentExpectedInr : 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/billing" className="hover:underline">Billing & POS</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Cash Counter Shift Reconciliation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Cash Counter Shift Reconciliation
          </h1>
          <p className="text-sm text-muted-foreground">
            Opening float registration, cash intake audit, physical drawer counting & daily handover reconciliation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSessionData()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href="/admin/billing"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            Back to Invoices
          </Link>
        </div>
      </div>

      {/* Active Shift Status Banner */}
      <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
            <p className="text-xs">Checking active shift status...</p>
          </div>
        ) : activeSession ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Active Shift in Progress
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      (Opened: {new Date(activeSession.opened_at).toLocaleTimeString()})
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    Cash Drawer Terminal — {activeSession.branchName || 'Primary Branch'}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleOpenCloseModal}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 transition-colors"
              >
                Close Shift & Handover Cash
              </button>
            </div>

            {/* Shift Financial Tallies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Opening Float</span>
                <div className="text-xl font-bold font-mono text-foreground mt-1">
                  ₹{activeSession.openingBalanceInr.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Initial cash in till</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Cash Collected Today</span>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  +₹{activeSession.cashCollectedInr.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Receipts deposited in till</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Cash Refunded</span>
                <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  -₹{activeSession.cashRefundedInr.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Disbursed cash refunds</p>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-xs text-primary font-bold uppercase">Expected Cash in Drawer</span>
                <div className="text-2xl font-black font-mono text-primary mt-1">
                  ₹{currentExpectedInr.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Physical audit target</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4 max-w-md mx-auto">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No Active Cash Counter Shift</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You must open a shift session before recording physical cash payments to ensure strict financial audit trails.
              </p>
            </div>
            <button
              onClick={() => setOpenModalVisible(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              Open Cash Counter Shift
            </button>
          </div>
        )}
      </div>

      {/* Shifts History Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
          <div className="font-semibold text-sm flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            <span>Today&apos;s Shift Reconciliation Log</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{new Date().toLocaleDateString()}</span>
        </div>

        {pastSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No shift logs found for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b uppercase text-muted-foreground font-bold">
                <tr>
                  <th className="py-3 px-4">Shift Timestamps</th>
                  <th className="py-3 px-4">Staff</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4 text-right">Opening (₹)</th>
                  <th className="py-3 px-4 text-right">Collected (₹)</th>
                  <th className="py-3 px-4 text-right">Expected (₹)</th>
                  <th className="py-3 px-4 text-right">Counted (₹)</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pastSessions.map(session => (
                  <tr key={session.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">
                        {new Date(session.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {session.closed_at && (
                          <span> — {new Date(session.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{session.session_date}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-foreground">
                      {session.staffName || 'Staff Member'}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {session.branchName || 'Clinic'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      ₹{session.openingBalanceInr}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      ₹{session.cashCollectedInr}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      ₹{session.expectedClosingInr}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {session.actualClosingInr !== null && session.actualClosingInr !== undefined
                        ? `₹${session.actualClosingInr}`
                        : '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {session.varianceInr !== null && session.varianceInr !== undefined ? (
                        session.varianceInr === 0 ? (
                          <span className="text-emerald-600">₹0 (Matched)</span>
                        ) : session.varianceInr < 0 ? (
                          <span className="text-destructive">-₹{Math.abs(session.varianceInr)} (Short)</span>
                        ) : (
                          <span className="text-blue-600">+₹{session.varianceInr} (Surplus)</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        session.status === 'open'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-muted text-foreground'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Shift Modal */}
      {openModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Open Cash Counter Shift
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Set up your cashier drawer float balance to begin collecting daily receipts.
            </p>

            <form onSubmit={handleOpenShift} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Clinic Branch *</label>
                <select
                  required
                  value={openBranchId}
                  onChange={e => setOpenBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Opening Cash Float (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={openingBalanceInr}
                  onChange={e => setOpeningBalanceInr(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Physical currency change provided in cash drawer at shift start.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModalVisible(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOpeningSession}
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isOpeningSession ? 'Opening...' : 'Start Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {closeModalVisible && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Close Shift & Physical Currency Count
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Count all physical currency notes in the drawer and record end-of-shift handover.
            </p>

            <form onSubmit={handleCloseShift} className="mt-4 space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Opening Float:</span>
                  <span className="font-mono font-semibold">₹{activeSession.openingBalanceInr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash Collected Today:</span>
                  <span className="font-mono font-semibold text-emerald-600">+₹{activeSession.cashCollectedInr}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold">
                  <span>Expected Total in Drawer:</span>
                  <span className="font-mono text-primary">₹{currentExpectedInr}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Physical Cash Counted (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={countedCashInr}
                  onChange={e => setCountedCashInr(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Variance Indicator */}
              <div className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
                calculatedVariance === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                  : calculatedVariance < 0
                  ? 'bg-destructive/10 border-destructive/20 text-destructive'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-800 dark:text-blue-300'
              }`}>
                <span>Reconciliation Variance:</span>
                <span className="font-mono font-bold">
                  {calculatedVariance === 0
                    ? '₹0 (Exact Match)'
                    : calculatedVariance < 0
                    ? `-₹${Math.abs(calculatedVariance)} (Shortage)`
                    : `+₹${calculatedVariance} (Surplus)`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Handover Notes / Discrepancy Reason</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handed over ₹7,500 to night supervisor; drawer locked."
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseModalVisible(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosingSession}
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {isClosingSession ? 'Closing Shift...' : 'Confirm & Close Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
