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

export function downloadInvoiceReceiptHtml(invoice: InvoiceDetails) {
  const isFullyPaid = invoice.balanceInr <= 0
  const itemsHtml = (invoice.items || [])
    .map(
      (it, idx) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
        <strong style="color: #0f172a;">${it.description}</strong>
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">${it.itemType.replace(/_/g, ' ')}</div>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">${it.hsnSac || '999312'}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${it.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${it.unitPriceInr}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">₹${it.totalInr}</td>
    </tr>
  `
    )
    .join('')

  const paymentsHtml =
    (invoice.payments || []).length > 0
      ? `
    <div style="margin-top: 16px;">
      <div style="font-size: 11px; font-weight: bold; color: #1e293b; margin-bottom: 6px;">Payment Receipts Recorded:</div>
      ${invoice.payments
        .map(
          (p) => `
        <div style="display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 11px; margin-bottom: 4px;">
          <span style="font-family: monospace; color: #475569;">${p.receiptNumber}</span>
          <span style="text-transform: capitalize; color: #334155;">${p.paymentMethod}</span>
          <span style="font-family: monospace; font-weight: bold; color: #047857;">₹${p.amountInr}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `
      : ''

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CAPSIC CARE - Tax Invoice ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #f1f5f9; color: #0f172a; }
    .bill-card { max-width: 750px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: 36px; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
    .brand-title { font-size: 24px; font-weight: 900; color: #047857; letter-spacing: -0.5px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
    th { background: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #cbd5e1; }
    .totals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; font-size: 12px; }
    .gst-note { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 10.5px; color: #64748b; line-height: 1.4; }
    .totals-box { display: flex; flex-direction: column; gap: 6px; }
    .total-row { display: flex; justify-content: space-between; }
    .btn-print { background: #047857; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; text-decoration: none; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .bill-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 750px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 12px; color: #64748b;">Digital Tax Invoice & Official Receipt • CAPSIC CARE OS</span>
    <button onclick="window.print()" class="btn-print">🖨️ Print / Save as PDF</button>
  </div>
  <div class="bill-card">
    <div class="header">
      <div>
        <div class="brand-title">CAPSIC CARE</div>
        <div style="font-size: 12px; font-weight: 600; color: #475569;">Capsic Healthcare Technologies Pvt. Ltd.</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          Branch: <strong>${invoice.branchName}</strong> | Tel: ${invoice.branchPhone || '+918910260709'}
        </div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">GSTIN: Exempt (Healthcare Services)</div>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; background: #e2e8f0; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; color: #1e293b;">
          TAX INVOICE & RECEIPT
        </span>
        <div style="font-family: monospace; font-weight: bold; font-size: 14px; margin-top: 4px; color: #0f172a;">${invoice.invoiceNumber}</div>
        <div style="font-size: 11px; color: #64748b;">Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      </div>
    </div>

    <div class="meta-box">
      <div>
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px;">BILLED TO (PATIENT)</div>
        <div style="font-size: 14px; font-weight: bold; color: #0f172a;">${invoice.patientName}</div>
        <div style="font-family: monospace; color: #475569; margin-top: 2px;">UHID: ${invoice.patientUhid}</div>
        <div style="color: #475569;">Phone: ${invoice.patientPhone}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px;">PAYMENT STATUS</div>
        <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: ${isFullyPaid ? '#d1fae5' : '#fef3c7'}; color: ${isFullyPaid ? '#065f46' : '#92400e'};">
          ${invoice.paymentStatus.replace(/_/g, ' ')}
        </div>
        <div style="margin-top: 6px; color: #475569;">Total Billed: <strong style="color: #0f172a;">₹${invoice.totalInr}</strong></div>
        <div style="color: #047857;">Paid: <strong>₹${invoice.paidInr}</strong></div>
        ${invoice.balanceInr > 0 ? `<div style="color: #b45309; font-weight: bold;">Due Balance: ₹${invoice.balanceInr}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 30px; text-align: center;">#</th>
          <th>Service / Diagnostic Test Description</th>
          <th style="width: 60px; text-align: center;">SAC</th>
          <th style="width: 40px; text-align: center;">Qty</th>
          <th style="width: 80px; text-align: right;">Rate (₹)</th>
          <th style="width: 80px; text-align: right;">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-grid">
      <div>
        <div class="gst-note">
          <strong>GST Exemption Notification:</strong><br />
          Healthcare diagnostic and consultation services are exempt from Goods & Services Tax (GST) under Notification No. 12/2017 - Central Tax (Rate), Heading 9993.
        </div>
        ${paymentsHtml}
      </div>
      <div class="totals-box">
        <div class="total-row"><span>Subtotal:</span><span style="font-family: monospace; font-weight: 600;">₹${invoice.subtotalInr}</span></div>
        ${invoice.discountInr > 0 ? `<div class="total-row" style="color: #047857;"><span>Discount ${invoice.promoCode ? `(${invoice.promoCode})` : ''}:</span><span style="font-family: monospace;">-₹${invoice.discountInr}</span></div>` : ''}
        <div class="total-row" style="color: #64748b;"><span>GST (0% Exempt):</span><span style="font-family: monospace;">₹0</span></div>
        <div class="total-row" style="border-top: 1px solid #cbd5e1; padding-top: 6px; font-size: 15px; font-weight: 900; color: #0f172a;">
          <span>Total Billed:</span>
          <span style="font-family: monospace;">₹${invoice.totalInr}</span>
        </div>
        <div class="total-row" style="color: #047857; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span>Amount Received:</span>
          <span style="font-family: monospace;">₹${invoice.paidInr}</span>
        </div>
        <div class="total-row" style="font-weight: bold; color: ${invoice.balanceInr > 0 ? '#b45309' : '#0f172a'}; font-size: 13px;">
          <span>Balance Due:</span>
          <span style="font-family: monospace;">₹${invoice.balanceInr}</span>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid #e2e8f0; margin-top: 28px; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b;">
      <div>
        <p style="font-weight: 600; color: #1e293b; margin: 0;">Thank you for trusting CAPSIC CARE.</p>
        <p style="margin: 2px 0 0; font-size: 10px;">This is a computer-authenticated digital tax receipt.</p>
      </div>
      <div style="text-align: right;">
        <div style="height: 32px; border-bottom: 1px dashed #94a3b8; width: 160px; margin-bottom: 4px;"></div>
        <span style="font-weight: 600; color: #1e293b;">Authorized Billing Desk</span>
      </div>
    </div>
  </div>
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `CAPSIC_Bill_${invoice.invoiceNumber}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function InvoiceReceiptModal({ isOpen, onClose, invoice }: InvoiceReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !invoice) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    downloadInvoiceReceiptHtml(invoice)
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
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-background hover:bg-muted text-foreground transition-colors shadow-xs"
              title="Download standalone HTML Bill receipt"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Download Bill
            </button>
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
