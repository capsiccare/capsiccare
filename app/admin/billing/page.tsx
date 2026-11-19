'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Printer,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Phone,
  FileText,
  Wallet,
  Receipt,
  Trash2
} from 'lucide-react'
import { InvoiceReceiptModal, InvoiceDetails } from '@/components/admin/billing/invoice-receipt-modal'

interface Branch {
  id: string
  name: string
  code: string
}

export default function BillingPOSPage() {
  const [invoices, setInvoices] = useState<InvoiceDetails[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')

  // Print modal state
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<InvoiceDetails | null>(null)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  // Payment modal state
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [payingInvoice, setPayingInvoice] = useState<InvoiceDetails | null>(null)
  const [payAmountInr, setPayAmountInr] = useState<number>(0)
  const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer'>('cash')
  const [payReference, setPayReference] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [isSubmittingPay, setIsSubmittingPay] = useState(false)

  // New Invoice Modal state
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false)
  const [newBranchId, setNewBranchId] = useState('')
  const [quickPatientName, setQuickPatientName] = useState('')
  const [quickPatientPhone, setQuickPatientPhone] = useState('')
  const [quickPatientAge, setQuickPatientAge] = useState<number | ''>('')
  const [quickPatientGender, setQuickPatientGender] = useState<'male' | 'female' | 'other'>('male')
  const [newPromoCode, setNewPromoCode] = useState('')
  const [newItems, setNewItems] = useState<Array<{
    itemType: 'consultation' | 'test' | 'package' | 'other'
    description: string
    quantity: number
    unitPriceInr: number
  }>>([
    { itemType: 'consultation', description: 'General OPD Consultation', quantity: 1, unitPriceInr: 500 }
  ])
  const [initialPayMethod, setInitialPayMethod] = useState<'none' | 'cash' | 'upi' | 'card'>('cash')
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (paymentStatusFilter !== 'all') params.append('paymentStatus', paymentStatusFilter)

      const [invRes, branchRes] = await Promise.all([
        fetch(`/api/v1/billing/invoices?${params.toString()}`),
        fetch(`/api/v1/branches`),
      ])

      const invData = await invRes.json()
      const branchData = await branchRes.json()

      if (invData.success) {
        setInvoices(invData.data || [])
      }
      if (branchData.success) {
        const brs = branchData.data || []
        setBranches(brs)
        if (brs.length > 0 && !newBranchId) {
          setNewBranchId(brs[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter, paymentStatusFilter])

  const handleOpenPayModal = (inv: InvoiceDetails) => {
    setPayingInvoice(inv)
    setPayAmountInr(inv.balanceInr)
    setPayMethod('cash')
    setPayReference('')
    setPayNotes('')
    setPayModalOpen(true)
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingInvoice || payAmountInr <= 0) return

    setIsSubmittingPay(true)
    try {
      const res = await fetch(`/api/v1/billing/invoices/${payingInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_paise: Math.round(payAmountInr * 100),
          payment_method: payMethod,
          transaction_reference: payReference || undefined,
          notes: payNotes || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setPayModalOpen(false)
        fetchInvoices()
        alert(`Payment of ₹${payAmountInr} recorded successfully!`)
      } else {
        alert(data.error?.message || 'Failed to record payment')
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while recording payment')
    } finally {
      setIsSubmittingPay(false)
    }
  }

  const handleAddItemRow = () => {
    setNewItems(prev => [
      ...prev,
      { itemType: 'test', description: '', quantity: 1, unitPriceInr: 250 }
    ])
  }

  const handleRemoveItemRow = (index: number) => {
    setNewItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBranchId || !quickPatientName || !quickPatientPhone) return
    if (newItems.length === 0) {
      alert('Add at least one item')
      return
    }

    setIsCreatingInvoice(true)
    try {
      const computedSubtotal = newItems.reduce((acc, it) => acc + (it.unitPriceInr * it.quantity), 0)
      const payload: any = {
        branch_id: newBranchId,
        quick_patient: {
          full_name: quickPatientName,
          phone: quickPatientPhone,
          age_years: quickPatientAge ? Number(quickPatientAge) : undefined,
          gender: quickPatientGender,
        },
        items: newItems.map(it => ({
          item_type: it.itemType,
          description: it.description || (it.itemType === 'consultation' ? 'OPD Consultation' : 'Clinical Service'),
          quantity: it.quantity,
          unit_price_paise: Math.round(it.unitPriceInr * 100),
        })),
        promo_code: newPromoCode || undefined,
      }

      if (initialPayMethod !== 'none') {
        payload.initial_payment = {
          method: initialPayMethod,
          amount_paise: Math.round(computedSubtotal * 100),
        }
      }

      const res = await fetch('/api/v1/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        setNewInvoiceModalOpen(false)
        fetchInvoices()
        // Prompt for print
        if (data.data) {
          setSelectedInvoiceForPrint(data.data)
          setPrintModalOpen(true)
        }
      } else {
        alert(data.error?.message || 'Failed to create invoice')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating invoice')
    } finally {
      setIsCreatingInvoice(false)
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.patientUhid.toLowerCase().includes(q) ||
      inv.patientPhone.includes(q)
    )
  })

  // Financial KPI calculations
  const totalInvoicedInr = invoices.reduce((acc, i) => acc + i.totalInr, 0)
  const totalCollectedInr = invoices.reduce((acc, i) => acc + i.paidInr, 0)
  const totalBalanceDueInr = invoices.reduce((acc, i) => acc + i.balanceInr, 0)
  const unpaidCount = invoices.filter(i => i.balanceInr > 0).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="text-foreground font-medium">Finance & Billing</span>
            <span>/</span>
            <span className="text-foreground font-medium">POS Terminal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Unified Billing & Cash Counter POS
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-branch invoicing, GST tax calculation, immediate receipts & shift cash management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInvoices()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href="/admin/billing/cash-counter"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <Wallet className="h-4 w-4 text-primary" />
            Cash Counter Shift
          </Link>
          <button
            onClick={() => setNewInvoiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New POS Bill
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Total Invoiced</span>
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold">₹{totalInvoicedInr.toLocaleString('en-IN')}</div>
          <p className="text-xs text-muted-foreground mt-1">Across all branches</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Total Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{totalCollectedInr.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Cash, UPI & Card payments</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Outstanding Due</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            ₹{totalBalanceDueInr.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{unpaidCount} invoices with pending balance</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Cash Counter</span>
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
          <Link
            href="/admin/billing/cash-counter"
            className="mt-2 text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Reconcile Cash Shift <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Opening, cash intake & physical audit</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoice #, patient name, UHID, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Fully Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p>Loading invoices and POS ledger...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Receipt className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium text-foreground">No invoices found</h3>
            <p className="text-sm mt-1">Create a new bill or change your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice # & Date</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-primary">{inv.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-medium">
                        {inv.branchName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{inv.patientName}</div>
                      <div className="text-xs text-muted-foreground font-mono">UHID: {inv.patientUhid}</div>
                      <div className="text-xs text-muted-foreground">{inv.patientPhone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-foreground font-medium">
                        {inv.items.map(it => it.description).slice(0, 2).join(', ')}
                        {inv.items.length > 2 ? ` +${inv.items.length - 2} more` : ''}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {inv.items.length} item{inv.items.length > 1 ? 's' : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold font-mono">
                      ₹{inv.totalInr}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{inv.paidInr}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {inv.balanceInr > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">₹{inv.balanceInr}</span>
                      ) : (
                        <span className="text-muted-foreground">₹0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        inv.balanceInr <= 0
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : inv.paidInr > 0
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      }`}>
                        {inv.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.balanceInr > 0 && (
                          <button
                            onClick={() => handleOpenPayModal(inv)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPrint(inv)
                            setPrintModalOpen(true)
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground border rounded hover:bg-muted transition-colors"
                          title="Print Tax Invoice & Receipt"
                        >
                          <Printer className="h-4 w-4" />
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

      {/* Record Payment Modal */}
      {payModalOpen && payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Collect Payment & Issue Receipt
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Invoice <span className="font-mono font-semibold text-foreground">{payingInvoice.invoiceNumber}</span> for <strong className="text-foreground">{payingInvoice.patientName}</strong>
            </p>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg flex justify-between text-xs font-medium">
                <div>Total Billed: ₹{payingInvoice.totalInr}</div>
                <div>Already Paid: ₹{payingInvoice.paidInr}</div>
                <div className="text-amber-600 font-bold">Due: ₹{payingInvoice.balanceInr}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={payingInvoice.balanceInr}
                  value={payAmountInr}
                  onChange={e => setPayAmountInr(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'upi', 'card'] as const).map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`py-2 text-xs font-semibold rounded-lg border uppercase transition-all ${
                        payMethod === m
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'border-border bg-background hover:bg-muted text-foreground'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Transaction Ref / UTR / Card Auth Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref # 349120481230"
                  value={payReference}
                  onChange={e => setPayReference(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay || payAmountInr <= 0}
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSubmittingPay ? 'Recording...' : `Collect ₹${payAmountInr}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New POS Bill Modal */}
      {newInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Generate POS Bill & Collect Payment
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create an OPD consultation or clinical diagnostic invoice with immediate receipt generation.
            </p>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-4">
              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold mb-1">Operating Branch *</label>
                <select
                  required
                  value={newBranchId}
                  onChange={e => setNewBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              {/* Patient Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={quickPatientName}
                    onChange={e => setQuickPatientName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Phone"
                    value={quickPatientPhone}
                    onChange={e => setQuickPatientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Gender</label>
                  <select
                    value={quickPatientGender}
                    onChange={e => setQuickPatientGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-sm rounded-md border bg-background"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Age (Yrs)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    placeholder="Age"
                    value={quickPatientAge}
                    onChange={e => setQuickPatientAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-1.5 text-sm rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={newPromoCode}
                    onChange={e => setNewPromoCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-md border bg-background uppercase font-mono"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Billable Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={item.itemType}
                        onChange={e => {
                          const val = e.target.value as any
                          setNewItems(prev => prev.map((it, i) => i === idx ? { ...it, itemType: val } : it))
                        }}
                        className="w-32 px-2 py-1.5 text-xs rounded border bg-background"
                      >
                        <option value="consultation">OPD Consultation</option>
                        <option value="test">Diagnostic Test</option>
                        <option value="package">Health Package</option>
                        <option value="other">Other</option>
                      </select>

                      <input
                        type="text"
                        required
                        placeholder="Description..."
                        value={item.description}
                        onChange={e => {
                          const val = e.target.value
                          setNewItems(prev => prev.map((it, i) => i === idx ? { ...it, description: val } : it))
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded border bg-background"
                      />

                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => {
                          const val = Number(e.target.value) || 1
                          setNewItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it))
                        }}
                        className="w-16 px-2 py-1.5 text-xs rounded border bg-background text-center font-mono"
                      />

                      <input
                        type="number"
                        min={0}
                        placeholder="Price ₹"
                        value={item.unitPriceInr}
                        onChange={e => {
                          const val = Number(e.target.value) || 0
                          setNewItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPriceInr: val } : it))
                        }}
                        className="w-24 px-2 py-1.5 text-xs rounded border bg-background text-right font-mono font-bold"
                      />

                      {newItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Payment Selector */}
              <div className="pt-2 border-t flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold mb-1">Immediate Payment Method</label>
                  <div className="flex gap-2">
                    {(['cash', 'upi', 'card', 'none'] as const).map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setInitialPayMethod(m)}
                        className={`px-3 py-1 text-xs font-semibold rounded border uppercase ${
                          initialPayMethod === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-foreground'
                        }`}
                      >
                        {m === 'none' ? 'Pay Later' : m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Estimated Total</span>
                  <div className="text-xl font-bold font-mono text-foreground">
                    ₹{newItems.reduce((acc, it) => acc + (it.unitPriceInr * it.quantity), 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewInvoiceModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingInvoice}
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isCreatingInvoice ? 'Generating...' : 'Issue Invoice & Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice & Receipt Print Modal */}
      <InvoiceReceiptModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        invoice={selectedInvoiceForPrint}
      />
    </div>
  )
}
