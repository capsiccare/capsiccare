'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  ClipboardList,
  PhoneCall,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Send,
  Building2,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function AdminStaffPage() {
  const { selectedBranchId, branches } = useBranch()
  const [activeTab, setActiveTab] = useState<'directory' | 'shifts' | 'attendance' | 'tasks' | 'campaigns'>('directory')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [staff, setStaff] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Modals
  const [isOnboardOpen, setIsOnboardOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)

  // Manage Roles Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedStaffMember, setSelectedStaffMember] = useState<any | null>(null)
  const [selectedStaffRoles, setSelectedStaffRoles] = useState<string[]>([])
  const [staffRoleBranchId, setStaffRoleBranchId] = useState<string>('')
  const [isSavingRoles, setIsSavingRoles] = useState(false)

  // Forms
  const [onboardForm, setOnboardForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'male' as 'male' | 'female' | 'other',
    role_name: 'receptionist',
    roles: ['receptionist'] as string[],
    branch_id: selectedBranchId || '',
    designation: 'Senior Receptionist',
    department: 'Reception & Front Desk',
    employee_id: '',
    joining_date: new Date().toISOString().split('T')[0],
  })

  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    role_name: 'phlebotomist',
    branch_id: selectedBranchId || '',
    designation: 'Field Phlebotomist',
    expires_in_days: 7,
  })

  const [shiftForm, setShiftForm] = useState({
    branch_id: selectedBranchId || '',
    staff_id: '',
    shift_date: new Date().toISOString().split('T')[0],
    shift_name: 'Morning OPD & Phlebotomy',
    start_time: '08:00',
    end_time: '16:00',
    is_weekly_off: false,
    notes: '',
  })

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'patient_call',
    priority: 'medium',
    assigned_to: '',
    branch_id: selectedBranchId || '',
    due_date: new Date().toISOString().split('T')[0],
  })

  const [callForm, setCallForm] = useState({
    campaign_id: '',
    patient_id: '',
    call_status: 'connected',
    outcome: 'appointment_booked',
    notes: '',
  })

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'directory') {
        const res = await fetch(`/api/v1/staff?search=${encodeURIComponent(search)}`)
        const data = await res.json()
        if (data.success) setStaff(data.data.staff || [])
      } else if (activeTab === 'shifts') {
        const res = await fetch(`/api/v1/staff/shifts?startDate=${selectedDate}&endDate=${selectedDate}&branchId=${selectedBranchId || ''}`)
        const data = await res.json()
        if (data.success) setShifts(data.data.shifts || [])
      } else if (activeTab === 'attendance') {
        const res = await fetch(`/api/v1/staff/attendance?date=${selectedDate}&branchId=${selectedBranchId || ''}`)
        const data = await res.json()
        if (data.success) setAttendance(data.data.attendance || [])
      } else if (activeTab === 'tasks') {
        const res = await fetch(`/api/v1/staff/tasks?branchId=${selectedBranchId || ''}`)
        const data = await res.json()
        if (data.success) setTasks(data.data.tasks || [])
      } else if (activeTab === 'campaigns') {
        const res = await fetch('/api/v1/staff/campaigns')
        const data = await res.json()
        if (data.success) setCampaigns(data.data.campaigns || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workforce data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab, selectedDate, selectedBranchId])

  const AVAILABLE_ROLES = [
    { id: 'receptionist', label: 'Receptionist / Front Desk', desc: 'OPD queue, bookings, patient intake' },
    { id: 'billing_staff', label: 'Billing & POS Staff', desc: 'Invoicing, receipts, payments & collections' },
    { id: 'phlebotomist', label: 'Phlebotomist', desc: 'Blood collection, home visits, accessioning' },
    { id: 'lab_staff', label: 'Lab Technician', desc: 'Sample testing, pathology reports entry' },
    { id: 'nurse', label: 'Nurse / Triage', desc: 'Vitals, consultation prep, patient care' },
    { id: 'calling_executive', label: 'Calling Executive', desc: 'Patient recall, tele-follow-ups, campaigns' },
    { id: 'branch_admin', label: 'Branch Admin', desc: 'Roster scheduling, local branch oversight' },
  ]

  const openRoleManager = (member: any) => {
    setSelectedStaffMember(member)
    const currentRoles = (member.roles || []).map((r: any) => r.role)
    setSelectedStaffRoles(currentRoles.length > 0 ? currentRoles : ['receptionist'])
    setStaffRoleBranchId(member.roles?.[0]?.branchId || selectedBranchId || '')
    setIsRoleModalOpen(true)
  }

  const handleToggleStaffRole = (roleId: string) => {
    setSelectedStaffRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    )
  }

  const handleToggleOnboardRole = (roleId: string) => {
    setOnboardForm((prev) => {
      const exists = prev.roles.includes(roleId)
      const newRoles = exists ? prev.roles.filter((r) => r !== roleId) : [...prev.roles, roleId]
      return {
        ...prev,
        roles: newRoles.length > 0 ? newRoles : [roleId],
        role_name: newRoles[0] || roleId,
      }
    })
  }

  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaffMember) return
    if (selectedStaffRoles.length === 0) {
      alert('Please assign at least one role to the staff member.')
      return
    }
    setIsSavingRoles(true)
    try {
      const res = await fetch(`/api/v1/staff/${selectedStaffMember.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles: selectedStaffRoles,
          branch_id: staffRoleBranchId || undefined,
        }),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setIsRoleModalOpen(false)
        await fetchData()
      } else {
        alert(result.error?.message || 'Failed to update roles')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSavingRoles(false)
    }
  }

  // Submissions
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...onboardForm,
          roles: onboardForm.roles,
          role_name: onboardForm.roles[0] || 'receptionist',
        }),
      })
      const result = await res.json()
      if (result.success) {
        setIsOnboardOpen(false)
        fetchData()
      } else {
        alert(result.error?.message || 'Failed to onboard staff')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/staff/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      const result = await res.json()
      if (result.success) {
        alert(`Invitation link issued! Token: ${result.data.invitation_token}`)
        setIsInviteOpen(false)
      } else {
        alert(result.error?.message || 'Failed to issue invitation')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/staff/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftForm),
      })
      const result = await res.json()
      if (result.success) {
        setIsShiftModalOpen(false)
        fetchData()
      } else {
        alert(result.error?.message || 'Failed to schedule shift')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/staff/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      })
      const result = await res.json()
      if (result.success) {
        setIsTaskModalOpen(false)
        fetchData()
      } else {
        alert(result.error?.message || 'Failed to create task')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/v1/staff/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: 'completed',
          completion_notes: 'Completed by staff supervisor',
        }),
      })
      const result = await res.json()
      if (result.success) fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleClockAction = async (action: 'clock_in' | 'clock_out', staffId: string) => {
    try {
      const res = await fetch('/api/v1/staff/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          branch_id: selectedBranchId || branches[0]?.id,
          action,
        }),
      })
      const result = await res.json()
      if (result.success) {
        fetchData()
      } else {
        alert(result.error?.message || 'Clock action failed')
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
              Workforce Management & Operations
            </h1>
            <Badge className="bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 text-xs font-semibold">
              Step 07 Live
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Internal clinical staff directory, invitations, shift rosters, attendance clocking, task boards, and calling campaigns.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 text-xs h-9 border-slate-300 dark:border-slate-700"
          >
            <Send className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Invite Staff
          </Button>
          <Button
            onClick={() => setIsOnboardOpen(true)}
            className="flex items-center gap-1.5 text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Onboard Member
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'directory'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Directory
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'shifts'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Shifts & Rosters
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Attendance & Clocking
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Operational Tasks
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          Outreach Campaigns
        </button>
      </div>

      {/* Tab 1: Staff Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search staff by name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                className="pl-9 text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="h-9 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Emp ID</th>
                    <th className="py-3 px-4 font-semibold">Staff Member</th>
                    <th className="py-3 px-4 font-semibold">Designation & Dept</th>
                    <th className="py-3 px-4 font-semibold">Assigned Roles</th>
                    <th className="py-3 px-4 font-semibold">Branch</th>
                    <th className="py-3 px-4 font-semibold">MFA</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No staff members found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    staff.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {member.employeeId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{member.fullName}</div>
                          <div className="text-slate-500 dark:text-slate-400">{member.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 dark:text-slate-200">{member.designation}</div>
                          <div className="text-slate-400 text-[11px]">{member.department}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {member.roles.map((r: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[10px] uppercase font-mono py-0">
                                {r.role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {member.roles[0]?.branchName || 'All Branches'}
                        </td>
                        <td className="py-3 px-4">
                          {member.mfaEnabled ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Standard</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px]">
                            {member.employmentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleManager(member)}
                            className="h-7 text-xs flex items-center gap-1.5 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 ml-auto"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Manage Roles
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shifts & Rosters */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Date:</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>
            <Button
              onClick={() => setIsShiftModalOpen(true)}
              className="h-9 text-xs flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Shift
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                No shifts scheduled for {selectedDate}. Click &quot;Schedule Shift&quot; to assign clinical staff.
              </div>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {shift.profiles?.full_name || 'Staff Member'}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {shift.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      {shift.start_time} — {shift.end_time} ({shift.shift_name})
                    </span>
                  </div>
                  {shift.notes && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                      {shift.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Attendance & Clocking */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Date:</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing attendance log for {selectedDate}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Staff Member</th>
                  <th className="py-3 px-4 font-semibold">Clock In</th>
                  <th className="py-3 px-4 font-semibold">Clock Out</th>
                  <th className="py-3 px-4 font-semibold">Punctuality</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No attendance clocked for this date.
                    </td>
                  </tr>
                ) : (
                  attendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {rec.profiles?.full_name || 'Staff Member'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {rec.clock_in ? new Date(rec.clock_in).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {rec.clock_out ? new Date(rec.clock_out).toLocaleTimeString() : 'In Progress'}
                      </td>
                      <td className="py-3 px-4">
                        {rec.late_minutes > 0 ? (
                          <span className="text-amber-600 font-medium">Late ({rec.late_minutes}m)</span>
                        ) : (
                          <span className="text-emerald-600">On Time</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {!rec.clock_out && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClockAction('clock_out', rec.staff_id)}
                            className="h-7 text-xs border-slate-300"
                          >
                            Clock Out
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

      {/* Tab 4: Operational Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Filter Category:</span>
              <select
                value={taskCategoryFilter}
                onChange={(e) => setTaskCategoryFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="all">All Categories</option>
                <option value="patient_call">Patient Call</option>
                <option value="appointment_confirmation">Appointment Confirmation</option>
                <option value="sample_coordination">Sample Coordination</option>
                <option value="report_delivery">Report Delivery</option>
                <option value="complaint_resolution">Complaint Resolution</option>
              </select>
            </div>
            <Button
              onClick={() => setIsTaskModalOpen(true)}
              className="h-9 text-xs flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks
              .filter((t) => taskCategoryFilter === 'all' || t.category === taskCategoryFilter)
              .map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-400">{t.task_number}</span>
                      <Badge
                        className={`text-[10px] uppercase font-mono ${
                          t.priority === 'urgent' || t.priority === 'high'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {t.priority}
                      </Badge>
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{t.title}</div>
                    {t.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                    )}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Assigned: <span className="font-medium text-slate-700 dark:text-slate-300">{t.assigned_profile?.full_name || 'Staff'}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {t.status.replace('_', ' ')}
                    </Badge>
                    {t.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(t.id)}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 5: Outreach Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 shadow-xs"
              >
                <div className="text-xs font-mono text-teal-600 dark:text-teal-400">{camp.campaign_code}</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{camp.name}</div>
                <div className="text-xs text-slate-500">{camp.objective}</div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between text-xs">
                  <span>Calls: {camp.completed_calls}</span>
                  <span className="font-semibold text-emerald-600">Conv: {camp.conversions_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onboard Modal */}
      {isOnboardOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Onboard Clinical / Administrative Staff</h3>
            <form onSubmit={handleOnboardSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <Input
                  required
                  value={onboardForm.full_name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, full_name: e.target.value })}
                  className="text-xs h-9 mt-1"
                  placeholder="e.g. Dr. Ramesh Ghosh / Priya Sen"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone</label>
                  <Input
                    required
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    className="text-xs h-9 mt-1"
                    placeholder="10-digit number"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Input
                    type="email"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="text-xs h-9 mt-1"
                    placeholder="official email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Branch</label>
                  <select
                    value={onboardForm.branch_id}
                    onChange={(e) => setOnboardForm({ ...onboardForm, branch_id: e.target.value })}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Department</label>
                  <Input
                    value={onboardForm.department}
                    onChange={(e) => setOnboardForm({ ...onboardForm, department: e.target.value })}
                    className="text-xs h-9 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Roles (Select 1 or more roles) *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  {AVAILABLE_ROLES.map((r) => {
                    const isChecked = onboardForm.roles.includes(r.id)
                    return (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-teal-50/80 border-teal-300 dark:bg-teal-950/40 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-medium'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleOnboardRole(r.id)}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div className="leading-tight">
                          <div>{r.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{r.desc}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Designation</label>
                <Input
                  required
                  value={onboardForm.designation}
                  onChange={(e) => setOnboardForm({ ...onboardForm, designation: e.target.value })}
                  className="text-xs h-9 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOnboardOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Save & Onboard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Roles Modal */}
      {isRoleModalOpen && selectedStaffMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  Manage Staff Roles & Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedStaffMember.fullName} ({selectedStaffMember.employeeId || 'Staff Member'})
                </p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoles} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Operational Roles (Select multiple to grant combined duties):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  {AVAILABLE_ROLES.map((r) => {
                    const isChecked = selectedStaffRoles.includes(r.id)
                    return (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-teal-50 border-teal-400 dark:bg-teal-950/60 dark:border-teal-700 text-teal-950 dark:text-teal-200 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStaffRole(r.id)}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div>
                          <div className="font-semibold">{r.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Operational Branch
                </label>
                <select
                  value={staffRoleBranchId}
                  onChange={(e) => setStaffRoleBranchId(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="">All Branches / Global Organization</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Assigning multiple roles allows this staff member to operate across front-desk intake, billing counter, phlebotomy tracking, and clinical triage without account switching.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingRoles}
                  className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSavingRoles ? 'Saving Roles...' : 'Save Role Assignments'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Send Staff Invitation</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Candidate Email</label>
                <Input
                  required
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="text-xs h-9 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Candidate Full Name</label>
                <Input
                  required
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  className="text-xs h-9 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone</label>
                  <Input
                    required
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    className="text-xs h-9 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    value={inviteForm.role_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, role_name: e.target.value })}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                  >
                    <option value="receptionist">receptionist</option>
                    <option value="nurse">nurse</option>
                    <option value="phlebotomist">phlebotomist</option>
                    <option value="lab_staff">lab_staff</option>
                    <option value="billing_staff">billing_staff</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Generate Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Schedule Clinical Shift</h3>
            <form onSubmit={handleShiftSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Select Staff</label>
                <select
                  required
                  value={shiftForm.staff_id}
                  onChange={(e) => setShiftForm({ ...shiftForm, staff_id: e.target.value })}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                >
                  <option value="">-- Choose Member --</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                  <Input
                    type="time"
                    value={shiftForm.start_time}
                    onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                    className="text-xs h-9 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">End Time</label>
                  <Input
                    type="time"
                    value={shiftForm.end_time}
                    onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                    className="text-xs h-9 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Shift Name</label>
                <Input
                  value={shiftForm.shift_name}
                  onChange={(e) => setShiftForm({ ...shiftForm, shift_name: e.target.value })}
                  className="text-xs h-9 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsShiftModalOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Create Operational Task</h3>
            <form onSubmit={handleTaskSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Task Title</label>
                <Input
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="text-xs h-9 mt-1"
                  placeholder="e.g. Call patient for fasting instructions"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                  >
                    <option value="patient_call">Patient Call</option>
                    <option value="appointment_confirmation">Appointment Confirmation</option>
                    <option value="sample_coordination">Sample Coordination</option>
                    <option value="report_delivery">Report Delivery</option>
                    <option value="complaint_resolution">Complaint Resolution</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Assign To Staff Member</label>
                <select
                  required
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                >
                  <option value="">-- Choose Assignee --</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Assign Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
