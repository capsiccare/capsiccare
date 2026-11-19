'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Search,
  Filter,
  Plus,
  RefreshCw,
  User,
  Building2,
  Calendar,
  Lock,
  Unlock,
  UserCheck,
  XCircle,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function CareflowTasksPage() {
  const { selectedBranchId } = useBranch()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false)
  const [selectedTaskForReassign, setSelectedTaskForReassign] = useState<any | null>(null)
  const [reassignUserId, setReassignUserId] = useState('')
  const [reassignReason, setReassignReason] = useState('')

  // New Task Form
  const [newTaskPatientUhid, setNewTaskPatientUhid] = useState('')
  const [newTaskType, setNewTaskType] = useState('POST_CONSULTATION_3DAY')
  const [newTaskPriority, setNewTaskPriority] = useState('NORMAL')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskPracticeId, setNewTaskPracticeId] = useState('')
  const [newTaskDoctorId, setNewTaskDoctorId] = useState('')
  const [newTaskContext, setNewTaskContext] = useState('')
  const [isSubmittingNewTask, setIsSubmittingNewTask] = useState(false)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/careflow/tasks?limit=100&search=${encodeURIComponent(searchQuery)}${branchParam}`)
      const data = await res.json()
      if (data.success) {
        setTasks(data.data.tasks || [])
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [selectedBranchId])

  const handleClaim = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/careflow/tasks/${taskId}/claim`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        fetchTasks()
      } else {
        alert(data.error?.message || data.data?.message || 'Failed to claim task')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleRelease = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/careflow/tasks/${taskId}/release`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        fetchTasks()
      } else {
        alert(data.error?.message || 'Failed to release task')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTaskForReassign) return

    try {
      const res = await fetch(`/api/v1/careflow/tasks/${selectedTaskForReassign.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigneeId: reassignUserId || null,
          reason: reassignReason
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsReassignModalOpen(false)
        setSelectedTaskForReassign(null)
        setReassignUserId('')
        setReassignReason('')
        fetchTasks()
      } else {
        alert(data.error?.message || 'Failed to reassign task')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingNewTask(true)
    try {
      const res = await fetch('/api/v1/careflow/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientUhid: newTaskPatientUhid,
          taskType: newTaskType,
          priority: newTaskPriority,
          scheduledDueDate: newTaskDueDate || new Date().toISOString(),
          practiceId: newTaskPracticeId || null,
          doctorId: newTaskDoctorId || null,
          clinicalContext: { note: newTaskContext }
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsCreateModalOpen(false)
        setNewTaskPatientUhid('')
        setNewTaskContext('')
        fetchTasks()
      } else {
        alert(data.error?.message || 'Failed to create task')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmittingNewTask(false)
    }
  }

  // Filter calculations
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.task_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patient_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patient_uhid?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || t.status?.toUpperCase() === statusFilter.toUpperCase()
    const matchesType = typeFilter === 'ALL' || t.task_type?.toUpperCase() === typeFilter.toUpperCase()
    const matchesPriority = priorityFilter === 'ALL' || t.priority?.toUpperCase() === priorityFilter.toUpperCase()

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    claimed: tasks.filter(t => t.status === 'CLAIMED').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => new Date(t.scheduled_due_date) < new Date() && t.status !== 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/careflow" className="hover:text-teal-600 transition-colors">CareFlow OS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Task Management Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-teal-600" />
            Follow-Up & Continuity Task Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized queue with safe concurrency locks, multi-tier priorities, and SLA tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchTasks} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/careflow/calls">
            <Button variant="outline" size="sm" className="gap-1.5 border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              Calling Workspace
            </Button>
          </Link>

          <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4" />
            Create Ad-Hoc Task
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500">Total Work Items</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending Execution</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{stats.pending}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Locked / Claimed</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">{stats.claimed}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="text-xs font-medium text-red-700 dark:text-red-400">Overdue SLA</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{stats.overdue}</div>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Completed</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{stats.completed}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by UHID, patient name, phone, task #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="CLAIMED">Claimed / In-Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Type: All</option>
            <option value="POST_CONSULTATION_3DAY">Post-Consult 3-Day</option>
            <option value="CHRONIC_RECALL">Chronic Recall</option>
            <option value="MEDICATION_REFILL">Medication Refill</option>
            <option value="DIAGNOSTIC_FOLLOWUP">Diagnostic Follow-up</option>
            <option value="MISSED_APPOINTMENT">Missed Appointment</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">Priority: All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Task # / Type</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Practice / Doctor</th>
                <th className="px-4 py-3">Due Date / SLA</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Lock & Assignment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isOverdue = new Date(t.scheduled_due_date) < new Date() && t.status !== 'COMPLETED'
                  const isClaimed = t.status === 'CLAIMED'

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-xs font-medium text-slate-900 dark:text-slate-200">
                          {t.task_number || t.id.slice(0, 8)}
                        </div>
                        <Badge variant="outline" className="text-[10px] mt-1 font-medium bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                          {t.task_type?.replace(/_/g, ' ')}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {t.patient_name || 'Patient'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {t.patient_uhid ? `UHID: ${t.patient_uhid}` : ''} {t.patient_phone ? `• ${t.patient_phone}` : ''}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-300">
                          {t.practice_name || (t.practice_id ? 'External Practice' : 'CAPSIC CARE Clinic')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.doctor_name ? `Dr. ${t.doctor_name}` : 'General Continuity'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className={`text-xs font-medium flex items-center gap-1.5 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(t.scheduled_due_date).toLocaleDateString()}
                        </div>
                        {isOverdue && (
                          <span className="inline-block text-[10px] text-red-500 font-semibold mt-0.5">
                            Overdue SLA
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold uppercase ${
                            t.priority === 'URGENT'
                              ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800 animate-pulse'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {t.priority}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        {isClaimed ? (
                          <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Claimed</span>
                            {t.claim_expires_at && (
                              <span className="text-[10px] text-slate-500">
                                ({new Date(t.claim_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            )}
                          </div>
                        ) : t.status === 'COMPLETED' ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unassigned</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {t.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
                            onClick={() => handleClaim(t.id)}
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Claim
                          </Button>
                        )}

                        {t.status === 'CLAIMED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                            onClick={() => handleRelease(t.id)}
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Release
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-slate-600 dark:text-slate-400"
                          onClick={() => {
                            setSelectedTaskForReassign(t)
                            setIsReassignModalOpen(true)
                          }}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Reassign
                        </Button>

                        <Link href="/admin/careflow/calls">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300"
                          >
                            <PhoneCall className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {isReassignModalOpen && selectedTaskForReassign && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Reassign Task
            </h3>
            <p className="text-xs text-slate-500">
              Task #{selectedTaskForReassign.task_number || selectedTaskForReassign.id.slice(0, 8)} for patient {selectedTaskForReassign.patient_name || 'Patient'}
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign To (Staff / Caller ID)
                </label>
                <Input
                  placeholder="Enter user UUID or email or leave blank to unassign"
                  value={reassignUserId}
                  onChange={(e) => setReassignUserId(e.target.value)}
                  className="text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Reassignment
                </label>
                <textarea
                  placeholder="E.g., Caller on leave, language matching required, clinical escalation..."
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsReassignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Confirm Reassignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Ad-Hoc Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              Create Ad-Hoc Follow-Up Task
            </h3>
            <p className="text-xs text-slate-500">
              Schedule a manual recovery check, chronic recall, or post-appointment check-in.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Patient UHID / ID *
                </label>
                <Input
                  required
                  placeholder="E.g., UHID-2026-0001 or Patient UUID"
                  value={newTaskPatientUhid}
                  onChange={(e) => setNewTaskPatientUhid(e.target.value)}
                  className="text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Task Type
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  >
                    <option value="POST_CONSULTATION_3DAY">Post-Consultation 3-Day</option>
                    <option value="CHRONIC_RECALL">Chronic Care Recall</option>
                    <option value="MEDICATION_REFILL">Medication Refill Alert</option>
                    <option value="DIAGNOSTIC_FOLLOWUP">Diagnostic Follow-up</option>
                    <option value="MISSED_APPOINTMENT">Missed Appointment</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  >
                    <option value="URGENT">Urgent (Red)</option>
                    <option value="HIGH">High (Amber)</option>
                    <option value="NORMAL">Normal (Blue)</option>
                    <option value="LOW">Low (Gray)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Scheduled Due Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Context & Caller Notes
                </label>
                <textarea
                  placeholder="E.g., Dr. Roy advised checking on BP stabilization after 3 days of Telmisartan..."
                  value={newTaskContext}
                  onChange={(e) => setNewTaskContext(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingNewTask}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmittingNewTask ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
