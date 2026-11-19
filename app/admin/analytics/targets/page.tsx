'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Building2,
  Calendar,
  Percent,
  CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function BusinessTargetsPage() {
  const { selectedBranchId } = useBranch()
  const [targets, setTargets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Create Target Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetMetric, setTargetMetric] = useState('monthly_revenue')
  const [targetValue, setTargetValue] = useState<number>(500000)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTargets = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `?branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/analytics/targets${branchParam}`)
      const json = await res.json()
      if (json.success) {
        setTargets(json.data.targets || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTargets()

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    setPeriodStart(firstDay)
    setPeriodEnd(lastDay)
  }, [selectedBranchId])

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/analytics/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: selectedBranchId !== 'all' ? selectedBranchId : null,
          target_metric: targetMetric,
          period_start: periodStart,
          period_end: periodEnd,
          target_value: Number(targetValue),
          notes
        })
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setIsModalOpen(false)
        fetchTargets()
      } else {
        alert(json.error?.message || 'Failed to create target')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Business Targets & Budgets</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Target className="w-7 h-7 text-indigo-600" />
            Operational Targets, Budgets & Goal Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative management targets vs actual operational performance with variance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchTargets} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4" />
            Set New Target
          </Button>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {targets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Target className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            No business targets configured. Click "Set New Target" above to establish operational benchmarks.
          </div>
        ) : (
          targets.map((target) => {
            const pct = Math.min(100, Math.max(0, target.achievement_percentage || 0))
            const isRevenue = target.target_metric.includes('revenue') || target.target_metric.includes('collection')

            return (
              <div
                key={target.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono uppercase bg-slate-50 dark:bg-slate-800">
                      {target.target_metric.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {target.branches?.name || 'All Branches'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-semibold text-slate-500">Target Value:</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {isRevenue ? `₹${Number(target.target_value).toLocaleString('en-IN')}` : `${target.target_value} units`}
                    </div>
                  </div>

                  <div className="mt-2 text-xs flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Achieved:</span>
                    <span className="font-bold">
                      {isRevenue ? `₹${Number(target.actual_value).toLocaleString('en-IN')}` : `${target.actual_value}`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-500">Achievement</span>
                      <span className={pct >= 100 ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold'}>
                        {target.achievement_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Period: {target.period_start} to {target.period_end}</span>
                  <Badge variant="outline" className={target.is_achieved ? 'text-emerald-600' : 'text-amber-600'}>
                    {target.is_achieved ? 'Achieved' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Set Target Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Configure Business Target
            </h3>

            <form onSubmit={handleCreateTarget} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Metric *
                </label>
                <select
                  value={targetMetric}
                  onChange={(e) => setTargetMetric(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                >
                  <option value="monthly_revenue">Monthly Revenue (Billed)</option>
                  <option value="monthly_collections">Monthly Collections (Cash + UPI + Card)</option>
                  <option value="opd_visits">Consultation Visits Completed</option>
                  <option value="diagnostic_orders">Diagnostic Orders Placed</option>
                  <option value="new_patients">New Patient Acquisition</option>
                  <option value="patient_satisfaction">Patient Satisfaction SLA (%)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Value *
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="text-sm font-mono"
                />
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

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes / Strategy Context
                </label>
                <textarea
                  placeholder="E.g., Targeted expansion for local preventive wellness drive..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSubmitting ? 'Saving...' : 'Save Target'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
