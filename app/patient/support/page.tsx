'use client'

import React, { useEffect, useState } from 'react'
import {
  HelpCircle,
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientSupportPage() {
  const { activePatientId, t } = usePatient()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<'appointment' | 'billing' | 'diagnostic' | 'prescription' | 'technical' | 'general'>('general')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [submitting, setSubmitting] = useState(false)
  const [createdTicket, setCreatedTicket] = useState<any | null>(null)

  useEffect(() => {
    if (activePatientId) {
      loadTickets(activePatientId)
    }
  }, [activePatientId])

  const loadTickets = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/support?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setTickets(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePatientId) return
    try {
      setSubmitting(true)
      const payload = {
        category,
        subject,
        description,
        priority,
      }

      const res = await fetch(`/api/v1/patient/support?patientId=${activePatientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (res.ok) {
        setCreatedTicket(json.data)
        setSubject('')
        setDescription('')
        loadTickets(activePatientId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-teal-600" />
          Patient Help & Support Desk
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Reach our patient advocacy, billing disputes and clinical coordination teams directly.
        </p>
      </div>

      {/* Emergency Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <h4 className="font-bold text-red-900 dark:text-red-200">
            Immediate Medical Emergencies
          </h4>
          <p className="text-red-700 dark:text-red-300 mt-0.5">
            This support ticketing system is for non-emergent operational queries. If you or a loved one is experiencing chest pain, difficulty breathing, severe bleeding or loss of consciousness, call 102/108 or proceed immediately to the nearest emergency room.
          </p>
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-red-800 dark:text-red-200 underline"
          >
            <PhoneCall className="h-3.5 w-3.5" /> Call National Ambulance: 108
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Ticket Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Submit a Support Request
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="general">General Inquiry</option>
              <option value="appointment">Appointment Rescheduling / Token</option>
              <option value="billing">Billing & Payment Issue</option>
              <option value="diagnostic">Diagnostic Sample & Report</option>
              <option value="prescription">Prescription Clarification</option>
              <option value="technical">Portal Account / Login Help</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <input
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your question..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide full details so we can resolve your request promptly..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? 'Submitting...' : 'Submit Support Ticket'}
          </button>
        </form>

        {/* Existing Tickets */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Previous Requests ({tickets.length})
          </h3>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No previous tickets on record.
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto">
              {tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-600">
                      {tkt.ticket_number}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tkt.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white pt-1">
                    {tkt.subject}
                  </h4>
                  <p className="text-slate-500 line-clamp-2">
                    {tkt.description}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    Created: {tkt.created_at?.substring(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
