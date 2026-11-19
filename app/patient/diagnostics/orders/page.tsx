'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Truck,
  Building,
  Calendar,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientDiagnosticOrdersPage() {
  const { activePatientId } = usePatient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activePatientId) {
      loadOrders(activePatientId)
    }
  }, [activePatientId])

  const loadOrders = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/diagnostics/orders?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setOrders(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { key: 'booking_received', label: 'Order Received' },
    { key: 'sample_collected', label: 'Sample Collected' },
    { key: 'processing', label: 'Lab Processing' },
    { key: 'completed', label: 'Report Ready' },
  ]

  const getStepIndex = (status: string) => {
    if (status === 'completed') return 3
    if (status === 'processing' || status === 'sample_received_in_lab') return 2
    if (status === 'sample_collected' || status === 'assigned') return 1
    return 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/patient/diagnostics"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              My Diagnostic Orders
            </h1>
            <p className="text-xs text-slate-500">
              Real-time specimen collection and processing status for your lab investigations.
            </p>
          </div>
        </div>

        <Link
          href="/patient/diagnostics/reports"
          className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
        >
          View Ready Reports
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <FlaskConical className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No lab orders found
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Book diagnostic tests from our catalogue to have your samples tested.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const currentStep = getStepIndex(ord.order_status)
            return (
              <div
                key={ord.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        #{ord.order_number}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ord.order_type === 'home_collection' ? 'Home Collection' : 'Walk-in'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Placed on {ord.created_at?.substring(0, 10)} • Branch: {ord.branch?.name || 'Main Hub'}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{ord.total_amount}
                    </span>
                    <span className="text-[10px] text-slate-400 block capitalize">
                      Payment: {ord.payment_status}
                    </span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {steps.map((st, sIdx) => {
                    const isDone = sIdx <= currentStep
                    return (
                      <div key={st.key} className="text-center">
                        <div
                          className={`h-2 rounded-full mb-1.5 transition-all ${
                            isDone ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                        <span
                          className={`text-[10px] truncate block ${
                            isDone
                              ? 'font-bold text-teal-700 dark:text-teal-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Items */}
                <div className="pt-2 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Ordered Tests ({ord.items?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ord.items?.map((it: any) => (
                      <span
                        key={it.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {it.test?.test_name || it.test_name} (₹{it.price_at_booking})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
