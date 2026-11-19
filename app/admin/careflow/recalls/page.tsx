'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Heart,
  Activity,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  Stethoscope,
  TrendingUp,
  Users,
  TestTube2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function ChronicCareRecallPage() {
  const { selectedBranchId } = useBranch()
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Create Plan Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [planName, setPlanName] = useState('')
  const [conditionCategory, setConditionCategory] = useState('DIABETES')
  const [recallIntervalDays, setRecallIntervalDays] = useState(90)
  const [recommendedTests, setRecommendedTests] = useState('HbA1c, Fasting Blood Sugar')
  const [clinicalGuidance, setClinicalGuidance] = useState('')
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `?branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/careflow/recalls${branchParam}`)
      const data = await res.json()
      if (data.success) {
        setPlans(data.data.plans || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [selectedBranchId])

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingPlan(true)
    try {
      const res = await fetch('/api/v1/careflow/recalls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          conditionCategory,
          recallIntervalDays: Number(recallIntervalDays),
          recommendedTests: recommendedTests.split(',').map(t => t.trim()).filter(Boolean),
          clinicalGuidance,
          branchId: selectedBranchId !== 'all' ? selectedBranchId : null
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsCreateModalOpen(false)
        setPlanName('')
        setClinicalGuidance('')
        fetchPlans()
      } else {
        alert(data.error?.message || 'Failed to create recall plan')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmittingPlan(false)
    }
  }

  const filteredPlans = plans.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.plan_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.condition_category?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || p.condition_category?.toUpperCase() === categoryFilter.toUpperCase()
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumbs and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/careflow" className="hover:text-teal-600 transition-colors">CareFlow OS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Chronic Care Recall</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500" />
            Chronic Disease Recall & Continuity Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Proactively recall patients for periodic HbA1c, BP titration, Thyroid screening, and annual wellness checks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchPlans} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
            <Plus className="w-4 h-4" />
            New Recall Plan
          </Button>
        </div>
      </div>

      {/* Preset Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">DIABETES MELLITUS</div>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">Quarterly HbA1c</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Automatic 90-day recall with fasting glucose titration check.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">HYPERTENSION</div>
            <Heart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">Monthly BP Review</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            30-day home BP monitoring recall + medication compliance check.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-purple-800 dark:text-purple-300">THYROID DISORDERS</div>
            <TestTube2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">60/90-Day TSH Titration</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Recall for Thyroxine dose adjustments and lab panel.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">RESPIRATORY / COPD</div>
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">Bimonthly Inhaler Review</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Peak flow monitoring and seasonal flare prophylaxis.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search plans, clinical categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="DIABETES">Diabetes Mellitus</option>
            <option value="HYPERTENSION">Hypertension</option>
            <option value="THYROID">Thyroid / Endocrine</option>
            <option value="RESPIRATORY">Respiratory / Asthma</option>
            <option value="CARDIOVASCULAR">Cardiovascular</option>
            <option value="CUSTOM">Custom Protocols</option>
          </select>
        </div>
      </div>

      {/* Active Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Heart className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            No recall plans found. Create your first recall plan above.
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-semibold tracking-wide bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                    {plan.condition_category}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    Every {plan.recall_interval_days} Days
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-base">
                  {plan.plan_name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {plan.clinical_guidance || 'Routine clinical recall protocol for patient stabilization.'}
                </p>

                {/* Recommended Diagnostics */}
                {plan.recommended_tests && plan.recommended_tests.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1.5">Recommended Labs:</span>
                    <div className="flex flex-wrap gap-1">
                      {plan.recommended_tests.map((test: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  Auto-Enrolled: Active
                </span>
                <span className="text-[11px] text-teal-600 font-medium">
                  {plan.practice_id ? 'External Practice' : 'CAPSIC CARE In-House'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Plan Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-600" />
              Configure Chronic Recall Plan
            </h3>
            <p className="text-xs text-slate-500">
              Establish systematic clinical review cadences for chronic illness cohorts.
            </p>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Plan Name *
                </label>
                <Input
                  required
                  placeholder="E.g., Type 2 Diabetes Glycemic Control Review"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Clinical Category
                  </label>
                  <select
                    value={conditionCategory}
                    onChange={(e) => setConditionCategory(e.target.value)}
                    className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  >
                    <option value="DIABETES">Diabetes Mellitus</option>
                    <option value="HYPERTENSION">Hypertension</option>
                    <option value="THYROID">Thyroid / Endocrine</option>
                    <option value="RESPIRATORY">Respiratory / COPD / Asthma</option>
                    <option value="CARDIOVASCULAR">Cardiovascular / CAD</option>
                    <option value="RENAL">Chronic Kidney Disease</option>
                    <option value="CUSTOM">Custom Protocol</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Recall Cadence (Days) *
                  </label>
                  <Input
                    type="number"
                    required
                    min={7}
                    max={365}
                    value={recallIntervalDays}
                    onChange={(e) => setRecallIntervalDays(Number(e.target.value))}
                    className="text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Recommended Diagnostic Tests (Comma Separated)
                </label>
                <Input
                  placeholder="E.g., HbA1c, Fasting Blood Sugar, Urine Microalbumin"
                  value={recommendedTests}
                  onChange={(e) => setRecommendedTests(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Script & Follow-Up Guidance
                </label>
                <textarea
                  placeholder="Caller instructions: Inquire about morning hypoglycemic symptoms, diet compliance, refill needs..."
                  value={clinicalGuidance}
                  onChange={(e) => setClinicalGuidance(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingPlan}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isSubmittingPlan ? 'Saving...' : 'Save Recall Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
