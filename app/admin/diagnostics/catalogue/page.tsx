'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Home,
  AlertCircle,
  Tag,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface CatalogueItem {
  id: string
  code: string
  name: string
  slug: string
  itemType: 'test' | 'package'
  categoryName?: string
  sampleType: string
  fastingRequired: boolean
  turnaroundHours: number
  homeCollectionSupported: boolean
  pricePaise: number
  priceInr: number
  mrpPaise: number
  mrpInr: number
  discountPaise: number
  isActive: boolean
}

export default function DiagnosticCataloguePage() {
  const { selectedBranchId } = useBranch()
  const [items, setItems] = useState<CatalogueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'test' | 'package'>('all')

  // Modals & Actions
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  // Add Item Form State
  const [formData, setFormData] = useState({
    item_type: 'test' as 'test' | 'package',
    name: '',
    code: '',
    sample_type: 'Blood / Serum',
    fasting_required: false,
    turnaround_hours: 24,
    home_collection_supported: true,
    price_inr: 250,
    mrp_inr: 300,
    description: '',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchCatalogue = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId)
      if (search.trim()) params.set('q', search.trim())
      if (selectedType !== 'all') params.set('type', selectedType)
      params.set('limit', '100')

      const res = await fetch(`/api/v1/diagnostics/catalogue?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load catalogue')
      }

      setItems(json.data || [])
    } catch (err: any) {
      setError(err.message || 'Error fetching diagnostic catalogue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalogue()
  }, [selectedBranchId, selectedType])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCatalogue()
  }

  const handleSyncFromCsv = async () => {
    setIsSyncing(true)
    setSyncFeedback(null)
    try {
      const res = await fetch('/api/v1/diagnostics/catalogue/sync?dryRun=false', {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Sync failed')
      }
      setSyncFeedback(`Successfully synchronized ${json.data.tests.valid} tests and ${json.data.packages.valid} health packages from CSV catalogue.`)
      fetchCatalogue()
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        item_type: formData.item_type,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        sample_type: formData.sample_type,
        fasting_required: formData.fasting_required,
        turnaround_hours: Number(formData.turnaround_hours),
        home_collection_supported: formData.home_collection_supported,
        price_paise: Math.round(Number(formData.price_inr) * 100),
        mrp_paise: Math.round(Number(formData.mrp_inr) * 100),
        description: formData.description.trim() || undefined,
        branch_id: selectedBranchId !== 'all' ? selectedBranchId : null,
      }

      const res = await fetch('/api/v1/diagnostics/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to create test/package')
      }

      setIsAddOpen(false)
      fetchCatalogue()
    } catch (err: any) {
      setFormError(err.message || 'Submission error')
    } finally {
      setFormSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/diagnostics" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Diagnostic Catalogue</h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 text-xs">
              {items.length} Available
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Individual lab tests, health packages, sample specifications, turnaround times, and integer paise pricing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFromCsv}
            disabled={isSyncing}
            className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing CSV...' : 'Sync from CSV'}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setFormData({
                item_type: 'test',
                name: '',
                code: `TEST-${Math.floor(100 + Math.random() * 900)}`,
                sample_type: 'Blood / Serum',
                fasting_required: false,
                turnaround_hours: 24,
                home_collection_supported: true,
                price_inr: 250,
                mrp_inr: 350,
                description: '',
              })
              setIsAddOpen(true)
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Test / Package
          </Button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
          <span>{syncFeedback}</span>
          <button onClick={() => setSyncFeedback(null)} className="text-purple-500 hover:text-purple-800 font-bold">&times;</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tests or packages by name (e.g. CBC, Lipid, Thyroid, HbA1c)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs border-slate-200 dark:border-slate-800"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-4 text-xs">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="h-9 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Types (Tests & Packages)</option>
            <option value="test">Individual Tests Only</option>
            <option value="package">Diagnostic Packages Only</option>
          </select>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-4">Test Name & Code</th>
                <th className="py-2.5 px-4">Type & Category</th>
                <th className="py-2.5 px-4">Sample Specimen</th>
                <th className="py-2.5 px-4">TAT</th>
                <th className="py-2.5 px-4">Home Collection</th>
                <th className="py-2.5 px-4">Base Rate (₹)</th>
                <th className="py-2.5 px-4">MRP (₹)</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading pathology catalogue...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No diagnostic tests or packages found. Click &ldquo;Sync from CSV&rdquo; or &ldquo;Add Test&rdquo; to populate catalogue.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span className="font-mono text-[10px] font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                          {item.code}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] capitalize ${
                          item.itemType === 'package'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.itemType}
                      </Badge>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{item.categoryName}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div>{item.sampleType}</div>
                      {item.fastingRequired && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">
                          * 10-12h Fasting Required
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {item.turnaroundHours}h
                    </td>

                    <td className="py-3 px-4">
                      {item.homeCollectionSupported ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <Home className="w-2.5 h-2.5" /> Doorstep
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Center Only</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ₹{item.priceInr}
                    </td>

                    <td className="py-3 px-4 text-slate-500 line-through">
                      ₹{item.mrpInr}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {item.isActive ? (
                        <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add New Diagnostic Item</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none">&times;</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 rounded-lg text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Item Type *</label>
                  <select
                    value={formData.item_type}
                    onChange={(e) => setFormData({ ...formData, item_type: e.target.value as any })}
                    className="w-full h-8 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-slate-900 dark:text-white"
                  >
                    <option value="test">Individual Pathology Test</option>
                    <option value="package">Health Check-up Package</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Item Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Complete Blood Count (CBC) with ESR"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sample Specimen</label>
                  <Input
                    value={formData.sample_type}
                    onChange={(e) => setFormData({ ...formData, sample_type: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Turnaround Time (Hours)</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.turnaround_hours}
                    onChange={(e) => setFormData({ ...formData, turnaround_hours: parseInt(e.target.value) || 24 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Base Price (₹) *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.price_inr}
                    onChange={(e) => setFormData({ ...formData, price_inr: parseInt(e.target.value) || 0 })}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">MRP (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.mrp_inr}
                    onChange={(e) => setFormData({ ...formData, mrp_inr: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fasting_required}
                    onChange={(e) => setFormData({ ...formData, fasting_required: e.target.checked })}
                    className="rounded text-purple-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Fasting Required</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.home_collection_supported}
                    onChange={(e) => setFormData({ ...formData, home_collection_supported: e.target.checked })}
                    className="rounded text-purple-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Home Collection Eligible</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={formSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {formSubmitting ? 'Saving...' : 'Create Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
