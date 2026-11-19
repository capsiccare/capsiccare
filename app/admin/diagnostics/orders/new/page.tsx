'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FlaskConical,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Home,
  Building2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowLeft,
  IndianRupee,
  Receipt,
  RefreshCw,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface CartItem {
  id: string
  itemType: 'test' | 'package'
  referenceId: string
  name: string
  code: string
  sampleType: string
  priceInr: number
  pricePaise: number
  quantity: number
}

export default function NewDiagnosticOrderPage() {
  const router = useRouter()
  const { selectedBranchId, branches } = useBranch()

  // Patient Selection / Quick Register
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<any[]>([])
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [quickPatient, setQuickPatient] = useState({
    fullName: '',
    phone: '',
    gender: 'male',
    ageYears: 30,
    address: '',
  })

  // Branch
  const [branchId, setBranchId] = useState(
    selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || '')
  )

  // Diagnostic Test Search & Cart
  const [testSearch, setTestSearch] = useState('')
  const [catalogueResults, setCatalogueResults] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  // Fulfillment: Home Collection vs Walk-in
  const [fulfillmentType, setFulfillmentType] = useState<'home_collection' | 'center_visit'>('center_visit')
  const [collectionAddress, setCollectionAddress] = useState('')
  const [collectionLandmark, setCollectionLandmark] = useState('')
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [scheduledSlot, setScheduledSlot] = useState('07:00 AM - 09:00 AM')

  // Promo Code
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [promoDiscountInr, setPromoDiscountInr] = useState(0)

  // Payment Selection
  const [collectPaymentNow, setCollectPaymentNow] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash')
  const [paymentRef, setPaymentRef] = useState('')

  // Form Submission
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // 1. Search Patient
  useEffect(() => {
    if (!patientSearch.trim() || patientSearch.length < 2) {
      setPatientResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/admin/patients?q=${encodeURIComponent(patientSearch.trim())}&limit=5`)
        const data = await res.json()
        if (data.success) {
          setPatientResults(data.data || [])
        }
      } catch {}
    }, 250)
    return () => clearTimeout(timer)
  }, [patientSearch])

  // 2. Search Catalogue
  useEffect(() => {
    if (!testSearch.trim() || testSearch.length < 2) {
      setCatalogueResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/diagnostics/catalogue?q=${encodeURIComponent(testSearch.trim())}&limit=8`)
        const data = await res.json()
        if (data.success) {
          setCatalogueResults(data.data || [])
        }
      } catch {}
    }, 250)
    return () => clearTimeout(timer)
  }, [testSearch])

  // Add Item to Cart
  const addToCart = (item: any) => {
    const existing = cart.find((c) => c.referenceId === item.id)
    if (existing) {
      setCart(cart.map((c) => (c.referenceId === item.id ? { ...c, quantity: c.quantity + 1 } : c)))
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          itemType: item.itemType,
          referenceId: item.id,
          name: item.name,
          code: item.code,
          sampleType: item.sampleType || 'Blood',
          priceInr: item.priceInr,
          pricePaise: item.pricePaise,
          quantity: 1,
        },
      ])
    }
    setTestSearch('')
    setCatalogueResults([])
  }

  const removeFromCart = (refId: string) => {
    setCart(cart.filter((c) => c.referenceId !== refId))
  }

  // Financial Calculations
  const subtotalInr = cart.reduce((sum, item) => sum + item.priceInr * item.quantity, 0)
  const isFreeCollection = subtotalInr >= 1000 // Free doorstep collection on ₹1,000+
  const homeCollectionFeeInr = fulfillmentType === 'home_collection' ? (isFreeCollection ? 0 : 100) : 0
  const netTotalInr = Math.max(0, subtotalInr - promoDiscountInr + homeCollectionFeeInr)

  // Apply promo check
  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      const disc = Math.round(subtotalInr * 0.1)
      setPromoDiscountInr(disc)
      setAppliedPromo('WELCOME10')
    } else {
      alert('Invalid promo code. Try WELCOME10 for 10% off.')
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
      if (cart.length === 0) {
        throw new Error('Please add at least one test or package to the cart')
      }

      const payload: Record<string, any> = {
        branch_id: branchId || branches[0]?.id,
        fulfillment_type: fulfillmentType,
        items: cart.map((c) => ({
          item_type: c.itemType,
          reference_id: c.referenceId,
          quantity: c.quantity,
        })),
        promo_code: appliedPromo || undefined,
        create_invoice: true,
      }

      if (selectedPatient) {
        payload.patient_id = selectedPatient.id
      } else if (showQuickRegister) {
        payload.quick_patient = {
          full_name: quickPatient.fullName.trim(),
          phone: quickPatient.phone.trim(),
          gender: quickPatient.gender,
          age_years: Number(quickPatient.ageYears),
          address: quickPatient.address.trim() || collectionAddress.trim() || undefined,
        }
      } else {
        throw new Error('Please select an existing patient or quick register a walk-in patient')
      }

      if (fulfillmentType === 'home_collection') {
        if (!collectionAddress.trim()) {
          throw new Error('Please provide the doorstep collection address')
        }
        payload.collection_address = collectionAddress.trim()
        payload.collection_landmark = collectionLandmark.trim() || null
        payload.scheduled_collection_date = scheduledDate
        payload.scheduled_slot = scheduledSlot
      }

      if (collectPaymentNow && netTotalInr > 0) {
        payload.payment = {
          method: paymentMethod,
          amount_paise: netTotalInr * 100,
          reference: paymentRef.trim() || undefined,
        }
      }

      const res = await fetch('/api/v1/diagnostics/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to record diagnostic order')
      }

      router.push('/admin/diagnostics/orders')
    } catch (err: any) {
      setFormError(err.message || 'Submission error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/diagnostics/orders" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            New Diagnostic Order & POS Billing
          </h1>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Patient, Tests & Fulfillment */}
        <div className="md:col-span-2 space-y-6">
          {/* SECTION 1: Patient Selection */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" /> 1. Patient Identification *
            </h3>

            {selectedPatient ? (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-700">
                      {selectedPatient.uhid}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedPatient.fullName}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono">
                    Phone: {selectedPatient.phone} • {selectedPatient.gender} • {selectedPatient.ageYears} yrs
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedPatient(null)} className="h-7 text-xs">
                  Change
                </Button>
              </div>
            ) : showQuickRegister ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200">
                  <span>Quick Register Walk-in Patient</span>
                  <button type="button" onClick={() => setShowQuickRegister(false)} className="text-xs text-purple-600 hover:underline">
                    Search Existing Instead
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Full Name *</label>
                    <Input
                      value={quickPatient.fullName}
                      onChange={(e) => setQuickPatient({ ...quickPatient, fullName: e.target.value })}
                      placeholder="Patient name"
                      required
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Phone (+91) *</label>
                    <Input
                      value={quickPatient.phone}
                      onChange={(e) => setQuickPatient({ ...quickPatient, phone: e.target.value })}
                      placeholder="10 digit mobile"
                      required
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Gender</label>
                    <select
                      value={quickPatient.gender}
                      onChange={(e) => setQuickPatient({ ...quickPatient, gender: e.target.value as any })}
                      className="w-full h-8 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Age (Years)</label>
                    <Input
                      type="number"
                      min="0"
                      value={quickPatient.ageYears}
                      onChange={(e) => setQuickPatient({ ...quickPatient, ageYears: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search patient by UHID, phone number or full name..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                  {patientResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      {patientResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPatient(p)
                            setPatientResults([])
                            setPatientSearch('')
                            if (p.address) setCollectionAddress(p.address)
                          }}
                          className="p-2.5 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-purple-700 dark:text-purple-400 mr-2">{p.uhid}</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{p.fullName}</span>
                            <p className="text-[11px] text-slate-400 font-mono">{p.phone}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">Select</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px]">Walk-in patient without record?</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickRegister(true)}
                    className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Quick Register Walk-in Patient
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Test & Package Cart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-600" /> 2. Diagnostic Cart & Tests *
            </h3>

            {/* Catalogue Search Dropdown */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search and add lab tests or packages (e.g. CBC, Lipid, Liver Function, Thyroid, HbA1c)..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />

              {catalogueResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {catalogueResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="p-2.5 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <span>{item.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">({item.code})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 capitalize">{item.itemType} • {item.sampleType}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white block">₹{item.priceInr}</span>
                        <Badge variant="outline" className="text-[9px] text-purple-600 border-purple-200">+ Add</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs italic">
                        Cart is currently empty. Use the search bar above to add tests or packages.
                      </td>
                    </tr>
                  ) : (
                    cart.map((c) => (
                      <tr key={c.referenceId} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{c.code} • {c.sampleType}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{c.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{c.priceInr}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{c.priceInr * c.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeFromCart(c.referenceId)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Fulfillment Type */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" /> 3. Collection Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setFulfillmentType('center_visit')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  fulfillmentType === 'center_visit'
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Clinic Walk-in</span>
                  <span className="text-[11px] text-slate-500">Patient visits diagnostic lab</span>
                </div>
              </label>

              <label
                onClick={() => setFulfillmentType('home_collection')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  fulfillmentType === 'home_collection'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <Home className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Home Sample Collection</span>
                  <span className="text-[11px] text-slate-500">Doorstep phlebotomist pickup</span>
                </div>
              </label>
            </div>

            {fulfillmentType === 'home_collection' && (
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Doorstep Address *</label>
                  <Input
                    value={collectionAddress}
                    onChange={(e) => setCollectionAddress(e.target.value)}
                    placeholder="Full street address, house/flat number"
                    required
                    className="h-8 text-xs bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Landmark</label>
                    <Input
                      value={collectionLandmark}
                      onChange={(e) => setCollectionLandmark(e.target.value)}
                      placeholder="e.g. Near Bankra Bazar"
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Collection Date *</label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Time Slot *</label>
                    <select
                      value={scheduledSlot}
                      onChange={(e) => setScheduledSlot(e.target.value)}
                      className="w-full h-8 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-slate-800 dark:text-white"
                    >
                      <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM (Early Fasting)</option>
                      <option value="07:00 AM - 09:00 AM">07:00 AM - 09:00 AM (Morning Standard)</option>
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Post-Breakfast)</option>
                      <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Midday)</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Billing Summary & Payment */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" /> Financial Summary
            </h3>

            {/* Promo Code Box */}
            <div className="flex gap-2">
              <Input
                placeholder="Promo code (e.g. WELCOME10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-8 text-xs font-mono uppercase"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleApplyPromo} className="h-8 text-xs">
                Apply
              </Button>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Catalogue Subtotal</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">₹{subtotalInr}</span>
              </div>

              {promoDiscountInr > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Promotional Discount ({appliedPromo})</span>
                  <span className="font-mono font-bold">-₹{promoDiscountInr}</span>
                </div>
              )}

              {fulfillmentType === 'home_collection' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <span>Doorstep Collection</span>
                    {isFreeCollection && (
                      <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300">
                        FREE (&ge; ₹1,000)
                      </Badge>
                    )}
                  </div>
                  <span className={`font-mono ${isFreeCollection ? 'text-emerald-600 font-bold' : 'text-slate-900 dark:text-white'}`}>
                    {isFreeCollection ? '₹0' : '₹100'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>GST Tax (Exempt Healthcare)</span>
                <span className="font-mono font-medium text-slate-500">₹0 (0%)</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Total Payable</span>
                <span className="font-mono font-black text-lg text-emerald-700 dark:text-emerald-400">₹{netTotalInr}</span>
              </div>
            </div>

            {/* POS Payment Collection */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={collectPaymentNow}
                  onChange={(e) => setCollectPaymentNow(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Collect POS Payment Now</span>
              </label>

              {collectPaymentNow && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full h-8 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2"
                    >
                      <option value="cash">Cash (Counter Receipt)</option>
                      <option value="upi">UPI (Instant QR / PhonePe / GPay)</option>
                      <option value="card">Debit / Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Transaction Ref / UTR (Optional)</label>
                    <Input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. UPI 431092..."
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-xs"
            >
              {submitting ? 'Confirming Order & Billing...' : 'Confirm Order & Issue Invoice'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
