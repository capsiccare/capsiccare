'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { OutpatientCashMemo, CashMemoData, CashMemoItem } from '@/components/outpatient-cash-memo'
import { FileText, Plus, Trash2, Search, Printer, ArrowLeft, Tag, Check, Sparkles, Home, Percent, CreditCard, Receipt, RotateCcw, TrendingUp, Star, FileDown, Download } from 'lucide-react'
import Link from 'next/link'

interface AvailableTest {
  id: string
  name: string
  price: number
  basePrice?: number
  mrp?: number
  category?: string
  sampleType?: string
  type?: string
}

const POPULAR_QUICK_TESTS = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile (T3, T4, TSH)',
  'HbA1c',
  'Fasting Blood Sugar (FBS)',
  'Vitamin D3 (25 - Oh)',
  'Vitamin B12',
  'Urine Routine Examination',
  'Serum Creatinine',
  'Dengue Elisa Ns1 Antigen',
]

function InvoiceModuleContent() {
  const searchParams = useSearchParams()

  // Tests Catalog state
  const [catalog, setCatalog] = useState<AvailableTest[]>([])
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)
  const [testSearch, setTestSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Helper for today's date formatted as DD-MM-YYYY
  const getTodayFormattedDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Form State
  const [patientName, setPatientName] = useState(searchParams.get('name') || '')
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [age, setAge] = useState(searchParams.get('age') || '')
  const [gender, setGender] = useState(searchParams.get('gender') || 'Male')
  const [category, setCategory] = useState(searchParams.get('category') || 'PATHOLOGY')
  const [billDate, setBillDate] = useState(searchParams.get('billDate') || getTodayFormattedDate())
  const [modeOfPayment, setModeOfPayment] = useState(searchParams.get('paymentMode') || 'Cash')
  const [accountName, setAccountName] = useState(searchParams.get('accountName') || '')

  // Advance / Amount Paid State
  const [amountPaid, setAmountPaid] = useState<string>(searchParams.get('amountPaid') || '')

  // Home Sample Collection State
  const [homeCollectionEnabled, setHomeCollectionEnabled] = useState(false)
  const [homeCollectionBaseCharge, setHomeCollectionBaseCharge] = useState(150)
  const [homeCollectionDiscountPct, setHomeCollectionDiscountPct] = useState(0)

  // Additional Manual / Review Discount
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountLabel, setDiscountLabel] = useState('Additional Discount')

  // 10% Review Margin & Offer Controls (Default true: 10% added on all tests first)
  const [autoApplyMargin, setAutoApplyMargin] = useState(true)
  const [showReviewOffer, setShowReviewOffer] = useState(true)

  // Selected Items State
  const [items, setItems] = useState<CashMemoItem[]>([])

  // Custom Item Inputs
  const [customTestName, setCustomTestName] = useState('')
  const [customTestPrice, setCustomTestPrice] = useState('')
  const [customTestMrp, setCustomTestMrp] = useState('')

  // Load all tests from API - Add 10% review buffer to all tests FIRST!
  useEffect(() => {
    setIsLoadingCatalog(true)
    fetch('/api/all-tests')
      .then((res) => res.json())
      .then((data) => {
        let rawList: AvailableTest[] = []
        if (data.all && Array.isArray(data.all)) {
          rawList = data.all
        } else if (data.tests && Array.isArray(data.tests)) {
          rawList = [...data.tests, ...(data.packages || [])]
        }

        // All tests and packages now naturally include the 10% increase across all pages, bills & slugs
        const catalogList = rawList.map((t) => {
          const payable = t.price || 0
          const mrpVal = t.mrp && t.mrp >= payable ? t.mrp : Math.max(t.mrp || 0, payable * 2)
          const base = Math.round(payable / 1.1)
          return {
            ...t,
            basePrice: base,
            price: payable, // 10% increased payable price
            mrp: mrpVal, // 10% increased bill amount
          }
        })

        setCatalog(catalogList)
      })
      .catch((err) => console.error('Failed to load tests for invoice:', err))
      .finally(() => setIsLoadingCatalog(false))
  }, [])

  // Filter tests in real-time
  const searchResults = testSearch.trim()
    ? catalog
        .filter((t) => {
          const query = testSearch.toLowerCase()
          return (
            t.name.toLowerCase().includes(query) ||
            t.category?.toLowerCase().includes(query) ||
            t.id.toLowerCase().includes(query)
          )
        })
        .slice(0, 15)
    : []

  const addTestFromCatalog = (test: AvailableTest) => {
    const base = test.basePrice !== undefined ? test.basePrice : Math.round(test.price / 1.1)
    const initialPrice = autoApplyMargin ? test.price : base
    setItems((prev) => [
      ...prev,
      {
        id: test.id,
        name: test.name,
        price: initialPrice,
        basePrice: base,
        isMarginApplied: autoApplyMargin,
        mrp: test.mrp || (base * 2),
        qty: 1,
        date: billDate,
      },
    ])
    setTestSearch('')
    setIsSearching(false)
  }

  const addPopularTest = (testName: string) => {
    const ALIAS_MAP: Record<string, string[]> = {
      'Complete Blood Count (CBC)': ['cbc', 'complete blood count'],
      'Lipid Profile': ['lipid profile'],
      'Liver Function Test (LFT)': ['lft', 'liver function test'],
      'Kidney Function Test (KFT)': ['kft', 'kidney function test'],
      'Thyroid Profile (T3, T4, TSH)': ['thyroid profile'],
      'HbA1c': ['hba1c', 'glycosylated'],
      'Fasting Blood Sugar (FBS)': ['glucose fasting', 'fasting blood sugar'],
      'Vitamin D3 (25 - Oh)': ['vitamin d3', '25 - oh'],
      'Vitamin B12': ['vitamin b12'],
      'Urine Routine Examination': ['urine routine'],
      'Serum Creatinine': ['creatinine (serum)', 'serum creatinine', 'creatinine'],
      'Dengue Elisa Ns1 Antigen': ['dengue'],
    }

    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const searchNorm = norm(testName)

    let found = catalog.find((t) => {
      const tNorm = norm(t.name)
      return t.name.toLowerCase().trim() === testName.toLowerCase().trim() || tNorm === searchNorm
    })

    if (!found) {
      const aliases = ALIAS_MAP[testName] || [testName]
      found = catalog.find((t) => {
        const tLower = t.name.toLowerCase()
        return aliases.some((alias) => tLower.includes(alias.toLowerCase()))
      })
    }

    if (!found) {
      found = catalog.find((t) => {
        const tNorm = norm(t.name)
        return (searchNorm.length >= 3 && tNorm.includes(searchNorm)) || (tNorm.length >= 3 && searchNorm.includes(tNorm))
      })
    }

    if (found) {
      addTestFromCatalog(found)
    } else {
      console.warn(`Popular test "${testName}" not found in catalog.`)
    }
  }

  const addCustomItem = () => {
    if (!customTestName.trim() || !customTestPrice.trim()) return
    const rawVal = parseFloat(customTestPrice) || 0
    const base = rawVal
    // Add 10% on custom test first!
    const markedUp = Math.round(base * 1.1)
    const finalPrice = autoApplyMargin ? markedUp : base
    const mrpVal = parseFloat(customTestMrp) || (base * 2)
    setItems((prev) => [
      ...prev,
      {
        name: customTestName.trim(),
        price: finalPrice,
        basePrice: base,
        isMarginApplied: autoApplyMargin,
        mrp: mrpVal,
        qty: 1,
        date: billDate,
      },
    ])
    setCustomTestName('')
    setCustomTestPrice('')
    setCustomTestMrp('')
  }

  const updateQuantity = (index: number, delta: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newQty = Math.max(1, (item.qty || 1) + delta)
          return { ...item, qty: newQty }
        }
        return item
      })
    )
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Increase an individual test price by 10%
  const increaseItemPriceBy10 = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const base = item.basePrice !== undefined ? item.basePrice : Math.round(item.price / 1.1)
          const newPrice = Math.round(item.price * 1.1)
          return {
            ...item,
            basePrice: base,
            price: newPrice,
            isMarginApplied: true,
          }
        }
        return item
      })
    )
  }

  // Reset an item to its original catalog base price
  const resetItemPrice = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const base = item.basePrice !== undefined ? item.basePrice : Math.round(item.price / 1.1)
          return {
            ...item,
            price: base,
            isMarginApplied: false,
          }
        }
        return item
      })
    )
  }

  // Update item unit price directly
  const updateItemPrice = (index: number, newPrice: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const base = item.basePrice !== undefined ? item.basePrice : Math.round(newPrice / 1.1)
          return {
            ...item,
            basePrice: base,
            price: Math.max(0, newPrice),
            isMarginApplied: newPrice > base,
          }
        }
        return item
      })
    )
  }

  // Apply +10% review margin to all tests currently in bill
  const applyMarginToAllTests = () => {
    setItems((prev) =>
      prev.map((item) => {
        const base = item.basePrice !== undefined ? item.basePrice : Math.round(item.price / 1.1)
        return {
          ...item,
          basePrice: base,
          price: Math.round(item.price * 1.1),
          isMarginApplied: true,
        }
      })
    )
  }

  // Reset all tests in bill to their original catalog prices
  const resetAllTestsToBase = () => {
    setItems((prev) =>
      prev.map((item) => {
        const base = item.basePrice !== undefined ? item.basePrice : Math.round(item.price / 1.1)
        return {
          ...item,
          price: base,
          isMarginApplied: false,
        }
      })
    )
  }

  // Home Collection Calculations
  const homeColDiscountAmount = homeCollectionEnabled
    ? Math.round((homeCollectionBaseCharge * homeCollectionDiscountPct) / 100)
    : 0
  const homeColFinalCharge = homeCollectionEnabled
    ? Math.max(0, homeCollectionBaseCharge - homeColDiscountAmount)
    : 0
  const homeColStandard = homeCollectionEnabled ? homeCollectionBaseCharge : 0

  // Items and bill totals
  const itemsSubtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0)
  const itemsStandardSubtotal = items.reduce((s, i) => {
    const stdPrice = i.mrp && i.mrp >= i.price ? i.mrp : i.price
    return s + (stdPrice * (i.qty || 1))
  }, 0)

  // Total margin added across tests
  const totalMarginAdded = items.reduce((sum, item) => {
    const base = item.basePrice !== undefined ? item.basePrice : Math.round(item.price / 1.1)
    return sum + (item.price > base ? (item.price - base) * (item.qty || 1) : 0)
  }, 0)

  // Recommended review discount (either the exact margin added, or 10% of subtotal)
  const calculatedReviewDiscount = totalMarginAdded > 0 ? totalMarginAdded : Math.round(itemsSubtotal * 0.1)

  const isReviewDiscountActive = discountAmount > 0 && (discountAmount === calculatedReviewDiscount || discountLabel.includes('Review'))

  const toggleReviewDiscount = () => {
    if (isReviewDiscountActive) {
      setDiscountAmount(0)
      setDiscountLabel('Additional Discount')
    } else {
      setDiscountAmount(calculatedReviewDiscount)
      setDiscountLabel('Google Review & Referral Discount')
    }
  }

  const totalBillAmount = itemsStandardSubtotal + homeColStandard
  const finalAmountPayable = Math.max(0, itemsSubtotal + homeColFinalCharge - discountAmount)
  const totalSavings = Math.max(0, totalBillAmount - finalAmountPayable)

  // Real-time Advance / Amount Paid & Balance Due calculations
  const enteredAmountPaid = amountPaid.trim() === '' ? 0 : Math.max(0, parseFloat(amountPaid) || 0)
  const balanceDue = Math.max(0, finalAmountPayable - enteredAmountPaid)

  // Payment Status: PAID / PARTIALLY PAID / UNPAID
  const paymentStatus: 'PAID' | 'PARTIALLY PAID' | 'UNPAID' = (() => {
    if (finalAmountPayable === 0) return 'PAID'
    if (enteredAmountPaid >= finalAmountPayable) return 'PAID'
    if (enteredAmountPaid > 0) return 'PARTIALLY PAID'
    return 'UNPAID'
  })()

  const memoData: CashMemoData = {
    patientName,
    phone,
    age,
    gender,
    category,
    billDate,
    modeOfPayment,
    accountName,
    items,
    homeCollection: {
      enabled: homeCollectionEnabled,
      baseCharge: homeCollectionBaseCharge,
      discountPercent: homeCollectionDiscountPct,
      discountAmount: homeColDiscountAmount,
      finalCharge: homeColFinalCharge,
    },
    discountAmount,
    discountLabel,
    amountPaid: enteredAmountPaid,
    paymentStatus,
    showReviewReferralOffer: showReviewOffer,
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline mb-1"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileText className="text-teal-600" /> Outpatient Cash Memo Generator
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select tests & health packages with exact Standard Prices (MRPs), discount percentages, and Home Sample Collection to generate the official bill.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                const pdfBtn = document.getElementById('btn-download-pdf-invoice')
                if (pdfBtn) {
                  pdfBtn.click()
                } else {
                  window.print()
                }
              }}
              className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20 cursor-pointer"
              title="Download Ultra-Clear A4 PDF with 300+ DPI pixel density"
            >
              <FileDown size={17} /> Download Clear PDF
            </button>

            <button
              onClick={() => {
                const imgBtn = document.getElementById('btn-download-image-invoice')
                if (imgBtn) {
                  imgBtn.click()
                }
              }}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
              title="Download High-Resolution PNG for WhatsApp sharing"
            >
              <Download size={17} /> HD Image
            </button>

            <button
              onClick={() => {
                const printBtn = document.getElementById('btn-print-invoice')
                if (printBtn) {
                  printBtn.click()
                } else {
                  window.print()
                }
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer"
              title="Open hardware printer dialog"
            >
              <Printer size={17} /> Print Memo
            </button>
          </div>
        </div>

        {/* 2-Column Editor + Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Bill Configuration Editor (Hidden in Print) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 print:hidden">
            
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              1. Patient & Bill Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Patient Full Name"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 8910260709"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Bill Date
                </label>
                <input
                  type="text"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Age (Years)
                </label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Payment Mode
                </label>
                <select
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Staff / Account
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Billing Staff"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Advance / Amount Paid (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00 (Amount received)"
                    className="w-full pl-7 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Balance Due (₹)
                </label>
                <div
                  className={`px-3.5 py-2 rounded-xl text-sm font-black flex items-center justify-between border ${
                    balanceDue > 0
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  <span>₹{balanceDue.toFixed(2)}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-current">
                    {paymentStatus}
                  </span>
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div className="sm:col-span-2 pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
                  Quick Amount Presets:
                </span>
                <button
                  type="button"
                  onClick={() => setAmountPaid(String(finalAmountPayable))}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer shadow-sm"
                >
                  Full Paid: ₹{finalAmountPayable}
                </button>
                {calculatedReviewDiscount > 0 && !isReviewDiscountActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountAmount(calculatedReviewDiscount)
                      setDiscountLabel('Google Review & Referral Discount')
                      const payableAfter = Math.max(0, itemsSubtotal + homeColFinalCharge - calculatedReviewDiscount)
                      setAmountPaid(String(payableAfter))
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                  >
                    <Star size={11} className="fill-amber-300 text-amber-300" />
                    Paid with 10% Review: ₹{Math.max(0, itemsSubtotal + homeColFinalCharge - calculatedReviewDiscount)}
                  </button>
                )}
                {finalAmountPayable > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountPaid(String(Math.round(finalAmountPayable / 2)))}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-sm"
                  >
                    50% Advance: ₹{Math.round(finalAmountPayable / 2)}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAmountPaid('0')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  ₹0 (Unpaid)
                </button>
                {finalAmountPayable > 500 && (
                  <button
                    type="button"
                    onClick={() => setAmountPaid('500')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    ₹500 Advance
                  </button>
                )}
              </div>
            </div>

            {/* Home Sample Collection Configuration Section */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeCollectionEnabled}
                    onChange={(e) => setHomeCollectionEnabled(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded accent-teal-600 cursor-pointer"
                  />
                  <Home size={16} className="text-teal-600" />
                  Home Sample Collection
                </label>

                {homeCollectionEnabled && (
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg">
                    Charge: ₹{homeColFinalCharge}
                  </span>
                )}
              </div>

              {homeCollectionEnabled && (
                <div className="space-y-3 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        Base Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={homeCollectionBaseCharge}
                        onChange={(e) => setHomeCollectionBaseCharge(parseFloat(e.target.value) || 0)}
                        placeholder="150"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={homeCollectionDiscountPct}
                        onChange={(e) => setHomeCollectionDiscountPct(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        placeholder="0"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Preset Discount Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Quick Discount Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[0, 10, 20, 30, 50, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setHomeCollectionDiscountPct(pct)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                            homeCollectionDiscountPct === pct
                              ? 'bg-teal-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {pct}% {pct > 0 ? `(₹${Math.round((homeCollectionBaseCharge * pct) / 100)})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Breakdown Message */}
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span>Base ₹{homeCollectionBaseCharge} - {homeCollectionDiscountPct}% Discount (₹{homeColDiscountAmount})</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">= ₹{homeColFinalCharge}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Test Selection from Database */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  2. Add Pathology Tests / Packages
                </h2>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  {catalog.length} Items in Catalog
                </span>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-teal-600" /> Popular Pathology Tests:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {POPULAR_QUICK_TESTS.map((testName) => (
                    <button
                      key={testName}
                      type="button"
                      onClick={() => addPopularTest(testName)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 rounded-lg text-[11px] font-semibold transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                    >
                      <Plus size={10} /> {testName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Catalog Input */}
              <div className="relative pt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pt-1">
                  <Search className="text-slate-400" size={16} />
                </div>
                <input
                  type="text"
                  value={testSearch}
                  onFocus={() => setIsSearching(true)}
                  onChange={(e) => {
                    setTestSearch(e.target.value)
                    setIsSearching(true)
                  }}
                  placeholder="Type to search all 694 tests & health packages (e.g. CBC, KFT, LFT, Lipid)..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
                />

                {isSearching && testSearch.trim() && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {searchResults.length > 0 ? (
                      searchResults.map((t) => {
                        const stdPrice = t.mrp && t.mrp >= t.price ? t.mrp : (t.price * 2)
                        const discountPct = stdPrice > t.price ? Math.round(((stdPrice - t.price) / stdPrice) * 100) : 0
                        return (
                          <div
                            key={t.id}
                            onClick={() => addTestFromCatalog(t)}
                            className="p-3 hover:bg-teal-50 dark:hover:bg-teal-950/50 cursor-pointer flex justify-between items-center text-xs transition-colors group"
                          >
                            <div className="min-w-0 pr-3">
                              <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600">
                                {t.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Standard Price: ₹{stdPrice} • {t.category || 'Pathology Test'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className="text-[10px] text-slate-400 line-through">₹{stdPrice}</span>
                                <span className="font-black text-sm text-teal-600 dark:text-teal-400">₹{t.price}</span>
                              </div>
                              {discountPct > 0 && (
                                <span className="text-[9px] font-bold text-green-600 bg-green-50 dark:bg-green-950/40 px-1 py-0.5 rounded">
                                  {discountPct}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-4 text-xs text-slate-500 text-center">
                        No tests matching &ldquo;{testSearch}&rdquo;. You can add it as a custom test below.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Add Test Fields */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Add Custom Investigation / Service
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customTestName}
                    onChange={(e) => setCustomTestName(e.target.value)}
                    placeholder="Custom Test Name"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="number"
                    value={customTestMrp}
                    onChange={(e) => setCustomTestMrp(e.target.value)}
                    placeholder="Standard Price"
                    className="w-28 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customTestPrice}
                      onChange={(e) => setCustomTestPrice(e.target.value)}
                      placeholder="Final Rate"
                      className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = parseFloat(customTestPrice) || 0
                        if (val > 0) setCustomTestPrice(String(Math.round(val * 1.1)))
                      }}
                      className="px-2.5 py-2 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-black border border-teal-300 dark:border-teal-700 transition-colors shrink-0 cursor-pointer"
                      title="Add 10% review margin to rate"
                    >
                      +10%
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomItem}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shrink-0 justify-center cursor-pointer"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Items List in Editor */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Included Investigations ({items.length})
                  </h3>
                  {totalMarginAdded > 0 && (
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block">
                      ⚡ 10% Review Margin Active (+₹{totalMarginAdded} buffer)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                    Payable: ₹{finalAmountPayable.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : paymentStatus === 'PARTIALLY PAID'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    Due: ₹{balanceDue.toFixed(2)} ({paymentStatus})
                  </span>
                </div>
              </div>

              {/* 10% Review Margin Batch Toolbar */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <TrendingUp size={13} className="text-teal-600" /> Margin:
                  </span>
                  <button
                    type="button"
                    onClick={applyMarginToAllTests}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                    title="Increase all test prices in this bill by 10%"
                  >
                    ⚡ +10% All Tests
                  </button>
                  <button
                    type="button"
                    onClick={resetAllTestsToBase}
                    className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset all tests to catalog base prices"
                  >
                    <RotateCcw size={11} /> Reset Base
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApplyMargin}
                    onChange={(e) => setAutoApplyMargin(e.target.checked)}
                    className="w-3.5 h-3.5 text-teal-600 rounded accent-teal-600 cursor-pointer"
                  />
                  Auto +10% on new tests
                </label>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="p-5 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                      No investigations added to this bill yet.
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Search above or click any popular test chip to add items.
                    </p>
                  </div>
                ) : (
                  items.map((item, index) => {
                    const stdPrice = item.mrp && item.mrp >= item.price ? item.mrp : item.price
                    const discPct = stdPrice > item.price ? Math.round(((stdPrice - item.price) / stdPrice) * 100) : 0
                    const hasMargin = item.isMarginApplied || (item.basePrice !== undefined && item.price > item.basePrice)

                    return (
                      <div
                        key={index}
                        className={`p-2.5 rounded-xl text-xs border transition-colors space-y-2 ${
                          hasMargin
                            ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/60'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {item.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span>Standard: <span className="line-through">₹{stdPrice}</span></span>
                              <span>•</span>
                              <span>Rate: <strong className="text-slate-800 dark:text-slate-200">₹{item.price}</strong> {discPct > 0 ? `(${discPct}% OFF)` : ''}</span>
                              {item.basePrice !== undefined && item.price !== item.basePrice && (
                                <span className="font-semibold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/60 px-1 py-0.2 rounded">
                                  Base: ₹{item.basePrice}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Line Total */}
                          <div className="text-right shrink-0">
                            <span className="font-black text-sm text-teal-600 dark:text-teal-400">
                              ₹{(item.price * (item.qty || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Item Control Row: Quantity, Rate Input, +10% Button, Reset, Delete */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          {/* Left: Quantity controls */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Qty:</span>
                            <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, -1)}
                                className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                              >
                                -
                              </button>
                              <span className="px-1.5 font-bold min-w-4 text-center">{item.qty || 1}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, 1)}
                                className="px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Middle: Price & +10% Button */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Rate ₹:</span>
                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                                className="w-16 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>

                            {/* +10% Button on this test */}
                            <button
                              type="button"
                              onClick={() => increaseItemPriceBy10(index)}
                              className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-black transition-all shadow-sm cursor-pointer flex items-center gap-0.5 active:scale-95"
                              title="Increase this test amount by 10%"
                            >
                              +10%
                            </button>

                            {/* Reset to base price button */}
                            {item.basePrice !== undefined && item.price !== item.basePrice && (
                              <button
                                type="button"
                                onClick={() => resetItemPrice(index)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title={`Reset to base catalog rate (₹${item.basePrice})`}
                              >
                                <RotateCcw size={13} />
                              </button>
                            )}
                          </div>

                          {/* Right: Delete */}
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 p-1 transition-colors ml-1 cursor-pointer"
                            title="Remove test"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Google Review & Referral Discount Section */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-slate-100">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span>Google Review & Referral Offer</span>
                </div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showReviewOffer}
                    onChange={(e) => setShowReviewOffer(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded accent-teal-600 cursor-pointer"
                  />
                  Print Offer on Bill
                </label>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                The bill has the 10% review buffer included. When a patient provides a 5★ Google Review &amp; refers someone, waive that 10% instantly with one click below:
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggleReviewDiscount}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isReviewDiscountActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                      : 'bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                  }`}
                >
                  <Star size={13} className={isReviewDiscountActive ? 'text-amber-300 fill-amber-300' : 'text-amber-500'} />
                  {isReviewDiscountActive
                    ? `✓ 10% Review Discount Active: -₹${discountAmount} (Applied)`
                    : `Apply 10% Review Discount (-₹${calculatedReviewDiscount})`}
                </button>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Manual Disc:</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-[11px] text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount || ''}
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0)
                        setDiscountAmount(val)
                        if (val === 0) setDiscountLabel('Additional Discount')
                      }}
                      placeholder="0"
                      className="w-20 pl-6 pr-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Settlement Breakdown in Editor */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Receipt size={14} className="text-teal-600" /> Bill Summary & Settlement
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider ${
                  paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                    : paymentStatus === 'PARTIALLY PAID'
                    ? 'bg-amber-100 text-amber-800 border border-amber-400'
                    : 'bg-red-100 text-red-800 border border-red-400'
                }`}>
                  {paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Bill Amount</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹{totalBillAmount.toFixed(2)}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Savings / Disc</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{totalSavings.toFixed(2)}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Final Amount Payable</span>
                  <span className="font-extrabold text-teal-600 dark:text-teal-400">₹{finalAmountPayable.toFixed(2)}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Amount Paid</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹{enteredAmountPaid.toFixed(2)}</span>
                </div>
                <div className={`p-2.5 rounded-xl border sm:col-span-2 ${
                  balanceDue > 0
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold block">Balance Due = Payable − Paid</span>
                      <span className="font-black text-sm">₹{balanceDue.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-current">
                      {balanceDue === 0 ? 'Fully Cleared' : 'Payment Due'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Exact Live Cash Memo Preview */}
          <div className="lg:col-span-7">
            <OutpatientCashMemo data={memoData} />
          </div>

        </div>

      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Cash Memo Module...</div>}>
      <InvoiceModuleContent />
    </Suspense>
  )
}
