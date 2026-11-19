'use client'

import { useState, useMemo } from 'react'
import { TestCard } from '@/components/test-card'
import { FilterSidebar } from '@/components/filter-sidebar'
import { SortControl } from '@/components/sort-control'
import { Menu, X } from 'lucide-react'

// Using the exact payload shaped passed by the Server Component
type SerializedTest = {
  id: string
  name: string
  slug: string
  price: number
  mrp?: number
  category: { name: string }
  sample_type: string
  turnaround_time: string
  home_collection_available: boolean
  short_description: string
  full_description: string
  parameters: {id: string, name: string}[]
}

export function LabTestsClient({ initialTests, categories }: { initialTests: SerializedTest[], categories: string[] }) {
  const [showFilters, setShowFilters] = useState(false)
  
  const dynamicSampleTypes = useMemo(() => {
    const types = new Set<string>()
    initialTests.forEach(t => {
      if (t.sample_type) {
        t.sample_type.split(',').forEach(st => {
          const cleanSt = st.trim()
          if (cleanSt) types.add(cleanSt)
        })
      }
    })
    return Array.from(types).sort()
  }, [initialTests])
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 30000,
    sampleType: '',
    homeCollection: false,
    tat: '',
    sortBy: 'popular',
  })

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 30000,
      sampleType: '',
      homeCollection: false,
      tat: '',
      sortBy: 'popular',
    })
  }

  const filteredTests = useMemo(() => {
    let results = [...initialTests]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(t => 
        t.name.toLowerCase().includes(q) || t.short_description?.toLowerCase().includes(q)
      )
    }

    if (filters.category) {
      results = results.filter(t => t.category.name === filters.category)
    }

    results = results.filter(t => t.price >= filters.minPrice && t.price <= filters.maxPrice)

    if (filters.sampleType) {
      results = results.filter(t => t.sample_type && t.sample_type.toLowerCase().includes(filters.sampleType.toLowerCase()))
    }

    if (filters.homeCollection) {
      results = results.filter(t => t.home_collection_available)
    }

    if (filters.tat) {
      // In the databank, tat is like "12 Hours", "24 Hours". We'll do exact matching or substring matching.
      results = results.filter(t => t.turnaround_time?.toLowerCase().includes(filters.tat.toLowerCase()))
    }

    switch (filters.sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        results.sort((a, b) => b.price - a.price)
        break
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return results
  }, [filters, initialTests])

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Header */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              All Diagnostic Tests
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Browse our comprehensive collection of {initialTests.length} diagnostic lab tests. Home collection available across Kolkata and suburbs.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters as any}
                categories={categories}
                sampleTypes={dynamicSampleTypes}
                onFilterChange={updateFilter}
                onReset={resetFilters}
                totalResults={filteredTests.length}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Mobile Filter */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-hover w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <span className="font-semibold text-slate-900 dark:text-white">Filters</span>
                {showFilters ? <X size={20} /> : <Menu size={20} />}
              </button>
              {showFilters && (
                <div className="mt-4 p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
                  <FilterSidebar
                    filters={filters as any}
                    categories={categories}
                    sampleTypes={dynamicSampleTypes}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                    totalResults={filteredTests.length}
                  />
                </div>
              )}
            </div>

            <div className="animate-fade-in flex justify-end">
              <SortControl
                sortBy={filters.sortBy as any}
                onSortChange={(value) => updateFilter('sortBy', value)}
                totalResults={filteredTests.length}
              />
            </div>

            {filteredTests.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                {filteredTests.map((test) => (
                  <TestCard key={test.id} test={test as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <span className="text-4xl">🔍</span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No Tests Found</h3>
                <p className="text-slate-600 dark:text-slate-300">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
