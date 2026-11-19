'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Building2,
  Shield,
  ShieldCheck,
  Globe,
  Database,
  Lock,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  Cpu,
  Plus,
  Edit2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

interface SettingsData {
  organization: {
    id: string
    name: string
    code: string
    is_active: boolean
    created_at?: string
  }
  branches: Array<{
    id: string
    code: string
    name: string
    address: string
    city: string
    district: string
    state: string
    pincode: string
    phone: string
    timezone: string
    is_headquarters: boolean
    is_active: boolean
  }>
  roles: Array<{
    id: string
    name: string
    description: string
    is_system_role: boolean
  }>
  staff: Array<{
    id: string
    fullName: string
    phone: string
    email: string | null
    isActive: boolean
    roles: Array<{ role: string; branchName: string }>
  }>
  standards: {
    timezone: string
    currency: string
    monetaryUnit: string
    uhidScheme: string
    compliance: string
  }
}

export default function AdminSettingsPage() {
  const { refreshBranches } = useBranch()
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false)
  const [isEditingBranch, setIsEditingBranch] = useState(false)
  const [branchFormSubmitting, setBranchFormSubmitting] = useState(false)
  const [branchForm, setBranchForm] = useState({
    id: '',
    name: '',
    code: '',
    address: '',
    city: 'Howrah',
    district: 'Howrah',
    state: 'West Bengal',
    pincode: '',
    phone: '',
    email: '',
    is_headquarters: false,
    is_active: true,
  })

  const openAddBranch = () => {
    setIsEditingBranch(false)
    setBranchForm({
      id: '',
      name: '',
      code: '',
      address: '',
      city: 'Howrah',
      district: 'Howrah',
      state: 'West Bengal',
      pincode: '',
      phone: '',
      email: '',
      is_headquarters: false,
      is_active: true,
    })
    setIsBranchModalOpen(true)
  }

  const openEditBranch = (b: any) => {
    setIsEditingBranch(true)
    setBranchForm({
      id: b.id,
      name: b.name,
      code: b.code,
      address: b.address,
      city: b.city,
      district: b.district,
      state: b.state,
      pincode: b.pincode,
      phone: b.phone,
      email: b.email || '',
      is_headquarters: Boolean(b.is_headquarters),
      is_active: Boolean(b.is_active),
    })
    setIsBranchModalOpen(true)
  }

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBranchFormSubmitting(true)
    try {
      const url = '/api/v1/branches'
      const method = isEditingBranch ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to save branch')
      }
      setIsBranchModalOpen(false)
      await fetchSettings()
      await refreshBranches()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setBranchFormSubmitting(false)
    }
  }

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/admin/settings')
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to load settings')
      }
      setData(result.data)
    } catch (err: any) {
      setError(err.message || 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Access Control</h1>
            <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300 text-xs">
              System Configuration
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Organization parameters, multi-branch network, RBAC role matrix, and healthcare data standards.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSettings}
          disabled={loading}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchSettings} className="ml-auto text-xs border-red-300">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Loading system settings and branch configuration...
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Healthcare Organization</h3>
                <p className="text-xs text-slate-500">Root operational entity</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">Organization Name</span>
                <span className="font-semibold text-slate-900">{data.organization.name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">Network Code</span>
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                  {data.organization.code}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">System Status</span>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                  Active Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 text-xs font-medium">Organization ID</span>
                <span className="font-mono text-[11px] text-slate-400 select-all">{data.organization.id}</span>
              </div>
            </div>
          </div>

          {/* Operational Standards Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Healthcare & Clinical Standards</h3>
                <p className="text-xs text-slate-500">Regulatory & data precision standards</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Timezone
                </span>
                <span className="font-medium text-slate-800">{data.standards.timezone} (IST)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Currency & Representation
                </span>
                <span className="font-medium text-slate-800">{data.standards.currency}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">Monetary Precision</span>
                <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  {data.standards.monetaryUnit}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 text-xs font-medium">UHID Generation Format</span>
                <span className="font-mono text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                  {data.standards.uhidScheme}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Compliance
                </span>
                <span className="text-xs font-semibold text-slate-800">{data.standards.compliance}</span>
              </div>
            </div>
          </div>

          {/* Clinical Branches Directory */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Branch Network</h3>
                  <p className="text-xs text-slate-500">Physical clinics, sample collection centers and regional hubs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold">
                  {data.branches.length} Registered Hubs
                </Badge>
                <Button
                  size="sm"
                  onClick={openAddBranch}
                  className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Branch
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.branches.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{b.name}</h4>
                    <div className="flex items-center gap-1.5">
                      {b.is_headquarters && (
                        <Badge className="bg-emerald-600 text-white text-[10px]">Headquarters</Badge>
                      )}
                      <button
                        onClick={() => openEditBranch(b)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                        title="Edit Branch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{b.address}</p>
                  <p className="text-xs text-slate-500">{b.city}, {b.district}, {b.state} - {b.pincode}</p>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-700">Phone: {b.phone}</span>
                    <span className="font-mono text-[11px] text-slate-400">{b.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Roles & Permissions Matrix */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
                  <p className="text-xs text-slate-500">11 predefined healthcare system roles with granular branch-scoped permissions</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                {data.roles.length} System Roles
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.roles.map((r) => (
                <div key={r.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-slate-400">System Role</span>
                  </div>
                  <p className="text-xs text-slate-600 pt-1">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Add / Edit Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {isEditingBranch ? 'Edit Clinic Branch' : 'Add New Clinic Branch Hub'}
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Branch Name *</label>
                  <Input
                    required
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="text-xs h-9 mt-1"
                    placeholder="e.g. Barasat Clinic & Lab Hub"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Branch Code *</label>
                  <Input
                    required
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="text-xs h-9 mt-1 font-mono uppercase"
                    placeholder="e.g. BARASAT_HUB"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Physical Address *</label>
                <Input
                  required
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="text-xs h-9 mt-1"
                  placeholder="Street / Market / Landmark"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">City</label>
                  <Input
                    required
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="text-xs h-9 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">District</label>
                  <Input
                    required
                    value={branchForm.district}
                    onChange={(e) => setBranchForm({ ...branchForm, district: e.target.value })}
                    className="text-xs h-9 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Pincode *</label>
                  <Input
                    required
                    value={branchForm.pincode}
                    onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value })}
                    className="text-xs h-9 mt-1 font-mono"
                    placeholder="700124"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone *</label>
                  <Input
                    required
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="text-xs h-9 mt-1 font-mono"
                    placeholder="Official Contact"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Input
                    type="email"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="text-xs h-9 mt-1"
                    placeholder="branch@capsic.in"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branchForm.is_headquarters}
                    onChange={(e) => setBranchForm({ ...branchForm, is_headquarters: e.target.checked })}
                    className="rounded"
                  />
                  <span>Mark as Headquarters</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branchForm.is_active}
                    onChange={(e) => setBranchForm({ ...branchForm, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span>Active Operational</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={branchFormSubmitting}
                  className="h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {branchFormSubmitting ? 'Saving...' : isEditingBranch ? 'Save Changes' : 'Create Branch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
