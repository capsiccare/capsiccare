'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Phone, Mail, Globe, MapPin, Printer, FileDown, Download, Loader2 } from 'lucide-react'
import { numberToWords } from '@/lib/utils/number-to-words'

export interface HomeCollectionDetails {
  enabled: boolean
  baseCharge: number // Default 150
  discountPercent: number // e.g. 0, 10, 20, 30, 50, 100
  discountAmount: number
  finalCharge: number
}

export interface CashMemoItem {
  id?: string
  name: string
  date?: string
  qty?: number
  price: number
  mrp?: number
  basePrice?: number
  isMarginApplied?: boolean
}

export interface CashMemoData {
  billId?: string
  patientId?: string
  patientName: string
  age?: string | number
  gender?: string
  phone: string
  category?: string
  billDate?: string
  modeOfPayment?: string
  accountName?: string
  items: CashMemoItem[]
  homeCollection?: HomeCollectionDetails
  discountAmount?: number
  discountLabel?: string
  amountPaid?: number
  paymentStatus?: 'PAID' | 'PARTIALLY PAID' | 'UNPAID'
  printedBy?: string
  createdBy?: string
  timestamp?: string
  showReviewReferralOffer?: boolean
  reviewOfferNote?: string
}

interface OutpatientCashMemoProps {
  data: CashMemoData
  onClose?: () => void
  showActions?: boolean
}

export function OutpatientCashMemo({ data, onClose, showActions = true }: OutpatientCashMemoProps) {
  const todayStr = (() => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${day}-${month}-${year}`
  })()

  const currentDateStr = data.billDate || todayStr
  const billId = data.billId || `CC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`
  const patientId = data.patientId || '-'
  const paymentMode = data.modeOfPayment || 'Cash'
  const accountStaff = data.accountName || data.createdBy || 'Billing Desk'
  const printedTime = data.timestamp || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  // Calculations
  const itemsSubtotal = data.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0)
  const itemsStandardSubtotal = data.items.reduce((sum, item) => {
    const stdPrice = item.mrp && item.mrp >= item.price ? item.mrp : item.price
    return sum + (stdPrice * (item.qty || 1))
  }, 0)
  const itemsSavings = Math.max(0, itemsStandardSubtotal - itemsSubtotal)

  const isHomeColEnabled = data.homeCollection?.enabled || false
  const homeColStandard = isHomeColEnabled ? (data.homeCollection?.baseCharge || 150) : 0
  const homeColDiscountPct = isHomeColEnabled ? (data.homeCollection?.discountPercent || 0) : 0
  const homeColSavings = isHomeColEnabled ? (data.homeCollection?.discountAmount || 0) : 0
  const homeColFinal = isHomeColEnabled ? (data.homeCollection?.finalCharge || 0) : 0

  const manualDiscount = data.discountAmount || 0
  const discountLabel = data.discountLabel || 'Additional Discount'

  const totalBillAmount = itemsStandardSubtotal + homeColStandard
  const totalSavings = itemsSavings + homeColSavings + manualDiscount
  const grandTotal = Math.max(0, itemsSubtotal + homeColFinal - manualDiscount)
  
  // Real-time Advance / Amount Paid & Balance Due calculations
  const rawAmountPaid = data.amountPaid !== undefined ? data.amountPaid : grandTotal
  const amountPaid = typeof rawAmountPaid === 'number'
    ? Math.max(0, rawAmountPaid)
    : (data.amountPaid !== undefined ? Math.max(0, parseFloat(String(data.amountPaid)) || 0) : grandTotal)
  const balanceDue = Math.max(0, grandTotal - amountPaid)

  // Payment Status: PAID / PARTIALLY PAID / UNPAID
  const paymentStatus: 'PAID' | 'PARTIALLY PAID' | 'UNPAID' = (() => {
    if (data.paymentStatus) return data.paymentStatus
    if (grandTotal === 0) return 'PAID'
    if (amountPaid >= grandTotal) return 'PAID'
    if (amountPaid > 0) return 'PARTIALLY PAID'
    return 'UNPAID'
  })()

  const amountInWords = grandTotal > 0 ? numberToWords(Math.round(grandTotal)) : 'Zero Rupees Only'

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const downloadHighResPDF = async () => {
    const rootEl = document.getElementById('outpatient-cash-memo-print-root')
    if (!rootEl) {
      handlePrint()
      return
    }

    try {
      setIsGeneratingPdf(true)
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      // Capture at scale 3 (300+ DPI photographic pixel clarity)
      const canvas = await html2canvas(rootEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('outpatient-cash-memo-print-root')
          if (el) {
            // Lock width to standard A4 desktop width (800px) so mobile captures never wrap or skew
            el.style.width = '800px'
            el.style.minWidth = '800px'
            el.style.maxWidth = '800px'
            el.style.padding = '20px 24px'
            el.style.boxSizing = 'border-box'
            el.style.background = '#ffffff'
            el.style.borderRadius = '0'
            el.style.boxShadow = 'none'
            el.style.border = '1px solid #0f172a'
            el.style.color = '#0f172a'
            ;(el.style as any).webkitFontSmoothing = 'antialiased'
            ;(el.style as any).textRendering = 'geometricPrecision'

            const headerRow = el.querySelector('.memo-header-container') as HTMLElement
            if (headerRow) {
              headerRow.style.display = 'flex'
              headerRow.style.flexDirection = 'row'
              headerRow.style.justifyContent = 'space-between'
              headerRow.style.alignItems = 'center'
            }

            const metaGrid = el.querySelector('.memo-meta-grid') as HTMLElement
            if (metaGrid) {
              metaGrid.style.display = 'grid'
              metaGrid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))'
            }

            const summaryGrid = el.querySelector('.memo-summary-grid') as HTMLElement
            if (summaryGrid) {
              summaryGrid.style.display = 'grid'
              summaryGrid.style.gridTemplateColumns = '1.15fr 1.05fr'
            }

            const offerBox = el.querySelector('.memo-offer-box') as HTMLElement
            if (offerBox) {
              offerBox.style.display = 'flex'
              offerBox.style.flexDirection = 'row'
              offerBox.style.justifyContent = 'space-between'
              offerBox.style.alignItems = 'center'
            }

            const stampRow = el.querySelector('.memo-stamp-row') as HTMLElement
            if (stampRow) {
              stampRow.style.display = 'flex'
              stampRow.style.flexDirection = 'row'
              stampRow.style.justifyContent = 'space-between'
              stampRow.style.alignItems = 'center'
            }

            const footerBar = el.querySelector('.memo-footer-bar') as HTMLElement
            if (footerBar) {
              footerBar.style.display = 'flex'
              footerBar.style.flexDirection = 'row'
              footerBar.style.justifyContent = 'space-between'
              footerBar.style.alignItems = 'center'
            }
          }
        },
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      // Standard A4 is 210mm x 297mm
      const pageWidth = 210
      const pageHeight = 297
      const margin = 8 // 8mm margins
      const printableWidth = pageWidth - (margin * 2) // 194mm
      const maxPrintableHeight = pageHeight - (margin * 2) // 281mm

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const ratio = canvasHeight / canvasWidth

      let targetWidth = printableWidth
      let targetHeight = printableWidth * ratio

      // Proportional fitting so invoice is guaranteed to fit cleanly on 1 page without pagination cut
      if (targetHeight > maxPrintableHeight) {
        const shrinkFactor = maxPrintableHeight / targetHeight
        targetHeight = maxPrintableHeight
        targetWidth = targetWidth * shrinkFactor
      }

      const posX = (pageWidth - targetWidth) / 2
      const posY = margin

      pdf.addImage(imgData, 'PNG', posX, posY, targetWidth, targetHeight, undefined, 'FAST')
      const sanitizedBillId = billId.replace(/[^a-zA-Z0-9_-]/g, '_')
      pdf.save(`CapsicCare-CashMemo-${sanitizedBillId}.pdf`)
    } catch (err) {
      console.error('Failed to generate high-resolution PDF, falling back to print dialog:', err)
      handlePrint()
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const downloadHighResImage = async () => {
    const rootEl = document.getElementById('outpatient-cash-memo-print-root')
    if (!rootEl) return

    try {
      setIsGeneratingImage(true)
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(rootEl, {
        scale: 3, // 300 DPI ultra-high-definition
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('outpatient-cash-memo-print-root')
          if (el) {
            el.style.width = '800px'
            el.style.minWidth = '800px'
            el.style.maxWidth = '800px'
            el.style.padding = '20px 24px'
            el.style.boxSizing = 'border-box'
            el.style.background = '#ffffff'
            el.style.borderRadius = '0'
            el.style.boxShadow = 'none'
            el.style.border = '1px solid #0f172a'
            el.style.color = '#0f172a'
            ;(el.style as any).webkitFontSmoothing = 'antialiased'
            ;(el.style as any).textRendering = 'geometricPrecision'

            const headerRow = el.querySelector('.memo-header-container') as HTMLElement
            if (headerRow) {
              headerRow.style.display = 'flex'
              headerRow.style.flexDirection = 'row'
              headerRow.style.justifyContent = 'space-between'
              headerRow.style.alignItems = 'center'
            }

            const metaGrid = el.querySelector('.memo-meta-grid') as HTMLElement
            if (metaGrid) {
              metaGrid.style.display = 'grid'
              metaGrid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))'
            }

            const summaryGrid = el.querySelector('.memo-summary-grid') as HTMLElement
            if (summaryGrid) {
              summaryGrid.style.display = 'grid'
              summaryGrid.style.gridTemplateColumns = '1.15fr 1.05fr'
            }

            const offerBox = el.querySelector('.memo-offer-box') as HTMLElement
            if (offerBox) {
              offerBox.style.display = 'flex'
              offerBox.style.flexDirection = 'row'
              offerBox.style.justifyContent = 'space-between'
              offerBox.style.alignItems = 'center'
            }

            const stampRow = el.querySelector('.memo-stamp-row') as HTMLElement
            if (stampRow) {
              stampRow.style.display = 'flex'
              stampRow.style.flexDirection = 'row'
              stampRow.style.justifyContent = 'space-between'
              stampRow.style.alignItems = 'center'
            }

            const footerBar = el.querySelector('.memo-footer-bar') as HTMLElement
            if (footerBar) {
              footerBar.style.display = 'flex'
              footerBar.style.flexDirection = 'row'
              footerBar.style.justifyContent = 'space-between'
              footerBar.style.alignItems = 'center'
            }
          }
        },
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const sanitizedBillId = billId.replace(/[^a-zA-Z0-9_-]/g, '_')
      const link = document.createElement('a')
      link.download = `CapsicCare-CashMemo-${sanitizedBillId}.png`
      link.href = imgData
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to download high-resolution image:', err)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handlePrint = () => {
    const printElement = document.getElementById('outpatient-cash-memo-print-root')
    if (!printElement) {
      window.print()
      return
    }

    const existingIframe = document.getElementById('cash-memo-print-frame')
    if (existingIframe) {
      existingIframe.remove()
    }

    const iframe = document.createElement('iframe')
    iframe.id = 'cash-memo-print-frame'
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '800px'
    iframe.style.height = '1130px'
    iframe.style.border = '0'
    iframe.style.opacity = '0'
    iframe.style.pointerEvents = 'none'
    iframe.style.zIndex = '-9999'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) {
      window.print()
      return
    }

    const itemsRowsHtml = data.items.length > 0
      ? data.items
          .map((item) => {
            const itemDate = item.date || currentDateStr
            const qty = item.qty || 1
            const stdPrice = item.mrp && item.mrp >= item.price ? item.mrp : item.price
            const discountPct = stdPrice > item.price ? Math.round(((stdPrice - item.price) / stdPrice) * 100) : 0
            const discountAmountVal = (stdPrice - item.price) * qty
            const itemTotal = (item.price * qty).toFixed(2)

            return `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; border-right: 1px solid #0f172a;">${itemDate} - ${item.name}</td>
                <td style="padding: 5px 8px; border-right: 1px solid #0f172a; text-align: center;">${qty}</td>
                <td style="padding: 5px 8px; border-right: 1px solid #0f172a; text-align: right;">₹${(stdPrice * qty).toFixed(2)}</td>
                <td style="padding: 5px 8px; border-right: 1px solid #0f172a; text-align: center; color: #006837; font-weight: 600;">
                  ${discountPct > 0 ? `${discountPct}% (-₹${discountAmountVal.toFixed(0)})` : '-'}
                </td>
                <td style="padding: 5px 8px; text-align: right; font-weight: 700;">₹${itemTotal}</td>
              </tr>
            `
          })
          .join('')
      : `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td colspan="5" style="padding: 10px 8px; text-align: center; color: #64748b; font-style: italic;">
              No investigations listed
            </td>
          </tr>
        `

    const homeCollectionRowHtml = isHomeColEnabled
      ? `
        <tr style="border-bottom: 1px solid #e2e8f0; background: #f0fdf4;">
          <td style="padding: 5px 8px; border-right: 1px solid #0f172a; font-weight: 600; color: #006837;">
            🏠 Home Sample Collection
          </td>
          <td style="padding: 5px 8px; border-right: 1px solid #0f172a; text-align: center;">1</td>
          <td style="padding: 5px 8px; border-right: 1px solid #0f172a; text-align: right;">₹${homeColStandard.toFixed(2)}</td>
          <td style="padding: 5px 8px; border-right: 1px solid #0f172a; text-align: center; color: #006837; font-weight: 600;">
            ${homeColDiscountPct > 0 ? `${homeColDiscountPct}% (-₹${homeColSavings.toFixed(0)})` : '0%'}
          </td>
          <td style="padding: 5px 8px; text-align: right; font-weight: 700; color: #006837;">₹${homeColFinal.toFixed(2)}</td>
        </tr>
      `
      : ''

    const discountRowHtml = manualDiscount > 0
      ? `
        <tr style="border-top: 1px solid #cbd5e1; font-weight: 600; color: #006837;">
          <td colspan="4" style="padding: 4px 8px; text-align: right; border-right: 1px solid #0f172a;">${discountLabel}</td>
          <td style="padding: 4px 8px; text-align: right;">-₹${manualDiscount.toFixed(2)}</td>
        </tr>
      `
      : ''

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Capsic Care - Outpatient Cash Memo ${billId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
              text-rendering: geometricPrecision !important;
            }
            img {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #0f172a;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 11px;
              line-height: 1.35;
              -webkit-font-smoothing: antialiased;
            }
            .memo-wrapper {
              width: 100%;
              max-width: 100%;
              background: #ffffff;
              border: 1px solid #0f172a;
              padding: 16px 20px;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 8px;
            }
            .logo-wrap {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 900;
              color: #006837;
              margin: 0;
              line-height: 1.1;
            }
            .brand-sub {
              font-size: 10px;
              font-weight: 600;
              color: #475569;
              margin: 2px 0 0 0;
            }
            .header-contacts {
              text-align: right;
              font-size: 10px;
              color: #334155;
              line-height: 1.4;
            }
            .bar-teal {
              height: 3px;
              background: #006837;
              width: 100%;
              margin-bottom: 8px;
            }
            .memo-title-box {
              border-top: 2px solid #0f172a;
              border-bottom: 2px solid #0f172a;
              padding: 4px 0;
              text-align: center;
              margin-bottom: 8px;
            }
            .memo-title {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0;
            }
            .meta-grid {
              border: 1px solid #0f172a;
              padding: 6px 10px;
              margin-bottom: 8px;
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 3px 12px;
              font-size: 10.5px;
            }
            .table-container {
              border: 1px solid #0f172a;
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10.5px;
            }
            th {
              background: #f8fafc;
              border-bottom: 1px solid #0f172a;
              padding: 5px 8px;
              font-weight: 700;
              text-align: left;
            }
            .summary-box {
              border: 1px solid #0f172a;
              display: grid;
              grid-template-columns: 1.15fr 1.05fr;
              margin-bottom: 8px;
              font-size: 10.5px;
            }
            .words-box {
              padding: 6px 10px;
              border-right: 1px solid #0f172a;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              font-weight: 700;
              color: #1e293b;
            }
            .savings-badge {
              background: #e6f4ea;
              border: 1px solid #006837;
              color: #006837;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 800;
              margin-top: 6px;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 7px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 900;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .status-paid {
              background: #e6f4ea;
              color: #006837;
              border: 1px solid #006837;
            }
            .status-partially-paid {
              background: #fef3c7;
              color: #b45309;
              border: 1px solid #b45309;
            }
            .status-unpaid {
              background: #fee2e2;
              color: #b91c1c;
              border: 1px solid #b91c1c;
            }
            .calc-table {
              display: flex;
              flex-direction: column;
            }
            .calc-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 3px 10px;
              border-bottom: 1px solid #0f172a;
            }
            .calc-item:last-child {
              border-bottom: none;
              font-weight: 900;
              background: #f8fafc;
            }
            .stamp-row {
              display: flex;
              justify-content: space-between;
              font-size: 9.5px;
              color: #475569;
              margin-bottom: 10px;
            }
            .footer-bar {
              border-top: 2px solid #006837;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9.5px;
              color: #334155;
            }
          </style>
        </head>
        <body>
          <div class="memo-wrapper">
            <!-- Header -->
            <div class="header-row">
              <div class="logo-wrap">
                <img src="/logo.png" style="width: 46px; height: 46px; object-fit: contain;" alt="Logo" />
                <div>
                  <h1 class="brand-title">CAPSIC CARE</h1>
                  <p class="brand-sub">From Care to Cure with you at every step</p>
                </div>
              </div>
              <div class="header-contacts">
                <div>📞 +91 8910260709</div>
                <div>✉ capsiccare@gmail.com</div>
                <div>🌐 www.capsic.in</div>
              </div>
            </div>

            <div class="bar-teal"></div>

            <!-- Title -->
            <div class="memo-title-box">
              <h2 class="memo-title">Outpatient Cash Memo</h2>
            </div>

            <!-- Meta Grid -->
            <div class="meta-grid">
              <div><strong>Bill Id:</strong> ${billId}</div>
              <div><strong>Patient Name:</strong> ${data.patientName || '-'}</div>
              <div><strong>Patient Id:</strong> ${patientId}</div>
              <div><strong>Age:</strong> ${data.age ? `${data.age} Year(s)` : '-'} ${data.gender || ''}</div>
              <div><strong>M No:</strong> ${data.phone || '-'}</div>
              <div><strong>Category:</strong> ${data.category || 'PATHOLOGY'}</div>
              <div><strong>Bill Date:</strong> ${currentDateStr}</div>
              <div><strong>Mode of Payment:</strong> ${paymentMode}</div>
              <div>
                <strong>Payment Status:</strong>
                <span class="status-badge ${
                  paymentStatus === 'PAID'
                    ? 'status-paid'
                    : paymentStatus === 'PARTIALLY PAID'
                    ? 'status-partially-paid'
                    : 'status-unpaid'
                }">${paymentStatus}</span>
              </div>
              <div style="grid-column: span 3;"><strong>Account:</strong> ${accountStaff}</div>
            </div>

            <!-- Investigation Items Table -->
            <div class="table-container">
              <table>
                <thead>
                  <tr style="background: #f8fafc; font-weight: bold;">
                    <th style="padding: 5px 8px; border-right: 1px solid #0f172a;">Description / Service</th>
                    <th style="padding: 5px 8px; border-right: 1px solid #0f172a; width: 40px; text-align: center;">Qty</th>
                    <th style="padding: 5px 8px; border-right: 1px solid #0f172a; width: 90px; text-align: right;">Standard Price</th>
                    <th style="padding: 5px 8px; border-right: 1px solid #0f172a; width: 110px; text-align: center;">Discount</th>
                    <th style="padding: 5px 8px; width: 85px; text-align: right;">Final Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background: #f1f5f9; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
                    <td colspan="5" style="padding: 3px 8px; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">
                      ${data.category || 'PATHOLOGY'} & INVESTIGATIONS
                    </td>
                  </tr>
                  ${itemsRowsHtml}
                  ${homeCollectionRowHtml}
                  <tr style="border-top: 1px solid #0f172a; font-weight: bold; background: #f8fafc;">
                    <td colspan="2" style="padding: 5px 8px; border-right: 1px solid #0f172a;">Total Bill Amount</td>
                    <td style="padding: 5px 8px; text-align: right; border-right: 1px solid #0f172a;">₹${totalBillAmount.toFixed(2)}</td>
                    <td style="padding: 5px 8px; text-align: center; border-right: 1px solid #0f172a; color: #006837;">Savings: ₹${totalSavings.toFixed(2)}</td>
                    <td style="padding: 5px 8px; text-align: right; font-size: 11.5px;">₹${grandTotal.toFixed(2)}</td>
                  </tr>
                  ${discountRowHtml}
                </tbody>
              </table>
            </div>

            <!-- Net Calculation Box -->
            <div class="summary-box">
              <div class="words-box">
                <div>
                  <span style="font-size: 9.5px; color: #64748b; text-transform: uppercase;">Amount in Words:</span><br/>
                  <span style="font-style: italic; color: #0f172a;">${amountInWords}</span>
                </div>
                <div>
                  ${totalSavings > 0 ? `<div class="savings-badge">🎉 Total Savings on this Bill: ₹${totalSavings.toFixed(0)}</div>` : ''}
                  <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 5px;">
                    <span style="font-size: 9.5px; color: #475569; font-weight: 700; text-transform: uppercase;">Payment Status:</span>
                    <span class="status-badge ${
                      paymentStatus === 'PAID'
                        ? 'status-paid'
                        : paymentStatus === 'PARTIALLY PAID'
                        ? 'status-partially-paid'
                        : 'status-unpaid'
                    }">${paymentStatus}</span>
                  </div>
                </div>
              </div>
              <div class="calc-table">
                <div class="calc-item"><span>Total Bill Amount</span><span>₹${totalBillAmount.toFixed(2)}</span></div>
                <div class="calc-item" style="color: #006837;"><span>Total Savings / Discount</span><span>-₹${totalSavings.toFixed(2)}</span></div>
                <div class="calc-item" style="background: #f8fafc;"><span><strong>Final Amount Payable</strong></span><strong>₹${grandTotal.toFixed(2)}</strong></div>
                <div class="calc-item"><span>Amount Paid</span><span>₹${amountPaid.toFixed(2)}</span></div>
                <div class="calc-item" style="${balanceDue > 0 ? 'color: #b91c1c;' : ''}"><span><strong>Balance Due</strong></span><strong>₹${balanceDue.toFixed(2)}</strong></div>
                <div class="calc-item" style="background: #f8fafc;">
                  <span><strong>Payment Status</strong></span>
                  <span class="status-badge ${
                    paymentStatus === 'PAID'
                      ? 'status-paid'
                      : paymentStatus === 'PARTIALLY PAID'
                      ? 'status-partially-paid'
                      : 'status-unpaid'
                  }">${paymentStatus}</span>
                </div>
              </div>
            </div>

            <!-- Review & Referral Promotion Banner (Only if showReviewReferralOffer !== false) -->
            ${data.showReviewReferralOffer !== false ? `
              <div style="border: 1px dashed #006837; background: #f0fdf4; padding: 6px 12px; margin-bottom: 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800; font-size: 10.5px; color: #006837; letter-spacing: 0.3px;">
                    ⭐ SPECIAL OFFER: EXTRA 10% OFF ON GOOGLE REVIEW &amp; REFERRAL
                  </div>
                  <div style="font-size: 9.5px; color: #334155; margin-top: 2px;">
                    ${data.reviewOfferNote || 'Share your feedback on Google &amp; refer a family member or friend to claim an extra 10% instant discount on your bill!'}
                  </div>
                </div>
                <div style="text-align: right; padding-left: 12px; border-left: 1px dashed #86efac; white-space: nowrap;">
                  <div style="font-size: 8.5px; font-weight: 700; color: #475569; text-transform: uppercase;">Helpdesk &amp; WhatsApp</div>
                  <div style="font-size: 11px; font-weight: 900; color: #006837;">+91 8910260709</div>
                </div>
              </div>
            ` : ''}

            <!-- Signatures -->
            <div class="stamp-row">
              <div>
                <div><strong>Printed By:</strong> ${accountStaff}</div>
                <div><strong>Printed On:</strong> ${printedTime}</div>
              </div>
              <div style="text-align: right;">
                <div><strong>Created By:</strong> ${accountStaff}</div>
                <div><strong>Created On:</strong> ${printedTime}</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer-bar">
              <div>
                <strong>📍 Bankra Bazar, Dewan Para Rd, Domjur, Howrah - 711403</strong>
              </div>
              <div style="text-align: center;">
                <strong>Follow Us:</strong> Facebook • Instagram • YouTube
              </div>
              <div style="text-align: right;">
                <strong style="color: #006837;">CAPSIC CARE DIAGNOSTICS</strong>
              </div>
            </div>

          </div>
        </body>
      </html>
    `)
    doc.close()

    const triggerIframePrint = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch (err) {
        console.error('Print iframe error:', err)
      } finally {
        setTimeout(() => {
          iframe.remove()
        }, 2000)
      }
    }

    const imgEl = doc.querySelector('img')
    if (imgEl && !imgEl.complete) {
      imgEl.onload = () => setTimeout(triggerIframePrint, 250)
      imgEl.onerror = () => setTimeout(triggerIframePrint, 250)
    } else {
      setTimeout(triggerIframePrint, 350)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 print:m-0 print:p-0">
      {/* Actions Bar (Hidden in Print) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-slate-900 text-white rounded-2xl print:hidden shadow-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Outpatient Cash Memo</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Ultra-HD 300 DPI
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Official Capsic Care Diagnostic Receipt • {billId}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-download-pdf-invoice"
              onClick={downloadHighResPDF}
              disabled={isGeneratingPdf || isGeneratingImage}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Download Ultra-Clear A4 PDF (300+ DPI)"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={15} className="animate-spin text-white" />
                  <span>Generating Sharp PDF...</span>
                </>
              ) : (
                <>
                  <FileDown size={15} />
                  <span>Download Clear PDF</span>
                </>
              )}
            </button>

            <button
              id="btn-download-image-invoice"
              onClick={downloadHighResImage}
              disabled={isGeneratingPdf || isGeneratingImage}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Download High-Resolution PNG for WhatsApp sharing"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 size={15} className="animate-spin text-teal-300" />
                  <span>Generating HD...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>HD Image (WhatsApp)</span>
                </>
              )}
            </button>

            <button
              id="btn-print-invoice"
              onClick={handlePrint}
              disabled={isGeneratingPdf || isGeneratingImage}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
              title="Open browser print dialog"
            >
              <Printer size={15} />
              <span>Print Memo</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cash Memo Paper Sheet on Screen */}
      <div
        id="outpatient-cash-memo-print-root"
        className="bg-white text-slate-900 border border-slate-300 shadow-xl rounded-lg p-6 sm:p-8 font-sans print:shadow-none print:border-none print:p-4 print:m-0 print:w-full print:rounded-none"
      >
        {/* Top Header */}
        <div className="memo-header-container flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative shrink-0">
              <Image
                src="/logo.png"
                alt="Capsic Care Logo"
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#006837]">
                  CAPSIC CARE
                </span>
              </div>
              <p className="text-[10.5px] font-semibold text-slate-600 tracking-wide">
                From Care to Cure with you at every step
              </p>
            </div>
          </div>

          <div className="text-right text-[10.5px] space-y-0.5 text-slate-700 shrink-0 self-end sm:self-auto">
            <div className="flex items-center justify-end gap-1.5 font-medium">
              <Phone size={12} className="text-[#006837]" /> +91 8910260709
            </div>
            <div className="flex items-center justify-end gap-1.5 font-medium">
              <Mail size={12} className="text-[#006837]" /> capsiccare@gmail.com
            </div>
            <div className="flex items-center justify-end gap-1.5 font-medium">
              <Globe size={12} className="text-[#006837]" /> www.capsic.in
            </div>
          </div>
        </div>

        {/* Teal Header Line */}
        <div className="h-0.5 bg-[#006837] w-full mb-2.5" />

        {/* Title Bar */}
        <div className="border-t-2 border-b-2 border-slate-800 py-1 text-center mb-3">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
            Outpatient Cash Memo
          </h2>
        </div>

        {/* Patient & Bill Information Meta Grid */}
        <div className="memo-meta-grid border border-slate-800 p-2.5 mb-3 text-[11px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4">
            <div>
              <span className="font-bold text-slate-900">Bill Id:</span>{' '}
              <span className="font-semibold text-slate-800">{billId}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Patient Name:</span>{' '}
              <span className="font-semibold text-slate-800">{data.patientName || '-'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Patient Id:</span>{' '}
              <span className="font-semibold text-slate-800">{patientId}</span>
            </div>

            <div>
              <span className="font-bold text-slate-900">Age:</span>{' '}
              <span className="font-semibold text-slate-800">
                {data.age ? `${data.age} Year(s)` : '-'} {data.gender || ''}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900">M No:</span>{' '}
              <span className="font-semibold text-slate-800">{data.phone || '-'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Category:</span>{' '}
              <span className="font-semibold text-slate-800">{data.category || 'PATHOLOGY'}</span>
            </div>

            <div>
              <span className="font-bold text-slate-900">Bill Date:</span>{' '}
              <span className="font-semibold text-slate-800">{currentDateStr}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Mode of Payment:</span>{' '}
              <span className="font-semibold text-slate-800">{paymentMode}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Payment Status:</span>{' '}
              <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                  : paymentStatus === 'PARTIALLY PAID'
                  ? 'bg-amber-100 text-amber-800 border border-amber-400'
                  : 'bg-red-100 text-red-800 border border-red-400'
              }`}>
                {paymentStatus}
              </span>
            </div>

            <div className="sm:col-span-3">
              <span className="font-bold text-slate-900">Account:</span>{' '}
              <span className="font-semibold text-slate-800">{accountStaff}</span>
            </div>
          </div>
        </div>

        {/* Pathology Items Table */}
        <div className="border border-slate-800 mb-3 overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-50 font-bold">
                <th className="p-1.5 border-r border-slate-800">Description / Service</th>
                <th className="p-1.5 border-r border-slate-800 w-12 text-center">Qty</th>
                <th className="p-1.5 border-r border-slate-800 w-24 text-right">Standard Price</th>
                <th className="p-1.5 border-r border-slate-800 w-28 text-center">Discount</th>
                <th className="p-1.5 w-24 text-right">Final Price</th>
              </tr>
            </thead>
            <tbody>
              {/* Category Header Row */}
              <tr className="border-b border-slate-300 font-bold bg-slate-100/60">
                <td colSpan={5} className="p-1 uppercase text-[10px] tracking-wider text-slate-800">
                  {data.category || 'PATHOLOGY'} & INVESTIGATIONS
                </td>
              </tr>

              {/* Items Rows */}
              {data.items.length > 0 ? (
                data.items.map((item, idx) => {
                  const itemDate = item.date || currentDateStr
                  const qty = item.qty || 1
                  const stdPrice = item.mrp && item.mrp >= item.price ? item.mrp : item.price
                  const discountPct = stdPrice > item.price ? Math.round(((stdPrice - item.price) / stdPrice) * 100) : 0
                  const discountAmountVal = (stdPrice - item.price) * qty
                  const totalItem = (item.price * qty).toFixed(2)
                  return (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-1.5 border-r border-slate-800">
                        {itemDate} - {item.name}
                      </td>
                      <td className="p-1.5 border-r border-slate-800 text-center font-medium">
                        {qty}
                      </td>
                      <td className="p-1.5 border-r border-slate-800 text-right text-slate-600 font-medium">
                        ₹{(stdPrice * qty).toFixed(2)}
                      </td>
                      <td className="p-1.5 border-r border-slate-800 text-center font-semibold text-[#006837]">
                        {discountPct > 0 ? `${discountPct}% (-₹${discountAmountVal.toFixed(0)})` : '-'}
                      </td>
                      <td className="p-1.5 text-right font-bold text-slate-900">
                        ₹{totalItem}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr className="border-b border-slate-200">
                  <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                    No investigations added to this cash memo yet.
                  </td>
                </tr>
              )}

              {/* Home Collection Row */}
              {isHomeColEnabled && (
                <tr className="border-b border-slate-300 font-medium bg-emerald-50/50">
                  <td className="p-1.5 border-r border-slate-800 font-bold text-[#006837]">
                    🏠 Home Sample Collection
                  </td>
                  <td className="p-1.5 border-r border-slate-800 text-center font-medium">1</td>
                  <td className="p-1.5 border-r border-slate-800 text-right text-slate-600">
                    ₹{homeColStandard.toFixed(2)}
                  </td>
                  <td className="p-1.5 border-r border-slate-800 text-center font-bold text-[#006837]">
                    {homeColDiscountPct > 0 ? `${homeColDiscountPct}% (-₹${homeColSavings.toFixed(0)})` : '0%'}
                  </td>
                  <td className="p-1.5 text-right font-bold text-[#006837]">
                    ₹{homeColFinal.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Standard Subtotal Row */}
              <tr className="border-t border-slate-800 font-bold bg-slate-50">
                <td colSpan={2} className="p-1.5 text-left border-r border-slate-800 text-slate-800">
                  Total Bill Amount
                </td>
                <td className="p-1.5 text-right border-r border-slate-800">
                  ₹{totalBillAmount.toFixed(2)}
                </td>
                <td className="p-1.5 text-center border-r border-slate-800 text-[#006837]">
                  Total Savings: ₹{totalSavings.toFixed(2)}
                </td>
                <td className="p-1.5 text-right font-black">
                  ₹{grandTotal.toFixed(2)}
                </td>
              </tr>

              {/* Discount Row (if any) */}
              {manualDiscount > 0 && (
                <tr className="border-t border-slate-300 font-medium text-slate-700">
                  <td colSpan={4} className="p-1 text-right border-r border-slate-800">
                    {discountLabel}
                  </td>
                  <td className="p-1 text-right text-green-700 font-semibold">
                    -₹{manualDiscount.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Net Calculation Summary Box */}
        <div className="memo-summary-box border border-slate-800 mb-4 text-[11px]">
          <div className="memo-summary-grid grid grid-cols-1 sm:grid-cols-2">
            <div className="p-2.5 border-b sm:border-b-0 sm:border-r border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Amount in Words:</span>
                <span className="font-bold text-slate-900 italic">{amountInWords}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {totalSavings > 0 && (
                  <div className="p-1.5 bg-emerald-50 border border-[#006837] rounded text-emerald-800 font-bold text-[11px]">
                    🎉 Customer Total Savings on this Bill: ₹{totalSavings.toFixed(0)}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-600">Payment Status:</span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-black tracking-wider ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-500'
                      : paymentStatus === 'PARTIALLY PAID'
                      ? 'bg-amber-100 text-amber-800 border border-amber-500'
                      : 'bg-red-100 text-red-800 border border-red-500'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-800 text-right">
              <div className="p-1 px-2.5 flex justify-between">
                <span className="font-bold text-slate-700">Total Bill Amount</span>
                <span className="font-semibold text-slate-600">₹{totalBillAmount.toFixed(2)}</span>
              </div>
              <div className="p-1 px-2.5 flex justify-between text-[#006837]">
                <span className="font-bold">Total Savings / Discount</span>
                <span className="font-bold">-₹{totalSavings.toFixed(2)}</span>
              </div>
              <div className="p-1 px-2.5 flex justify-between bg-slate-50 font-black">
                <span className="font-bold text-slate-900">Final Amount Payable</span>
                <span className="text-xs">₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="p-1 px-2.5 flex justify-between">
                <span className="font-bold text-slate-900">Amount Paid</span>
                <span className="font-bold">₹{amountPaid.toFixed(2)}</span>
              </div>
              <div className={`p-1 px-2.5 flex justify-between ${balanceDue > 0 ? 'bg-red-50/70' : ''}`}>
                <span className="font-bold text-slate-900">Balance Due</span>
                <span className={`font-black ${balanceDue > 0 ? 'text-red-700' : 'text-slate-900'}`}>
                  ₹{balanceDue.toFixed(2)}
                </span>
              </div>
              <div className="p-1 px-2.5 flex justify-between items-center bg-slate-50">
                <span className="font-bold text-slate-900">Payment Status</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-black tracking-wider ${
                  paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : paymentStatus === 'PARTIALLY PAID'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Review & Referral Offer Box */}
        {data.showReviewReferralOffer !== false && (
          <div className="memo-offer-box border border-dashed border-[#006837] bg-emerald-50/70 dark:bg-emerald-950/20 p-2.5 px-3.5 mb-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px]">
            <div>
              <div className="font-extrabold text-[#006837] dark:text-emerald-400 flex items-center gap-1.5">
                <span>⭐</span>
                <span>SPECIAL OFFER: EXTRA 10% OFF ON GOOGLE REVIEW &amp; REFERRAL</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5">
                {data.reviewOfferNote || 'Share your feedback on Google & refer a family member or friend to claim an extra 10% instant discount on your bill!'}
              </p>
            </div>
            <div className="text-right shrink-0 border-t sm:border-t-0 sm:border-l border-emerald-300 dark:border-emerald-800 pt-1 sm:pt-0 sm:pl-3">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Helpdesk / WhatsApp</span>
              <span className="font-black text-[#006837] dark:text-emerald-400 text-xs">+91 8910260709</span>
            </div>
          </div>
        )}

        {/* Signatures & Timestamps */}
        <div className="memo-stamp-row flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-700 pt-1 mb-5 gap-2">
          <div>
            <p><span className="font-bold text-slate-900">Printed By:</span> {accountStaff}</p>
            <p><span className="font-bold text-slate-900">Printed On:</span> {printedTime}</p>
          </div>
          <div className="sm:text-right">
            <p><span className="font-bold text-slate-900">Created By:</span> {accountStaff}</p>
            <p><span className="font-bold text-slate-900">Created On:</span> {printedTime}</p>
          </div>
        </div>

        {/* Bottom Banner with Address & Social Handles */}
        <div className="memo-footer-bar border-t-2 border-[#006837] pt-2.5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10.5px]">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <MapPin size={16} className="text-[#006837] shrink-0" />
            <div>
              <p>Bankra Bazar, Dewan Para Rd, Domjur, Howrah - 711403</p>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[9.5px] font-bold tracking-wider text-slate-500 uppercase block">
              Follow Us: Facebook • Instagram • YouTube
            </span>
          </div>

          <div className="text-right text-[10.5px] text-slate-600 font-medium">
            <p className="font-bold text-[#006837]">CAPSIC CARE DIAGNOSTICS</p>
          </div>
        </div>

      </div>
    </div>
  )
}
