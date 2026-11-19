'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Phone,
  ArrowRight,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientHomeCollectionPage() {
  const { activePatientId, context } = usePatient()
  const [address, setAddress] = useState(context?.patient.address_line1 || '')
  const [city, setCity] = useState(context?.patient.city || 'Kolkata')
  const [pincode, setPincode] = useState('700001')
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [slot, setSlot] = useState('morning')
  const [notes, setNotes] = useState('')
  const [booked, setBooked] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBooked(true)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="h-6 w-6 text-teal-600" />
          Home Sample Collection Service
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Certified phlebotomists collect blood, urine and pathology samples directly from your doorstep with cold-chain transport.
        </p>
      </div>

      {booked ? (
        <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-black text-emerald-900 dark:text-emerald-200">
            Home Collection Request Confirmed!
          </h2>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
            A certified phlebotomist has been allocated for {date} during the{' '}
            <span className="font-bold">{slot} slot</span>. You will receive an SMS when they depart for your address.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/patient/diagnostics/orders"
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
            >
              Track Orders
            </Link>
            <button
              onClick={() => setBooked(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              Book Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Guarantee Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">Sterile Vacuum Tubes</div>
                <div className="text-[10px] text-slate-400">Single-use vacutainers</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Truck className="h-5 w-5 text-cyan-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">Cold-Chain Transit</div>
                <div className="text-[10px] text-slate-400">Temp-controlled iceboxes</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">Same-Day Processing</div>
                <div className="text-[10px] text-slate-400">Digital report in portal</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Address & Schedule Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pickup Address
              </label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No, Street name, Building, Landmark..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Collection Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="morning">Morning (07:00 - 10:00) - Ideal for Fasting</option>
                  <option value="midday">Midday (10:00 - 13:00)</option>
                  <option value="evening">Evening (16:00 - 19:00)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Special Instructions for Phlebotomist (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ring bell twice, difficult vein, elderly patient..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/patient/diagnostics"
              className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
            >
              <FlaskConical className="h-4 w-4" />
              Select specific tests from catalogue first
            </Link>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Confirm Home Collection Request
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
