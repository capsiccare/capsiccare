'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'
import { ArrowLeft, Phone, Mail, MapPin, User, Calendar, CheckCircle2, AlertCircle, Loader, Share2, Copy, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { validatePromoCode } from '@/lib/services/promos'
import { validatePartnerCode } from '@/lib/services/partners'
import { createBooking } from '@/lib/services/bookings'
import { isServiceAvailable } from '@/lib/services/service-areas'
import { generateBookingWhatsAppMessage } from '@/lib/services/whatsapp'

import { OutpatientCashMemo, CashMemoData } from '@/components/outpatient-cash-memo'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const [step, setStep] = useState<'details' | 'summary' | 'confirmation'>('details')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [showCashMemoModal, setShowCashMemoModal] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'West Bengal',
    pincode: '',
    dateOfBirth: '',
    gender: '',
    notes: '',
    promoCode: '',
    partnerCode: '',
  })
  const [discount, setDiscount] = useState(0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <AlertCircle size={64} className="mx-auto text-teal-600 dark:text-teal-300 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Cart is Empty</h1>
          <p className="text-slate-600 dark:text-slate-200 mb-6">Add tests or packages to proceed with checkout</p>
          <Link href="/lab-tests" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Browse Tests
          </Link>
        </div>
      </div>
    )
  }

  const totalAmount = getTotalPrice()
  const totalMrp = items.reduce((sum, item) => sum + Math.max(item.mrp || item.price, item.price), 0)
  const totalItemSavings = totalMrp - totalAmount
  const promoDiscountAmount = Math.round(totalAmount * discount / 100)
  const overallSavings = totalItemSavings + promoDiscountAmount
  const finalAmount = totalAmount - promoDiscountAmount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = async () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      setError('Please fill in all required fields')
      return false
    }
    if (formData.state !== 'West Bengal') {
      setError('We currently provide service only in West Bengal. Please contact us for expansion plans.')
      return false
    }
    // Check if service is available in the selected district
    const serviceAvailable = await isServiceAvailable(formData.state, formData.city)
    if (!serviceAvailable) {
      setError(`We don't currently provide service in ${formData.city}. Please check back later or contact support.`)
      return false
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const applyPromoCode = async () => {
    if (!formData.promoCode.trim()) {
      setError('Please enter a promo code')
      return
    }
    try {
      const result = await validatePromoCode(formData.promoCode)
      if (result?.type === 'percentage') {
        setDiscount(result.discount)
        setError('')
      } else if (result?.type === 'amount') {
        // For fixed amount discounts, handle separately
        setDiscount(result.discount)
        setError('')
      } else {
        setError('Invalid or expired promo code')
      }
    } catch (err) {
      setError('Failed to validate promo code')
    }
  }

  const validatePartnerCodeLocal = async (code: string) => {
    try {
      const result = await validatePartnerCode(code)
      return !!result
    } catch {
      return false
    }
  }

  const handleProceedToSummary = async () => {
    const isValid = await validateForm()
    if (!isValid) return
    setError('')
    setStep('summary')
  }

  const handleConfirmBooking = async () => {
    setIsLoading(true)
    setError('')

    try {
      console.log('[v0] Booking submission:', {
        fullName: formData.fullName,
        phone: formData.phone,
        totalAmount,
        promoDiscountAmount,
        finalAmount,
      })

      // Create a mock booking ID instead of relying on a database
      const bkId = `BC-${Date.now()}`
      setBookingId(bkId)

      // Generate WhatsApp message using service
      const message = generateBookingWhatsAppMessage({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        notes: formData.notes,
        address: formData.address,
        city: formData.city,
        state: formData.state || 'West Bengal',
        pincode: formData.pincode,
        bookingId: bkId,
        tests: items,
        totalAmount: totalMrp,
        discountAmount: overallSavings,
        finalAmount: finalAmount,
        promoCode: formData.promoCode,
        partnerCode: formData.partnerCode
      })

      // Proceed to WhatsApp confirmation with the booking details
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918910260709'
      window.open(
        `https://wa.me/${whatsappNumber}?text=${message}`,
        '_blank'
      )

      // Clear cart and show confirmation
      clearCart()
      setStep('confirmation')
    } catch (err) {
      console.error('[v0] Booking error:', err)
      setError('Failed to process booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-300 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Book Your Lab Test</h1>
          <p className="text-slate-600 dark:text-slate-200 text-lg">
            Home Sample Collection Available in Howrah, Kolkata (Primary) &amp; Nearby Districts
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-black text-xs uppercase tracking-wide">
                Home Collection Notice
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                🚚 Free Home Sample Collection is available if total test amount is above ₹3,000 (in Howrah &amp; Kolkata).
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              For updated prices, home collection charges for orders below ₹2,000, or any information, please contact <a href="tel:+918910260709" className="font-bold text-teal-700 dark:text-teal-300 underline">8910260709</a> or connect on <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20have%20an%20inquiry%20regarding%20updated%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 dark:text-emerald-400 underline">WhatsApp</a>.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-4 mb-8">
          {['details', 'summary', 'confirmation'].map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === s ? 'bg-teal-600 text-white' :
                ['details', 'summary', 'confirmation'].indexOf(step) > idx ? 'bg-green-600 text-white' :
                  'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-200'
                }`}>
                {['details', 'summary', 'confirmation'].indexOf(step) > idx ? '✓' : idx + 1}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-200 capitalize">{s}</span>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-lg p-6 sm:p-8">
              {step === 'details' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Details</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Service State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="West Bengal">West Bengal (Primary)</option>
                      </select>
                      {formData.state !== 'West Bengal' && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-2">We currently provide home collection service in West Bengal only</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Service District *
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Your District</option>
                        <option value="Kolkata">Kolkata (Primary)</option>
                        <option value="Howrah">Howrah (Primary)</option>
                        <option value="West Midnapore">West Midnapore</option>
                        <option value="East Midnapore">East Midnapore</option>
                        <option value="Nadia">Nadia</option>
                        <option value="North 24 Parganas">North 24 Parganas</option>
                        <option value="South 24 Parganas">South 24 Parganas</option>
                        <option value="Birbhum">Birbhum</option>
                        <option value="Bankura">Bankura</option>
                        <option value="Purba Bardhaman">Purba Bardhaman</option>
                        <option value="Paschim Bardhaman">Paschim Bardhaman</option>
                        <option value="Jalpaiguri">Jalpaiguri</option>
                        <option value="Darjeeling">Darjeeling</option>
                        <option value="Kalimpong">Kalimpong</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Special Instructions for Phlebotomist (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="E.g., fasting required, specific collection time, access instructions for your home, any medical conditions..."
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 h-24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Promo Code (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.promoCode}
                          onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                          placeholder="Enter promo code"
                          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={applyPromoCode}
                          className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium text-sm"
                        >
                          Apply
                        </button>
                      </div>
                      {discount > 0 && (
                        <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                          ✓ {discount}% discount applied
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Partner Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.partnerCode}
                        onChange={(e) => setFormData({ ...formData, partnerCode: e.target.value })}
                        placeholder="Enter partner code"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToSummary}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
                  >
                    Continue to Summary
                  </button>
                </div>
              )}

              {step === 'summary' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order Summary</h2>

                  <div className="space-y-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Patient Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Phone</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Email</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Address</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.address}, {formData.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tests & Packages</h3>
                    {items.map(item => {
                      const itemMrp = Math.max(item.mrp || item.price, item.price);
                      const itemSavings = itemMrp - item.price;
                      return (
                        <div key={item.id} className="text-sm mb-2">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600 dark:text-slate-200 pr-2">{item.name}</span>
                            <div className="text-right shrink-0">
                              {itemSavings > 0 && <span className="text-xs text-slate-400 line-through mr-1.5">₹{itemMrp}</span>}
                              <span className="font-medium text-slate-900 dark:text-white">₹{item.price}</span>
                            </div>
                          </div>
                          {itemSavings > 0 && (
                            <div className="flex justify-end mt-0.5">
                              <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                Save ₹{itemSavings}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {(formData.promoCode || formData.partnerCode) && (
                    <div className="space-y-2 bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Applied Codes</h3>
                      {formData.promoCode && (
                        <div className="text-sm">
                          <p className="text-slate-600 dark:text-slate-200">Promo Code: {formData.promoCode}</p>
                          {discount > 0 && (
                            <p className="text-green-600 dark:text-green-400 font-medium">-₹{Math.round(totalAmount * discount / 100)}</p>
                          )}
                        </div>
                      )}
                      {formData.partnerCode && (
                        <p className="text-sm text-slate-600 dark:text-slate-200">Partner: {formData.partnerCode}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-200">
                      <span>Subtotal:</span>
                      <span className="line-through">₹{totalMrp}</span>
                    </div>
                    {overallSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                        <span>Discount:</span>
                        <span>-₹{overallSavings}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm items-center py-1">
                      <span className="text-slate-600 dark:text-slate-300">Home Sample Collection:</span>
                      {finalAmount >= 2000 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-xs">
                          FREE (Orders &gt; ₹2000 in Howrah &amp; Kolkata)
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-medium text-xs text-right">
                          Free on &gt; ₹2000 (Add ₹{2000 - finalAmount} more)
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span>Final Amount:</span>
                      <span className="text-teal-600 dark:text-teal-300">
                        ₹{finalAmount}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    ℹ️ For updated price or information, contact <a href="tel:+918910260709" className="font-bold underline text-teal-600 dark:text-teal-400">8910260709</a> or <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20have%20an%20inquiry%20regarding%20updated%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-600 dark:text-emerald-400">WhatsApp</a>.
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep('details')}
                      className="flex-1 py-3 border-2 border-teal-600 text-teal-600 dark:text-teal-300 font-semibold rounded-lg hover:bg-teal-50 dark:hover:bg-teal-500/10"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader className="animate-spin" size={20} /> : null}
                      {isLoading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirmation' && (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Confirmed!</h2>
                    <p className="text-slate-600 dark:text-slate-200">Your booking has been successfully created.</p>
                  </div>

                  {/* Booking Details Card */}
                  <div className="bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Booking Details</h3>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">Confirmed</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Booking ID</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">{bookingId}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Patient Name</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Phone</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-200">Age</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-600 dark:text-slate-200">Address</p>
                        <p className="font-medium text-slate-900 dark:text-white">{formData.address}, {formData.city} - {formData.pincode}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-600 dark:text-slate-200">Tests/Packages</p>
                        <div className="space-y-1 mt-1">
                          {items.map(item => (
                            <p key={item.id} className="text-slate-900 dark:text-white">• {item.name} - ₹{item.price}</p>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between font-bold">
                          <p className="text-slate-900 dark:text-white">Amount Paid</p>
                          <p className="text-teal-600 dark:text-teal-300">₹0 (Pay Later)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Official Outpatient Cash Memo Action Banner */}
                  <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-teal-500/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white">Official Outpatient Cash Memo</h3>
                        <p className="text-xs text-teal-200">Generated bill with patient metadata, pathology test details & print ready receipt.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCashMemoModal(true)}
                        className="py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <FileText size={15} /> View & Print Cash Memo
                      </button>
                      <Link
                        href={`/invoice?name=${encodeURIComponent(formData.fullName)}&phone=${encodeURIComponent(formData.phone)}&age=${formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : '35'}&gender=${encodeURIComponent(formData.gender || 'Male')}`}
                        className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-white/20 text-center"
                      >
                        Open in Billing Module
                      </Link>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Share2 size={18} />
                      Share with Team
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          const text = `Booking ID: ${bookingId}\nPatient: ${formData.fullName}\nPhone: ${formData.phone}\nAddress: ${formData.address}, ${formData.city}\nTests: ${items.map(i => i.name).join(', ')}\nAmount: ₹${finalAmount}`
                          navigator.clipboard.writeText(text)
                          alert('Copied to clipboard!')
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          const message = `Booking Details:\n\nID: ${bookingId}\nPatient: ${formData.fullName}\nPhone: ${formData.phone}\nAge: ${formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : 'N/A'}\nAddress: ${formData.address}, ${formData.city}\nTests:\n${items.map(i => { const m = Math.max(i.mrp || i.price, i.price); return `• ${i.name}\n  MRP: ₹${m} | Price: ₹${i.price} | Save: ₹${m - i.price}` }).join('\n')}\n\nSubtotal: ₹${totalMrp}\nDiscount: ₹${overallSavings}\nFinal Amount: ₹${finalAmount}`
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(message)}`,
                            '_blank'
                          )
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm font-medium text-green-700 dark:text-green-400"
                      >
                        <Share2 size={16} />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => {
                          const content = `
BOOKING CONFIRMATION
====================
Booking ID: ${bookingId}

PATIENT INFORMATION
Name: ${formData.fullName}
Phone: ${formData.phone}
Age: ${formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : 'N/A'}
Gender: ${formData.gender || 'Not specified'}
Address: ${formData.address}, ${formData.city} - ${formData.pincode}

TESTS/PACKAGES
${items.map(i => { const m = Math.max(i.mrp || i.price, i.price); return `• ${i.name}\n  MRP: ₹${m} | Price: ₹${i.price} | Save: ₹${m - i.price}` }).join('\n')}

AMOUNT DETAILS
Subtotal: ₹${totalMrp}
Discount: ₹${overallSavings}
Final Amount: ₹${finalAmount}

Status: CONFIRMED
Generated: ${new Date().toLocaleString()}
                          `
                          const element = document.createElement('a')
                          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
                          element.setAttribute('download', `booking-${bookingId}.txt`)
                          element.style.display = 'none'
                          document.body.appendChild(element)
                          element.click()
                          document.body.removeChild(element)
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm font-medium text-blue-700 dark:text-blue-400"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 space-y-2 text-sm">
                    <p className="text-slate-600 dark:text-slate-200">A confirmation message has been sent to your WhatsApp.</p>
                    <p className="text-slate-600 dark:text-slate-200">We will contact you within 24 hours to schedule your home collection.</p>
                  </div>

                  <Link href="/" className="block text-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
                    Back to Home
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Cash Memo Modal Overlay */}
          {showCashMemoModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center print:p-0 print:bg-white">
              <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto print:max-h-none print:overflow-visible">
                <OutpatientCashMemo
                  data={{
                    billId: bookingId,
                    patientName: formData.fullName,
                    phone: formData.phone,
                    age: formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : 35,
                    gender: formData.gender || 'Male',
                    category: 'PATHOLOGY',
                    modeOfPayment: 'Online',
                    accountName: 'Online Booking',
                    items: items.map(i => ({
                      name: i.name,
                      price: i.price,
                      qty: 1,
                    })),
                    discountAmount: promoDiscountAmount,
                    amountPaid: finalAmount,
                  }}
                  onClose={() => setShowCashMemoModal(false)}
                />
              </div>
            </div>
          )}

          {/* Sidebar - Order Summary */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-lg p-6 h-fit sticky top-24">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Order Details</h3>
            <div className="space-y-3 border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
              {items.map(item => {
                const itemMrp = Math.max(item.mrp || item.price, item.price);
                const itemSavings = itemMrp - item.price;
                return (
                  <div key={item.id} className="text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-slate-600 dark:text-slate-200 pr-2">{item.name}</span>
                      <div className="text-right shrink-0">
                        {itemSavings > 0 && <span className="text-xs text-slate-400 line-through mr-1.5">₹{itemMrp}</span>}
                        <span className="font-medium text-slate-900 dark:text-white">₹{item.price}</span>
                      </div>
                    </div>
                    {itemSavings > 0 && (
                      <div className="flex justify-end">
                        <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                          Save ₹{itemSavings}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Subtotal:</span>
                <span className="line-through">₹{totalMrp}</span>
              </div>
              {overallSavings > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                  <span>Discount:</span>
                  <span>-₹{overallSavings}</span>
                </div>
              )}
              <div className="pt-1 text-xs">
                {finalAmount >= 2000 ? (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
                    ✓ FREE Home Sample Collection Qualified (Howrah &amp; Kolkata)
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300">
                    🚚 Free Home Sample Collection on orders above ₹2,000 in Howrah &amp; Kolkata. (Add ₹{2000 - finalAmount} more).
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center font-bold pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-white">Final Amount:</span>
              <span className="text-xl text-teal-600 dark:text-teal-300">₹{finalAmount}</span>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 text-center">
              For updated prices or information, contact <a href="tel:+918910260709" className="font-bold underline text-teal-600 dark:text-teal-400">8910260709</a> or WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
