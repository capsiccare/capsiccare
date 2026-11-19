'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Search,
  ShoppingCart,
  Plus,
  Check,
  Truck,
  Building,
  AlertCircle,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientDiagnosticsPage() {
  const { activePatientId, t } = usePatient()
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [orderType, setOrderType] = useState<'walk_in' | 'home_collection'>('walk_in')
  const [address, setAddress] = useState('')
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [slot, setSlot] = useState('morning')
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    loadCatalogue()
  }, [])

  const loadCatalogue = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/patient/diagnostics')
      if (res.ok) {
        const json = await res.json()
        setTests(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCart = (test: any) => {
    setCart((prev) => {
      const exists = prev.some((item) => item.id === test.id)
      if (exists) {
        return prev.filter((item) => item.id !== test.id)
      } else {
        return [...prev, test]
      }
    })
  }

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.base_price || 0), 0)

  const handlePlaceOrder = async () => {
    if (!activePatientId || cart.length === 0) return
    try {
      setSubmitting(true)
      const payload = {
        test_ids: cart.map((c) => c.id),
        order_type: orderType,
        home_collection_address: orderType === 'home_collection' ? address : undefined,
        preferred_date: scheduledDate,
        preferred_slot: slot,
      }

      const res = await fetch(`/api/v1/patient/diagnostics?patientId=${activePatientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (res.ok) {
        setOrderSuccess(json.data)
        setCart([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTests = tests.filter((t) => {
    return (
      !search ||
      t.test_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.test_code?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name?.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.diagnostics}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse 680+ NABL accredited diagnostic tests, pathology panels, and book walk-in or home collection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/patient/diagnostics/orders"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            My Lab Orders
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-md relative"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart ({cart.length})
            {cart.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-400 absolute top-1 right-1" />
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by test name (e.g. CBC, Lipid Profile, Thyroid, Vitamin D)..."
          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Order Success Banner */}
      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Lab Order Placed Successfully!
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              Order #{orderSuccess.order_number} is received. Total: ₹{orderSuccess.total_amount}.
            </p>
          </div>
          <Link
            href="/patient/diagnostics/orders"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            Track Order
          </Link>
        </div>
      )}

      {/* Test Catalogue Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <FlaskConical className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-400">No diagnostic tests matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => {
            const inCart = cart.some((c) => c.id === test.id)
            return (
              <div
                key={test.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-teal-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {test.test_code}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      ₹{test.base_price}
                    </span>
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                    {test.test_name}
                  </h3>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                    <div>Sample: <span className="font-medium text-slate-700 dark:text-slate-300">{test.sample_type || 'Blood'}</span></div>
                    <div>TAT: <span className="font-medium text-slate-700 dark:text-slate-300">{test.turnaround_time_hours || 24} hours</span></div>
                    {test.fasting_required && (
                      <div className="text-amber-600 font-medium">⚠️ 10-12 hrs fasting required</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => toggleCart(test)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inCart
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cart / Booking Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-teal-600" />
                  Your Test Booking ({cart.length})
                </h3>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Your cart is empty. Select diagnostic tests from the catalogue.
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.test_name}</div>
                          <div className="text-[10px] text-slate-400">₹{item.base_price}</div>
                        </div>
                        <button
                          onClick={() => toggleCart(item)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Mode selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Collection Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('walk_in')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                          orderType === 'walk_in'
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        <Building className="h-4 w-4" />
                        Walk-in to Clinic
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('home_collection')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${
                          orderType === 'home_collection'
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        <Truck className="h-4 w-4" />
                        Home Sample Collection
                      </button>
                    </div>
                  </div>

                  {orderType === 'home_collection' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Home Address for Sample Pickup
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House no, Street, Landmark, Pincode..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Time Slot
                      </label>
                      <select
                        value={slot}
                        onChange={(e) => setSlot(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="morning">Morning (07:00 - 10:00)</option>
                        <option value="midday">Midday (10:00 - 13:00)</option>
                        <option value="evening">Evening (16:00 - 19:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Total Amount:</span>
                  <span className="text-teal-600 text-lg">₹{totalAmount}</span>
                </div>
                <button
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : 'Confirm Test Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
