'use client'

import React, { useEffect, useState } from 'react'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  QrCode,
  DollarSign,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientBillingPage() {
  const { activePatientId, t } = usePatient()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [payingInvoice, setPayingInvoice] = useState<any | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [paying, setPaying] = useState(false)
  const [receipt, setReceipt] = useState<any | null>(null)

  useEffect(() => {
    if (activePatientId) {
      loadInvoices(activePatientId)
    }
  }, [activePatientId])

  const loadInvoices = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/invoices?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setInvoices(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!payingInvoice || !activePatientId) return
    try {
      setPaying(true)
      const res = await fetch(`/api/v1/patient/invoices?patientId=${activePatientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payingInvoice.id,
          amount: payingInvoice.balance_amount || payingInvoice.total_amount,
          paymentMethod,
        }),
      })

      const json = await res.json()
      if (res.ok) {
        setReceipt(json.data)
        setPayingInvoice(null)
        loadInvoices(activePatientId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPaying(false)
    }
  }

  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + (inv.payment_status !== 'paid' ? Number(inv.balance_amount || inv.total_amount || 0) : 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.billing}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your clinic invoices, itemized consultation & diagnostic bills, and pay online.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50 flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-teal-600" />
          <div>
            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold uppercase block">
              Total Outstanding Due
            </span>
            <span className="text-base font-black text-teal-900 dark:text-teal-100">
              ₹{totalOutstanding.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No billing records found
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Invoices generated for consultations and lab orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const isPaid = inv.payment_status === 'paid'
            return (
              <div
                key={inv.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      Invoice #{inv.invoice_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                      }`}
                    >
                      {inv.payment_status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Date: {inv.invoice_date || inv.created_at?.substring(0, 10)} • Branch: {inv.branch?.name || 'Clinic'}
                  </div>

                  {inv.items && inv.items.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-400">
                      {inv.items.map((it: any) => it.description || it.item_name).join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total / Due</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ₹{inv.total_amount}
                    </span>
                    {!isPaid && (
                      <span className="text-xs text-red-600 block font-semibold">
                        Due: ₹{inv.balance_amount || inv.total_amount}
                      </span>
                    )}
                  </div>

                  {!isPaid ? (
                    <button
                      onClick={() => setPayingInvoice(inv)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      Pay Online
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                      <CheckCircle2 className="h-4 w-4" /> Paid
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mock Payment Gateway Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-teal-600" />
                CAPSIC CARE Secure Checkout
              </h3>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Invoice #{payingInvoice.invoice_number}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Amount Due</span>
              </div>
              <span className="text-lg font-black text-teal-600">
                ₹{payingInvoice.balance_amount || payingInvoice.total_amount}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR' },
                  { id: 'card', label: 'Debit/Credit' },
                  { id: 'netbanking', label: 'NetBanking' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      paymentMethod === pm.id
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 text-[11px] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600" />
              <span>256-bit SSL encrypted healthcare checkout transaction.</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setPayingInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={paying}
                onClick={handlePay}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {paying ? 'Processing...' : `Pay ₹${payingInvoice.balance_amount || payingInvoice.total_amount}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Payment Successful!
            </h3>
            <p className="text-xs text-slate-500">
              Transaction ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{receipt.transaction_id}</span>
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{receipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="font-semibold uppercase">{receipt.payment_method}</span>
              </div>
            </div>
            <button
              onClick={() => setReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
