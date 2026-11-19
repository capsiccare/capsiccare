'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  FileText,
  DollarSign,
  Download,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function CareflowBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [practices, setPractices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Generate Invoice Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPracticeId, setSelectedPracticeId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [invRes, planRes, pracRes] = await Promise.all([
        fetch('/api/v1/careflow/billing/invoices'),
        fetch('/api/v1/careflow/billing/plans'),
        fetch('/api/v1/careflow/practices')
      ])

      const [invData, planData, pracData] = await Promise.all([
        invRes.json(),
        planRes.json(),
        pracRes.json()
      ])

      if (invData.success) setInvoices(invData.data.invoices || [])
      if (planData.success) setPlans(planData.data.plans || [])
      if (pracData.success) {
        setPractices(pracData.data.practices || [])
        if (pracData.data.practices?.length > 0 && !selectedPracticeId) {
          setSelectedPracticeId(pracData.data.practices[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Default dates to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    setPeriodStart(firstDay)
    setPeriodEnd(lastDay)
  }, [])

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPracticeId) {
      alert('Please select a practice')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/careflow/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practice_id: selectedPracticeId,
          period_start: periodStart,
          period_end: periodEnd
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsModalOpen(false)
        fetchData()
      } else {
        alert(data.error?.message || 'Failed to generate invoice')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    return searchQuery === '' ||
      inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.careflow_practices?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.careflow_practices?.code?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/careflow" className="hover:text-teal-600 transition-colors">CareFlow OS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Practice Invoicing</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-teal-600" />
            CareFlow Managed-Service Billing & Invoicing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Subscription tier billing for external doctor chambers, call quota utilization, and automated monthly statements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4" />
            Generate Monthly Invoice
          </Button>
        </div>
      </div>

      {/* Subscription Plans Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase">Starter Tier</span>
              <Badge variant="outline" className="text-[10px]">CF_STARTER</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ₹1,999 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              For solo practitioner chambers starting patient continuity.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Up to 100 enrolled active patients
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                1 follow-up call included / patient
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ₹15 per additional call
              </li>
            </ul>
          </div>
        </div>

        <div className="p-5 rounded-xl border-2 border-teal-500/60 dark:border-teal-500/40 bg-teal-50/20 dark:bg-teal-950/20 flex flex-col justify-between relative shadow-sm">
          <Badge className="absolute -top-2.5 right-4 bg-teal-600 text-white text-[10px]">
            Most Popular
          </Badge>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-teal-800 dark:text-teal-300 uppercase">Professional Tier</span>
              <Badge variant="outline" className="text-[10px] bg-teal-100 text-teal-800 border-teal-300">CF_PRO</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ₹4,999 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              For busy consultant doctors with active chronic patient bases.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Up to 500 enrolled active patients
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                2 follow-up calls included / patient
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                ₹12 per additional call
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Multilingual calling (Bengali, Hindi, English)
              </li>
            </ul>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300 uppercase">Enterprise Multi-Chamber</span>
              <Badge variant="outline" className="text-[10px]">CF_ENTERPRISE</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ₹9,999 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              For polyclinics, multi-location doctors, and high-volume practices.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                Unlimited enrolled patients
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                Priority caller queue routing
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                ₹9 per additional call
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search invoices by number, practice name, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>{filteredInvoices.length} invoices found</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Practice Name</th>
                <th className="px-4 py-3">Billing Cycle</th>
                <th className="px-4 py-3">Enrolled Pts</th>
                <th className="px-4 py-3">Calls Made</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    No practice invoices generated yet. Click "Generate Monthly Invoice" above.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {inv.invoice_number || inv.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {inv.careflow_practices?.name || 'Doctor Practice'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {inv.careflow_practices?.code}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {inv.billing_period_start} to {inv.billing_period_end}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700 dark:text-slate-300">
                      {inv.enrolled_patients_count} pts
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700 dark:text-slate-300">
                      {inv.calls_completed_count} ({inv.additional_calls_count} extra)
                    </td>
                    <td className="px-4 py-3.5 font-bold text-sm text-slate-900 dark:text-white">
                      ₹{Number(inv.total_inr ?? inv.total_amount_inr ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold ${
                          (inv.payment_status ?? inv.status) === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {inv.payment_status ?? inv.status ?? 'unpaid'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/admin/careflow/practices/${inv.practice_id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-600 dark:text-teal-400">
                          View Practice
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Generate Practice Service Invoice
            </h3>
            <p className="text-xs text-slate-500">
              Calculate base subscription fee + extra call volume for the selected billing period.
            </p>

            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Doctor Practice *
                </label>
                <select
                  required
                  value={selectedPracticeId}
                  onChange={(e) => setSelectedPracticeId(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                >
                  {practices.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.practice_name} ({p.practice_code || p.lead_doctor_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Period Start *
                  </label>
                  <Input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Period End *
                  </label>
                  <Input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmitting ? 'Calculating...' : 'Generate Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
