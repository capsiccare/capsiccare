'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Pill,
  Search,
  Plus,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'

export default function AdminMedicinesMasterPage() {
  const [loading, setLoading] = useState(true)
  const [medicines, setMedicines] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Add Medicine Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [genericName, setGenericName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [dosageForm, setDosageForm] = useState('tablet')
  const [strength, setStrength] = useState('')
  const [route, setRoute] = useState('oral')
  const [therapeuticClass, setTherapeuticClass] = useState('')
  const [scheduleCategory, setScheduleCategory] = useState('Schedule H')
  const [adding, setAdding] = useState(false)

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const url = `/api/v1/clinical/medicines?page=${page}&limit=20&search=${encodeURIComponent(searchQuery)}`
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        setMedicines(json.data?.medicines || [])
        setTotal(json.data?.total || 0)
        setTotalPages(json.data?.total_pages || 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [page, searchQuery])

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genericName || !brandName || !strength) return
    setAdding(true)
    try {
      const res = await fetch('/api/v1/clinical/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generic_name: genericName,
          brand_name: brandName,
          manufacturer,
          dosage_form: dosageForm,
          strength,
          route,
          therapeutic_class: therapeuticClass,
          schedule_category: scheduleCategory,
        }),
      })
      if (res.ok) {
        setShowAddModal(false)
        setGenericName('')
        setBrandName('')
        setStrength('')
        setManufacturer('')
        fetchMedicines()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Generic Medicine Master & Formulary</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized Indian pharmacopoeia catalogue, brand-to-generic mappings, and regulatory classifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/medicines/imports"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Bulk Import</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Search & Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand, generic name, class..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <strong>{medicines.length}</strong> of <strong>{total}</strong> active formulary items
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Brand Name</th>
                <th className="py-3 px-4">Generic Composition</th>
                <th className="py-3 px-4">Dosage Form & Strength</th>
                <th className="py-3 px-4">Therapeutic Class</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                    <span>Loading medicine catalogue...</span>
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Pill className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <span>No medicines found matching your search</span>
                  </td>
                </tr>
              ) : (
                medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">{m.brand_name}</span>
                    </td>
                    <td className="py-3 px-4 text-teal-700 dark:text-teal-300 font-medium">
                      {m.generic_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{m.dosage_form}</span> • <span className="font-mono">{m.strength}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{m.therapeutic_class || 'General'}</td>
                    <td className="py-3 px-4 text-slate-500">{m.manufacturer || 'Standard'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.schedule_category === 'OTC'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                        }`}
                      >
                        {m.schedule_category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-slate-500">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ADD MEDICINE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMedicine}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <span>Add New Medicine to Formulary</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dolo 650, Augmentin 625 Duo"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Generic Ingredient(s) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Amoxicillin + Clavulanic Acid"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Dosage Form</label>
                  <select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup / Suspension</option>
                    <option value="injection">Injection</option>
                    <option value="ointment">Ointment / Cream</option>
                    <option value="drops">Drops</option>
                    <option value="inhaler">Inhaler / MDI</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Strength *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 650mg, 500mg + 125mg"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Route</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="oral">Oral</option>
                    <option value="topical">Topical</option>
                    <option value="iv">Intravenous (IV)</option>
                    <option value="im">Intramuscular (IM)</option>
                    <option value="inhalation">Inhalation</option>
                    <option value="ophthalmic">Ophthalmic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Schedule Category</label>
                  <select
                    value={scheduleCategory}
                    onChange={(e) => setScheduleCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Schedule H">Schedule H</option>
                    <option value="Schedule H1">Schedule H1</option>
                    <option value="OTC">OTC</option>
                    <option value="Schedule X">Schedule X</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Therapeutic Class</label>
                <input
                  type="text"
                  placeholder="e.g. Analgesic / Antipyretic, Antibiotic, Antidiabetic"
                  value={therapeuticClass}
                  onChange={(e) => setTherapeuticClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Micro Labs Ltd, GlaxoSmithKline"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
              >
                {adding ? 'Saving...' : 'Add to Formulary'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
