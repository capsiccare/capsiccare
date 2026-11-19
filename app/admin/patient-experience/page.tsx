'use client'

import React, { useState, useEffect } from 'react'
import {
  HeartHandshake,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Send,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function AdminPatientExperiencePage() {
  const { selectedBranchId, branches } = useBranch()
  const [activeTab, setActiveTab] = useState<'feedback' | 'complaints' | 'automation'>('feedback')
  const [loading, setLoading] = useState(false)

  // Data
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  // Filters
  const [feedbackNegativeOnly, setFeedbackNegativeOnly] = useState(false)
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all')

  // Modals
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Form
  const [feedbackForm, setFeedbackForm] = useState({
    branch_id: selectedBranchId || '',
    patient_id: '',
    rating_overall: 5,
    rating_doctor: 5,
    rating_reception: 5,
    rating_waiting_time: 5,
    feedback_category: 'general',
    comments: '',
  })

  const [complaintForm, setComplaintForm] = useState({
    branch_id: selectedBranchId || '',
    patient_id: '',
    category: 'delayed_service' as 'clinical_quality' | 'billing_dispute' | 'delayed_service' | 'staff_behavior' | 'report_error' | 'facility_hygiene' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
  })

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/patient-experience/feedback?negativeOnly=${feedbackNegativeOnly}&branchId=${selectedBranchId || ''}`)
      const data = await res.json()
      if (data.success) setFeedbackList(data.data.feedback || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/patient-experience/complaints?branchId=${selectedBranchId || ''}${complaintStatusFilter !== 'all' ? `&status=${complaintStatusFilter}` : ''}`)
      const data = await res.json()
      if (data.success) setComplaints(data.data.complaints || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchAutomation = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/automation/rules')
      const data = await res.json()
      if (data.success) {
        setRules(data.data.rules || [])
        setLogs(data.data.logs || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'feedback') fetchFeedback()
    if (activeTab === 'complaints') fetchComplaints()
    if (activeTab === 'automation') fetchAutomation()
  }, [activeTab, feedbackNegativeOnly, complaintStatusFilter, selectedBranchId])

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Find patient ID or fallback to first available
      const pRes = await fetch('/api/v1/admin/patients?limit=1')
      const pData = await pRes.json()
      const patId = pData.data?.patients?.[0]?.id

      if (!patId) {
        alert('No registered patient found to associate feedback with')
        return
      }

      const res = await fetch('/api/v1/patient-experience/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackForm,
          branch_id: selectedBranchId || branches[0]?.id,
          patient_id: patId,
        }),
      })

      const result = await res.json()
      if (result.success) {
        if (result.data.autoEscalated) {
          alert(`Rating < 3 auto-escalated! Generated Complaint Ticket #${result.data.ticketNumber}`)
        }
        setIsFeedbackModalOpen(false)
        fetchFeedback()
      } else {
        alert(result.error?.message || 'Failed to submit feedback')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedComplaint) return

    try {
      const res = await fetch('/api/v1/patient-experience/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedComplaint.id,
          status: 'resolved',
          resolution_notes: resolutionNotes,
        }),
      })

      const result = await res.json()
      if (result.success) {
        setIsResolveModalOpen(false)
        fetchComplaints()
      } else {
        alert(result.error?.message || 'Failed to update complaint')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Patient Experience & Grievance Desk
            </h1>
            <Badge className="bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 text-xs font-semibold">
              CSAT & SLA Live
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            5-star CSAT ratings, low score auto-escalation, grievance ticketing with SLA targets, and event automation rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
          >
            <Star className="w-3.5 h-3.5" />
            Record CSAT Feedback
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4" />
          CSAT Ratings & Feedback
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'complaints'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Complaints & Grievances Desk
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'automation'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Automation Engine & Logs
        </button>
      </div>

      {/* Tab 1: CSAT Feedback */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={feedbackNegativeOnly}
                onChange={(e) => setFeedbackNegativeOnly(e.target.checked)}
                className="rounded"
              />
              <span>Show Negative Escalations Only (&lt; 3 Stars)</span>
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchFeedback}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feedback
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbackList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                No patient feedback submissions recorded yet.
              </div>
            ) : (
              feedbackList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {item.patients?.full_name || 'Patient'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{item.rating_overall} / 5</span>
                    </div>
                  </div>

                  {item.comments && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg leading-relaxed">
                      &quot;{item.comments}&quot;
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <div>Doctor: {item.rating_doctor || '—'}/5</div>
                    <div>Frontdesk: {item.rating_reception || '—'}/5</div>
                    <div>Wait: {item.rating_waiting_time || '—'}/5</div>
                  </div>

                  {item.is_negative_escalated && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-semibold pt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Auto-Escalated to Branch Supervisor
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Complaints Desk */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Status:</span>
              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="all">All Complaints</option>
                <option value="open">Open</option>
                <option value="in_investigation">In Investigation</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchComplaints}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Ticket #</th>
                  <th className="py-3 px-4 font-semibold">Patient</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">SLA Target</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No complaints or grievance tickets registered.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {c.ticket_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{c.patients?.full_name}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{c.patients?.uhid}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-700 dark:text-slate-300">
                        {c.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`text-[10px] uppercase font-mono ${
                            c.priority === 'critical' || c.priority === 'high'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {c.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {c.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(c.resolution_target_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {c.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {c.status !== 'resolved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedComplaint(c)
                              setIsResolveModalOpen(true)
                            }}
                            className="h-7 text-xs border-teal-300 text-teal-700 dark:text-teal-400"
                          >
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Automation Engine */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Active Healthcare Automation Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                      {rule.code}
                    </span>
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                      Active
                    </Badge>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{rule.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Trigger: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{rule.trigger_event}</code></span>
                    <span>→</span>
                    <span>Action: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{rule.action_type}</code></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Recent Execution Logs
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Event</th>
                    <th className="py-2.5 px-4">Entity</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Result Summary</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-4 font-mono font-medium">{log.event_name}</td>
                      <td className="py-2.5 px-4 capitalize">{log.entity_type}</td>
                      <td className="py-2.5 px-4">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{log.result_summary}</td>
                      <td className="py-2.5 px-4 text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Record Patient CSAT Feedback</h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Overall Rating (1 to 5 Stars)</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating_overall: star })}
                      className={`p-2 rounded-lg border text-sm font-bold flex items-center gap-1 ${
                        feedbackForm.rating_overall >= star
                          ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Comments & Observations</label>
                <textarea
                  rows={3}
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder="Patient remarks regarding doctor consultation, waiting time, or receptionist behavior..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                />
              </div>

              {feedbackForm.rating_overall < 3 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Ratings below 3 stars will automatically generate an escalated grievance ticket for clinic supervisors.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFeedbackModalOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Submit Feedback
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Complaint Modal */}
      {isResolveModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Resolve Ticket: {selectedComplaint.ticket_number}
            </h3>
            <form onSubmit={handleResolveComplaint} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Resolution Summary & Action Taken</label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Details of patient contact, explanation provided, refund or corrective action taken..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsResolveModalOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  Mark as Resolved
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
