'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Building,
  Phone,
  Mail,
  FileText
} from 'lucide-react'

export interface InvoiceDetails {
  id: string
  invoiceNumber: string
  invoiceDate: string
  branchName: string
  branchCode?: string
  branchPhone?: string
  patientName: string
  patientUhid: string
  patientPhone: string
  patientGender?: string
  patientAge?: number
  patientAddress?: string
  status: string
  paymentStatus: string
  subtotalInr: number
  discountInr: number
  taxInr: number
  totalInr: number
  paidInr: number
  balanceInr: number
  promoCode?: string
  notes?: string
  items: Array<{
    id: string
    itemType: string
    description: string
    quantity: number
    unitPriceInr: number
    totalInr: number
    hsnSac?: string
  }>
  payments: Array<{
    id: string
    receiptNumber: string
    amountInr: number
    paymentMethod: string
    paymentDate: string
    reference?: string
  }>
}

interface InvoiceReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: InvoiceDetails | null
}

export function InvoiceReceiptModal({ isOpen, onClose, invoice }: InvoiceReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !invoice) return null

  const handlePrint = () => {
    window.print()
  }

  const isFullyPaid = invoice.balanceInr <= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Container - Hide non-printable elements during print via CSS */}
      <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Receipt className="h-4 w-4 text-primary" />
            <span>Tax Invoice & Payment Receipt</span>
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div ref={printRef} className="p-8 bg-white text-slate-900 font-sans space-y-6 printable-invoice">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden border bg-white flex items-center justify-center p-1">
                <Image
                  src="/logo.png"
                  alt="CAPSIC CARE"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">CAPSIC CARE</h2>
                <p className="text-xs font-medium text-slate-600">Capsic Healthcare Technologies Pvt. Ltd.</p>
                <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3">
                  <span>Branch: <strong>{invoice.branchName}</strong></span>
                  {invoice.branchPhone && <span>Tel: {invoice.branchPhone}</span>}
                  <span>GSTIN: Exempt (Healthcare)</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-800 rounded mb-1">
                Tax Invoice & Receipt
              </span>
              <div className="font-mono font-bold text-sm text-slate-950">{invoice.invoiceNumber}</div>
              <div className="text-xs text-slate-500 mt-0.5">Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Patient Details & Billing Meta */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To (Patient)</span>
              <div className="font-bold text-sm text-slate-950">{invoice.patientName}</div>
              <div className="font-mono text-slate-600 mt-0.5">UHID: {invoice.patientUhid}</div>
              <div className="text-slate-600">Phone: {invoice.patientPhone}</div>
              {(invoice.patientGender || invoice.patientAge) && (
                <div className="text-slate-500 capitalize">
                  {invoice.patientGender || ''} {invoice.patientAge ? `(${invoice.patientAge} Yrs)` : ''}
                </div>
              )}
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billing Summary</span>
              <div>
                Status:{' '}
                <span className={`font-semibold uppercase text-[11px] px-1.5 py-0.5 rounded ${isFullyPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {invoice.paymentStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-slate-600">
                Total Billed: <strong className="text-slate-950">₹{invoice.totalInr}</strong>
              </div>
              <div className="text-slate-600">
                Paid: <strong className="text-emerald-700">₹{invoice.paidInr}</strong>
              </div>
              {invoice.balanceInr > 0 && (
                <div className="text-amber-700 font-bold">
                  Balance Due: ₹{invoice.balanceInr}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">Service / Diagnostic Test Description</th>
                  <th className="py-2.5 px-3 text-center w-20">SAC</th>
                  <th className="py-2.5 px-3 text-center w-14">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right w-24">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(invoice.items || []).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{item.itemType.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{item.hsnSac || '999312'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700 font-mono">₹{item.unitPriceInr}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-950 font-mono">₹{item.totalInr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations & Notes */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <span className="font-bold text-slate-800 block">GST Exemption Notification:</span>
                <p>
                  Healthcare diagnostic and consultation services are exempt from Goods & Services Tax (GST) in accordance with Ministry of Finance Notification No. 12/2017 - Central Tax (Rate), Heading 9993.
                </p>
              </div>

              {/* Payments receipt ledger */}
              {(invoice.payments || []).length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 text-[11px] block">Payment Receipts Recorded:</span>
                  <div className="space-y-1">
                    {(invoice.payments || []).map(pay => (
                      <div key={pay.id} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 text-[11px]">
                        <span className="font-mono text-slate-700">{pay.receiptNumber}</span>
                        <span className="capitalize font-semibold text-slate-800">{pay.paymentMethod}</span>
                        <span className="font-mono font-bold text-emerald-700">₹{pay.amountInr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Totals Box */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{invoice.subtotalInr}</span>
              </div>
              {invoice.discountInr > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount {invoice.promoCode ? `(${invoice.promoCode})` : ''}:</span>
                  <span className="font-mono">-₹{invoice.discountInr}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST (Healthcare Exempt 0%):</span>
                <span className="font-mono">₹0</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between text-base font-black text-slate-950">
                <span>Total Amount:</span>
                <span className="font-mono">₹{invoice.totalInr}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold border-b border-slate-200 pb-2">
                <span>Amount Received:</span>
                <span className="font-mono">₹{invoice.paidInr}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                <span>Balance Due:</span>
                <span className="font-mono text-amber-700">₹{invoice.balanceInr}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Timestamp */}
          <div className="border-t border-slate-200 pt-8 mt-6 flex items-end justify-between text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">Thank you for choosing CAPSIC CARE!</p>
              <p className="text-[10px] mt-0.5">This is a system-authenticated digital medical invoice.</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 w-48 mb-1"></div>
              <span className="text-[11px] font-semibold text-slate-800">Authorized Billing Officer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Print Styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-invoice, .printable-invoice * {
            visibility: visible;
          }
          .printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            margin: 0;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
