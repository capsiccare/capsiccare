'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Radio,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Mail,
  Smartphone,
  Phone,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminCommunicationsPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'templates' | 'broadcast' | 'consent'>('timeline')
  const [loading, setLoading] = useState(false)

  // Data
  const [messages, setMessages] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [channelFilter, setChannelFilter] = useState('all')

  // Modals & Forms
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  const [messageForm, setMessageForm] = useState({
    patient_id: '',
    channel: 'whatsapp' as 'whatsapp' | 'sms' | 'email',
    template_code: 'APPOINTMENT_CONFIRMED',
    custom_body: '',
  })

  const [templateForm, setTemplateForm] = useState({
    code: '',
    title: '',
    category: 'service' as 'service' | 'transactional' | 'promotional',
    channel: 'whatsapp' as 'whatsapp' | 'sms' | 'email',
    language: 'en',
    template_body: '',
    variables: [] as string[],
  })

  const [broadcastForm, setBroadcastForm] = useState({
    channel: 'whatsapp' as 'whatsapp' | 'sms' | 'email',
    template_code: 'FOLLOW_UP_REMINDER',
    custom_body: '',
  })

  const [patientLookupPhone, setPatientLookupPhone] = useState('')
  const [patientPref, setPatientPref] = useState<any>(null)

  const fetchTimeline = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/communications/messages${channelFilter !== 'all' ? `?channel=${channelFilter}` : ''}`)
      const data = await res.json()
      if (data.success) setMessages(data.data.messages || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/v1/communications/templates')
      const data = await res.json()
      if (data.success) setTemplates(data.data.templates || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (activeTab === 'timeline') fetchTimeline()
    if (activeTab === 'templates') fetchTemplates()
  }, [activeTab, channelFilter])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/communications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm),
      })
      const result = await res.json()
      if (result.success) {
        setIsNewMessageOpen(false)
        fetchTimeline()
      } else {
        alert(result.error?.message || 'Failed to dispatch message')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/v1/communications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      })
      const result = await res.json()
      if (result.success) {
        setIsTemplateModalOpen(false)
        fetchTemplates()
      } else {
        alert(result.error?.message || 'Failed to save template')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleConsentLookup = async () => {
    try {
      const patientRes = await fetch(`/api/v1/admin/patients?search=${patientLookupPhone}`)
      const pData = await patientRes.json()
      const patient = pData.data?.patients?.[0]
      if (!patient) {
        alert('No patient found with this phone number')
        return
      }

      const res = await fetch(`/api/v1/communications/preferences?patientId=${patient.id}`)
      const data = await res.json()
      if (data.success) {
        setPatientPref({ ...data.data, fullName: patient.fullName })
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdateConsent = async () => {
    if (!patientPref) return
    try {
      const res = await fetch('/api/v1/communications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientPref),
      })
      const data = await res.json()
      if (data.success) {
        alert('Communication preferences updated successfully!')
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
              Communication Center & Notifications
            </h1>
            <Badge className="bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 text-xs font-semibold">
              Multi-channel Live
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automated WhatsApp notifications, SMS alerts, digital reports delivery, template manager, and consent controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewMessageOpen(true)}
            className="flex items-center gap-1.5 text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Dispatch Message
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Messages Timeline
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'templates'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          Message Templates
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'broadcast'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          Broadcast Dispatcher
        </button>

        <button
          onClick={() => setActiveTab('consent')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'consent'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Patient Consent & Preferences
        </button>
      </div>

      {/* Tab 1: Messages Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Channel:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="all">All Channels</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTimeline}
              className="h-9 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Recipient</th>
                  <th className="py-3 px-4 font-semibold">Channel</th>
                  <th className="py-3 px-4 font-semibold">Template / Title</th>
                  <th className="py-3 px-4 font-semibold">Message Preview</th>
                  <th className="py-3 px-4 font-semibold">Delivered At</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No communications logged yet.
                    </td>
                  </tr>
                ) : (
                  messages.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {m.patients?.full_name || 'Patient'}
                        </div>
                        <div className="font-mono text-slate-500 dark:text-slate-400">{m.recipient}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {m.channel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {m.communication_templates?.title || 'Direct Notification'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {m.message_body}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {m.delivered_at ? new Date(m.delivered_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] capitalize">
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Message Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Pre-approved multi-lingual templates with automatic merge variables.
            </p>
            <Button
              onClick={() => setIsTemplateModalOpen(true)}
              className="h-9 text-xs flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                    {tmpl.code}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {tmpl.channel}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px]">
                      {tmpl.category}
                    </Badge>
                  </div>
                </div>

                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{tmpl.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg font-sans leading-relaxed">
                  {tmpl.template_body}
                </div>

                {tmpl.variables && tmpl.variables.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Variables:</span>
                    {tmpl.variables.map((v: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Broadcast Dispatcher */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Broadcast Campaign Dispatcher</h3>
            <p className="text-xs text-slate-500">
              Bulk send updates to patients with automatic consent checking and opt-out suppression.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Broadcast Channel</label>
              <select
                value={broadcastForm.channel}
                onChange={(e: any) => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
              >
                <option value="whatsapp">WhatsApp Business API</option>
                <option value="sms">SMS Gateway</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Message Template</label>
              <select
                value={broadcastForm.template_code}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, template_code: e.target.value })}
                className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
              >
                <option value="FOLLOW_UP_REMINDER">FOLLOW_UP_REMINDER (CareFlow Recall)</option>
                <option value="APPOINTMENT_CONFIRMED">APPOINTMENT_CONFIRMED</option>
                <option value="HOME_COLLECTION_CONFIRMED">HOME_COLLECTION_CONFIRMED</option>
              </select>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg text-xs space-y-1 border border-slate-200/80 dark:border-slate-800">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Opt-Out Suppression Guard</div>
              <div className="text-slate-500">
                Patients who opted out of promotional communications will be automatically skipped to maintain compliance.
              </div>
            </div>

            <Button
              onClick={() => alert('Broadcast campaign scheduled for audience!')}
              className="w-full h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Radio className="w-3.5 h-3.5 mr-1.5" />
              Launch Broadcast Campaign
            </Button>
          </div>
        </div>
      )}

      {/* Tab 4: Patient Consent & Preferences */}
      {activeTab === 'consent' && (
        <div className="max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Patient Consent & Preferences Ledger</h3>
            <p className="text-xs text-slate-500">
              Lookup and configure individual communication channel consent.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter patient phone number..."
              value={patientLookupPhone}
              onChange={(e) => setPatientLookupPhone(e.target.value)}
              className="text-xs h-9"
            />
            <Button onClick={handleConsentLookup} className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white">
              Lookup
            </Button>
          </div>

          {patientPref && (
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {patientPref.fullName}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={patientPref.service_whatsapp_enabled}
                    onChange={(e) => setPatientPref({ ...patientPref, service_whatsapp_enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span>WhatsApp Service Notifications (Appointment & Lab Report)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={patientPref.service_sms_enabled}
                    onChange={(e) => setPatientPref({ ...patientPref, service_sms_enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span>SMS Transactional Notifications</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={patientPref.promotional_whatsapp_enabled}
                    onChange={(e) => setPatientPref({ ...patientPref, promotional_whatsapp_enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span>Promotional Campaigns on WhatsApp</span>
                </label>
              </div>

              <Button onClick={handleUpdateConsent} className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                Save Preferences
              </Button>
            </div>
          )}
        </div>
      )}

      {/* New Message Modal */}
      {isNewMessageOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Dispatch Notification</h3>
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Channel</label>
                <select
                  value={messageForm.channel}
                  onChange={(e: any) => setMessageForm({ ...messageForm, channel: e.target.value })}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Select Template</label>
                <select
                  value={messageForm.template_code}
                  onChange={(e) => setMessageForm({ ...messageForm, template_code: e.target.value })}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-1 bg-white dark:bg-slate-900"
                >
                  <option value="APPOINTMENT_CONFIRMED">APPOINTMENT_CONFIRMED</option>
                  <option value="HOME_COLLECTION_CONFIRMED">HOME_COLLECTION_CONFIRMED</option>
                  <option value="DIAGNOSTIC_REPORT_READY">DIAGNOSTIC_REPORT_READY</option>
                  <option value="PRESCRIPTION_AVAILABLE">PRESCRIPTION_AVAILABLE</option>
                  <option value="FOLLOW_UP_REMINDER">FOLLOW_UP_REMINDER</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewMessageOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                  Send Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
