'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PhoneCall,
  Phone,
  PhoneForwarded,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  AlertCircle,
  Stethoscope,
  Building2,
  FileText,
  User,
  Heart,
  ExternalLink,
  ChevronRight,
  Languages,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/lib/context/branch-context'

export default function TeleCallerWorkspacePage() {
  const { selectedBranchId } = useBranch()
  const [activeQueue, setActiveQueue] = useState<'my' | 'today' | 'overdue' | 'callbacks' | 'all'>('today')
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Script Guidance State
  const [scriptLang, setScriptLang] = useState<'en' | 'bn' | 'hi'>('en')

  // Disposition Form State
  const [callStatus, setCallStatus] = useState<any>('connected')
  const [outcome, setOutcome] = useState<any>('patient_doing_well')
  const [callNotes, setCallNotes] = useState('')
  const [callbackDateTime, setCallbackDateTime] = useState('')
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false)

  // Clinical Escalation Modal
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [escalateUrgency, setEscalateUrgency] = useState<'routine' | 'urgent' | 'emergency'>('urgent')
  const [escalateCategory, setEscalateCategory] = useState<string>('worsening_symptoms')
  const [escalateDescription, setEscalateDescription] = useState('')
  const [escalateSymptoms, setEscalateSymptoms] = useState('')
  const [isSubmittingEscalation, setIsSubmittingEscalation] = useState(false)

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `&branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/careflow/tasks?queue=${activeQueue}&search=${encodeURIComponent(searchQuery)}${branchParam}`)
      const data = await res.json()
      if (data.success) {
        setTasks(data.data.tasks || [])
        if (data.data.tasks?.length > 0 && !selectedTask) {
          setSelectedTask(data.data.tasks[0])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
  }, [activeQueue, selectedBranchId])

  const handleClaimTask = async (task: any) => {
    try {
      const res = await fetch(`/api/v1/careflow/tasks/${task.id}/claim`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        setSelectedTask({ ...task, claimed_by: 'current_user', status: 'claimed' })
        fetchQueue()
      } else {
        alert(data.error?.message || data.data?.message || 'Failed to claim task')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleReleaseTask = async (task: any) => {
    try {
      await fetch(`/api/v1/careflow/tasks/${task.id}/release`, { method: 'POST' })
      fetchQueue()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSaveDisposition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return

    setIsSubmittingOutcome(true)
    try {
      const res = await fetch('/api/v1/careflow/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: selectedTask.id,
          patient_id: selectedTask.patient_id,
          practice_id: selectedTask.practice_id,
          call_status: callStatus,
          outcome,
          notes: callNotes,
          callback_scheduled_at: outcome === 'callback_requested' && callbackDateTime ? callbackDateTime : undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setCallNotes('')
        setCallbackDateTime('')
        await fetchQueue()
        // Automatically advance to next pending task in queue
        const remaining = tasks.filter((t) => t.id !== selectedTask.id)
        setSelectedTask(remaining[0] || null)
        alert('Call disposition logged successfully!')
      } else {
        alert(data.error?.message || 'Failed to log call outcome')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmittingOutcome(false)
    }
  }

  const handleSaveEscalation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return
    setIsSubmittingEscalation(true)
    try {
      const res = await fetch('/api/v1/careflow/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedTask.patient_id,
          doctor_id: selectedTask.doctor_id,
          practice_id: selectedTask.practice_id,
          branch_id: selectedTask.branch_id,
          task_id: selectedTask.id,
          urgency: escalateUrgency,
          category: escalateCategory,
          description: escalateDescription,
          patient_reported_symptoms: escalateSymptoms,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsEscalateModalOpen(false)
        setEscalateDescription('')
        setEscalateSymptoms('')
        setOutcome('escalated_to_doctor')
        fetchQueue()
        alert('Clinical escalation logged! Doctor notified for review.')
      } else {
        alert(data.error?.message || 'Failed to escalate')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmittingEscalation(false)
    }
  }

  // Multilingual Guidance Scripts
  const scripts = {
    en: {
      greeting: `Hello, good morning/afternoon. Am I speaking with ${selectedTask?.patients?.full_name || 'the patient'}? I am calling from CAPSIC CARE on behalf of Dr. ${selectedTask?.doctors?.name || 'your consulting physician'}.`,
      checkin: `We are doing a routine health recovery check-in following your consultation. How are you feeling today? Have you started your prescribed medications?`,
      recall: `This is your scheduled quarterly chronic wellness recall for ${selectedTask?.notes || 'your follow-up care plan'}. Dr. ${selectedTask?.doctors?.name || 'the doctor'} has recommended a routine review and laboratory check this month.`,
      closing: `Thank you for choosing CAPSIC CARE. We wish you speedy health and wellness!`,
    },
    bn: {
      greeting: `নমস্কার। আমি কি ${selectedTask?.patients?.full_name || 'রোগী'}-এর সাথে কথা বলছি? আমি ক্যাপসিক কেয়ার থেকে ডক্টর ${selectedTask?.doctors?.name || 'আপনার ডাক্তারের'} পক্ষ থেকে ফোন করছি।`,
      checkin: `আপনার সাম্প্রতিক স্বাস্থ্য পরীক্ষার পর একটি নিয়মিত ফলো-আপ খোঁজ নিতে ফোন করেছি। আপনি এখন কেমন আছেন? প্রেসক্রিপশনের ওষুধগুলো ঠিকমতো শুরু করেছেন কি?`,
      recall: `আপনার কোয়ার্টারলি ক্রনিক কেয়ার রিভিউয়ের সময় হয়েছে। ডক্টর আপনাকে এই মাসে একটি ফলো-আপ ভিজিট ও রুটিন টেস্টের পরামর্শ দিয়েছেন।`,
      closing: `ক্যাপসিক কেয়ারের সাথে থাকার জন্য ধন্যবাদ। আপনার সুস্থতা কামনা করি!`,
    },
    hi: {
      greeting: `नमस्ते। क्या मैं ${selectedTask?.patients?.full_name || 'मरीज'} जी से बात कर रहा/रही हूँ? मैं कैप्सिक केयर से डॉ. ${selectedTask?.doctors?.name || 'आपके डॉक्टर'} की ओर से फोन कर रहा/रही हूँ।`,
      checkin: `आपके हालिया परामर्श के बाद यह एक नियमित स्वास्थ्य फॉलो-अप कॉल है। अब आपकी तबीयत कैसी है? क्या आपने दवाइयां नियमित रूप से शुरू कर दी हैं?`,
      recall: `यह आपके त्रैमासिक स्वास्थ्य रिव्यू का समय है। डॉक्टर साहब ने इस महीने आपकी जांच और फॉलो-अप परामर्श की सलाह दी है।`,
      closing: `कैप्सिक केयर पर भरोसा करने के लिए धन्यवाद। आपके अच्छे स्वास्थ्य की कामना करते हैं!`,
    },
  }

  const currentScript = scripts[scriptLang]

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-teal-600" />
              Tele-Caller Dedicated Workspace
            </h1>
            <Badge className="bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 text-xs font-semibold">
              Step 08 Desk
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Concurrency-locked patient outreach with 1-click `tel:` dialing, multilingual guidance scripts, and clinical dispositioning.
          </p>
        </div>

        <Link href="/admin/careflow">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Back to CareFlow Hub
          </Button>
        </Link>
      </div>

      {/* Main Two Column Telephony Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 Cols): Task Queues & List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[780px]">
          {/* Queue Filter Tabs */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-4 gap-1 text-[11px] font-semibold">
            <button
              onClick={() => setActiveQueue('today')}
              className={`py-1.5 rounded-lg transition-all ${
                activeQueue === 'today'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveQueue('my')}
              className={`py-1.5 rounded-lg transition-all ${
                activeQueue === 'my'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              My Desk
            </button>
            <button
              onClick={() => setActiveQueue('overdue')}
              className={`py-1.5 rounded-lg transition-all ${
                activeQueue === 'overdue'
                  ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setActiveQueue('callbacks')}
              className={`py-1.5 rounded-lg transition-all ${
                activeQueue === 'callbacks'
                  ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Callbacks
            </button>
          </div>

          {/* Search box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                placeholder="Search patient by name, UHID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQueue()}
                className="pl-8 text-xs h-8 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Task Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-teal-600" />
                Loading caller queue...
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No tasks found in {activeQueue} queue.
              </div>
            ) : (
              tasks.map((t) => {
                const isSelected = selectedTask?.id === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3 text-xs cursor-pointer transition-colors space-y-1 ${
                      isSelected
                        ? 'bg-teal-50/80 dark:bg-teal-950/40 border-l-4 border-l-teal-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {t.patients?.uhid}
                        </span>
                        {t.status === 'claimed' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded font-semibold">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {t.task_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {t.patients?.full_name}
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{t.patients?.phone}</span>
                      <span>Dr. {t.doctors?.name || 'Clinic'}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Active Call Console, Script & Outcomes */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTask ? (
            <>
              {/* Patient Banner & Click-To-Dial */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-300">
                        {selectedTask.patients?.uhid}
                      </span>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs capitalize">
                        {selectedTask.task_type.replace('_', ' ')}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          selectedTask.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedTask.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {selectedTask.patients?.full_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedTask.patients?.gender} • {selectedTask.patients?.age_years || 'Age N/A'} Yrs • Treating: Dr. {selectedTask.doctors?.name || 'CAPSIC Specialist'}
                    </p>
                  </div>

                  {/* Concurrency Safe Claim Lock Controls */}
                  <div className="text-right">
                    {selectedTask.status === 'claimed' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReleaseTask(selectedTask)}
                        className="h-8 text-xs text-slate-600 flex items-center gap-1"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Release Lock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleClaimTask(selectedTask)}
                        className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1 shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Claim Call (15m Lock)
                      </Button>
                    )}
                  </div>
                </div>

                {/* Direct Dialing Banner */}
                <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold uppercase tracking-wider block">
                        Telephone Dialing Link
                      </span>
                      <a
                        href={`tel:${selectedTask.patients?.phone}`}
                        className="font-mono text-base font-black text-teal-950 dark:text-teal-100 hover:underline flex items-center gap-1"
                      >
                        {selectedTask.patients?.phone}
                        <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEscalateModalOpen(true)}
                      className="h-8 text-xs border-rose-300 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      Clinical Safety Flag
                    </Button>
                  </div>
                </div>
              </div>

              {/* Multilingual Script Guidance Tab */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-teal-600" />
                    Tele-Caller Call Script Guidance
                  </span>

                  {/* Language switch */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setScriptLang('en')}
                      className={`px-2 py-0.5 rounded ${scriptLang === 'en' ? 'bg-white dark:bg-slate-900 font-bold shadow-xs' : 'text-slate-500'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setScriptLang('bn')}
                      className={`px-2 py-0.5 rounded ${scriptLang === 'bn' ? 'bg-white dark:bg-slate-900 font-bold shadow-xs' : 'text-slate-500'}`}
                    >
                      বাংলা
                    </button>
                    <button
                      onClick={() => setScriptLang('hi')}
                      className={`px-2 py-0.5 rounded ${scriptLang === 'hi' ? 'bg-white dark:bg-slate-900 font-bold shadow-xs' : 'text-slate-500'}`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p>
                    <strong className="text-teal-700 dark:text-teal-400">1. Greeting:</strong> &quot;{currentScript.greeting}&quot;
                  </p>
                  <p>
                    <strong className="text-teal-700 dark:text-teal-400">2. Medical Check-in:</strong> &quot;
                    {selectedTask.task_type === 'chronic_recall' ? currentScript.recall : currentScript.checkin}&quot;
                  </p>
                  <p>
                    <strong className="text-teal-700 dark:text-teal-400">3. Closing:</strong> &quot;{currentScript.closing}&quot;
                  </p>
                </div>
              </div>

              {/* 14 Structured Dispositions & Outcome Form */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Log Call Outcome & Structured Disposition
                </h4>

                <form onSubmit={handleSaveDisposition} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Call Connection Status *
                      </label>
                      <select
                        value={callStatus}
                        onChange={(e) => setCallStatus(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                      >
                        <option value="connected">Connected / Answered</option>
                        <option value="no_answer">No Answer</option>
                        <option value="busy">Busy / Engaged</option>
                        <option value="wrong_number">Wrong Number</option>
                        <option value="call_failed">Call Failed / Switched Off</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Structured Outcome Disposition *
                      </label>
                      <select
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value as any)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                      >
                        <option value="patient_doing_well">Patient Doing Well (Recovery Verified)</option>
                        <option value="patient_has_concern">Patient Has Concern (Non-Urgent)</option>
                        <option value="follow_up_appointment_requested">Follow-Up Appointment Requested</option>
                        <option value="diagnostic_booking_assistance_requested">Diagnostic Booking Assistance Requested</option>
                        <option value="appointment_booked">Appointment Booked On Call</option>
                        <option value="callback_requested">Callback Requested By Patient</option>
                        <option value="connected">General Info Delivered</option>
                        <option value="no_answer">No Answer</option>
                        <option value="busy">Line Busy</option>
                        <option value="switched_off">Phone Switched Off</option>
                        <option value="wrong_number">Wrong Number / Invalid</option>
                        <option value="not_interested">Not Interested in Service</option>
                        <option value="do_not_contact">Do Not Contact (Opt-Out)</option>
                        <option value="escalated_to_doctor">Escalated to Doctor</option>
                      </select>
                    </div>
                  </div>

                  {outcome === 'callback_requested' && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <label className="font-semibold text-amber-900 dark:text-amber-200 block mb-1">
                        Scheduled Callback Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        required
                        value={callbackDateTime}
                        onChange={(e) => setCallbackDateTime(e.target.value)}
                        className="h-9 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Factual Call Observations & Clinical Notes
                    </label>
                    <textarea
                      rows={3}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Note specific patient feedback, medicine tolerance, or coordination needs..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/appointments?bookFor=${selectedTask.patient_id}`}>
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs text-blue-600">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Book Doctor OPD
                        </Button>
                      </Link>
                      <Link href={`/admin/billing`}>
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs text-purple-600">
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Diagnostic Order
                        </Button>
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmittingOutcome}
                      className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 shadow-xs"
                    >
                      {isSubmittingOutcome ? 'Saving...' : 'Save Disposition & Move Next'}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Select a task from the queue to start tele-caller outreach.
            </div>
          )}
        </div>
      </div>

      {/* Clinical Escalation Modal */}
      {isEscalateModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-rose-300 dark:border-rose-900">
            <div className="flex items-center justify-between border-b pb-3 border-rose-100 dark:border-rose-950">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
                    Clinical Safety Escalation Flag
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {selectedTask.patients?.full_name} ({selectedTask.patients?.uhid})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEscalateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Prominent Emergency Guidance Banner */}
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1 text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4" /> EMERGENCY ADVISORY:
              </span>
              <p>
                If patient presents severe chest pain, breathing difficulty, acute stroke symptoms, or severe bleeding, advise immediate transfer to the nearest Emergency Room (Call 102/108/Local Hospital). Tele-callers must not provide medical treatment recommendations.
              </p>
            </div>

            <form onSubmit={handleSaveEscalation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Urgency Level *
                  </label>
                  <select
                    value={escalateUrgency}
                    onChange={(e) => setEscalateUrgency(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-rose-700"
                  >
                    <option value="urgent">Urgent Review</option>
                    <option value="emergency">Critical Emergency</option>
                    <option value="routine">Routine Doctor Clarification</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Category *
                  </label>
                  <select
                    value={escalateCategory}
                    onChange={(e) => setEscalateCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                  >
                    <option value="worsening_symptoms">Worsening Symptoms</option>
                    <option value="medication_adverse_effect">Medication Adverse Effect</option>
                    <option value="urgent_clinical_question">Urgent Clinical Question</option>
                    <option value="post_procedure_complication">Post-Procedure Issue</option>
                    <option value="speak_with_doctor_request">Patient Requested Doctor Callback</option>
                    <option value="other">Other Clinical Concern</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Symptoms Reported by Patient *
                </label>
                <Input
                  required
                  value={escalateSymptoms}
                  onChange={(e) => setEscalateSymptoms(e.target.value)}
                  placeholder="e.g. High fever with persistent vomiting / rash after tablet..."
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Detailed Escalation Description & Context *
                </label>
                <textarea
                  required
                  rows={3}
                  value={escalateDescription}
                  onChange={(e) => setEscalateDescription(e.target.value)}
                  placeholder="Detailed notes for the treating doctor..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEscalateModalOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEscalation}
                  className="h-9 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {isSubmittingEscalation ? 'Logging...' : 'Submit Clinical Flag'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
