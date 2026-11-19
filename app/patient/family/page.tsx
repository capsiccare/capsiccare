'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  User,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientFamilyPage() {
  const { activePatientId, refreshContext, t } = usePatient()
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [fullName, setFullName] = useState('')
  const [relationship, setRelationship] = useState<'child' | 'parent' | 'spouse' | 'other'>('child')
  const [permissionScope, setPermissionScope] = useState<'full_access' | 'appointments_only' | 'records_only'>('full_access')
  const [uhid, setUhid] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [age, setAge] = useState(10)

  useEffect(() => {
    if (activePatientId) {
      loadFamily(activePatientId)
    }
  }, [activePatientId])

  const loadFamily = async (patId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/patient/family?patientId=${patId}`)
      if (res.ok) {
        const json = await res.json()
        setFamilyMembers(json.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePatientId) return
    try {
      setSubmitting(true)
      const payload = {
        full_name: fullName,
        relationship,
        permission_scope: permissionScope,
        uhid: uhid || undefined,
        phone: phone || undefined,
        gender,
        age_years: Number(age),
      }

      const res = await fetch(`/api/v1/patient/family?patientId=${activePatientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setAddModalOpen(false)
        setFullName('')
        setUhid('')
        loadFamily(activePatientId)
        refreshContext()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async (depId: string) => {
    if (!activePatientId) return
    try {
      const res = await fetch(`/api/v1/patient/family?patientId=${activePatientId}&dependentPatientId=${depId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        loadFamily(activePatientId)
        refreshContext()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.nav.family}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized health proxy access for children, elderly parents, and dependents.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          Add Family Dependent
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : familyMembers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No family members linked
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You can link elderly parents or young children to book consultations and review reports under your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {familyMembers.map((fm) => (
            <div
              key={fm.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center font-bold shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {fm.dependent?.full_name || 'Dependent'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {fm.relationship}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {fm.dependent?.uhid}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Scope: <span className="font-semibold text-teal-600 capitalize">{fm.permission_scope?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRevoke(fm.dependent_patient_id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                title="Revoke Delegation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Dependent Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMember}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-600" />
                Add Family Member
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dependent's full name"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="child">Child / Minor</option>
                  <option value="parent">Elderly Parent</option>
                  <option value="spouse">Spouse</option>
                  <option value="other">Other Dependent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Permission Scope
                </label>
                <select
                  value={permissionScope}
                  onChange={(e) => setPermissionScope(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="full_access">Full Access</option>
                  <option value="appointments_only">Appointments Only</option>
                  <option value="records_only">Records Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Existing UHID (Optional)
              </label>
              <input
                type="text"
                value={uhid}
                onChange={(e) => setUhid(e.target.value)}
                placeholder="Leave blank if registering new dependent"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Family Member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
