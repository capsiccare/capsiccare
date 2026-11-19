'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  PhoneCall,
  User,
  Stethoscope,
  Building2,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Ambulance,
  HeartPulse,
  Flame,
  CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function ClinicalEscalationsPage() {
  const { selectedBranchId } = useBranch()
  const [escalations, setEscalations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [urgencyFilter, setUrgencyFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Resolution Modal
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(null)
  const [resolutionStatus, setResolutionStatus] = useState<'resolved' | 'under_review' | 'referred_to_emergency'>('resolved')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false)

  const fetchEscalations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/careflow/escalations')
      const data = await res.json()
      if (data.success) {
        setEscalations(data.data.escalations || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEscalations()
  }, [])

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEscalation) return
    setIsSubmittingResolution(true)

    try {
      const res = await fetch(`/api/v1/careflow/escalations/${selectedEscalation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: resolutionStatus,
          resolutionNotes: resolutionNotes
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSelectedEscalation(null)
        setResolutionNotes('')
        fetchEscalations()
      } else {
        alert(data.error?.message || 'Failed to update escalation')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmittingResolution(false)
    }
  }

  const filteredEscalations = escalations.filter((esc) => {
    const matchesSearch = searchQuery === '' ||
      esc.patients?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.patients?.uhid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.doctors?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || esc.status?.toUpperCase() === statusFilter.toUpperCase()
    const matchesUrgency = urgencyFilter === 'ALL' || esc.urgency?.toUpperCase() === urgencyFilter.toUpperCase()

    return matchesSearch && matchesStatus && matchesUrgency
  })

  const openCount = escalations.filter(e => e.status === 'open' || e.status === 'under_review').length
  const emergencyCount = escalations.filter(e => e.urgency === 'emergency' && e.status !== 'resolved').length

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/careflow" className="hover:text-teal-600 transition-colors">CareFlow OS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Clinical Safety Escalations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-red-600" />
            Clinical Safety & Adverse Symptom Escalations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Red-flag symptom monitoring, urgent doctor callbacks, and emergency referral auditing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchEscalations} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Emergency Protocol Guideline Banner */}
      <div className="p-4 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-500/10 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
            <Ambulance className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">
              CLINICAL EMERGENCY TRIAGE PROTOCOL ACTIVE
            </h4>
            <p className="text-xs text-red-700/90 dark:text-red-400/90 mt-0.5">
              If patient reports acute chest pain, radiating left arm numbness, sudden breathlessness, or stroke symptoms, instruct caller to immediately direct patient to the nearest emergency facility or call <strong>108 / 102</strong> ambulance dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase block">Active Emergencies</span>
            <span className="text-2xl font-bold text-red-700 dark:text-red-300">{emergencyCount}</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by patient, UHID, doctor, symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Status: All</option>
            <option value="OPEN">Open (Requires Action)</option>
            <option value="UNDER_REVIEW">Under Clinical Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REFERRED_TO_EMERGENCY">Referred to Emergency</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Urgency: All</option>
            <option value="EMERGENCY">Emergency (Red)</option>
            <option value="URGENT">Urgent (Amber)</option>
            <option value="ROUTINE">Routine Clinical</option>
          </select>
        </div>
      </div>

      {/* Escalations List */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Urgency & Date</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Category & Symptoms</th>
                <th className="px-4 py-3">Assigned Doctor</th>
                <th className="px-4 py-3">Flagged By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEscalations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    No clinical escalations matching your filters.
                  </td>
                </tr>
              ) : (
                filteredEscalations.map((esc) => {
                  const isEmergency = esc.urgency === 'emergency'
                  const isUrgent = esc.urgency === 'urgent'

                  return (
                    <tr key={esc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase ${
                            isEmergency
                              ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse'
                              : isUrgent
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {esc.urgency}
                        </Badge>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {new Date(esc.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {esc.patients?.full_name || 'Patient'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {esc.patients?.uhid ? `UHID: ${esc.patients.uhid}` : ''} • {esc.patients?.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase">
                          {esc.category?.replace(/_/g, ' ')}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {esc.description || esc.symptoms?.join(', ')}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {esc.doctors?.name ? `Dr. ${esc.doctors.name}` : 'Continuity Physician'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {esc.doctors?.specialty || 'General'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                        {esc.flagged_profile?.full_name || 'CareFlow Agent'}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-semibold ${
                            esc.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : esc.status === 'open'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {esc.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEscalation(esc)
                            setResolutionNotes(esc.resolution_notes || '')
                            setResolutionStatus(esc.status === 'open' ? 'resolved' : esc.status)
                          }}
                          className="h-7 text-xs border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Resolve / Action
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedEscalation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Resolve Clinical Escalation
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                Patient: {selectedEscalation.patients?.full_name} ({selectedEscalation.patients?.phone})
              </div>
              <div className="text-red-600 dark:text-red-400 font-semibold">
                Reported Category: {selectedEscalation.category?.replace(/_/g, ' ')} ({selectedEscalation.urgency?.toUpperCase()})
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Symptoms: {selectedEscalation.description || 'Adverse condition flagged during continuity call'}
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Resolution Outcome *
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e: any) => setResolutionStatus(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                >
                  <option value="resolved">Clinical Resolution Confirmed (Doctor consulted)</option>
                  <option value="under_review">Under Review / Patient Callback in Progress</option>
                  <option value="referred_to_emergency">Diverted / Referred to Emergency ER</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Action & Resolution Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="E.g., Dr. Roy contacted directly. Prescribed temporary antacid and scheduled emergency chamber review at 5:00 PM today. Patient stabilized."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedEscalation(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingResolution}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmittingResolution ? 'Saving...' : 'Submit Resolution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
