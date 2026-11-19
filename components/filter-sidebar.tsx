'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'



interface FilterSidebarProps {
  filters: any
  categories: string[] // Passed down from server
  sampleTypes: string[] // Dynamically computed
  onFilterChange: (key: string, value: any) => void
  onReset: () => void
  totalResults: number
}

export function FilterSidebar({
  filters,
  categories,
  sampleTypes,
  onFilterChange,
  onReset,
  totalResults,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    category: true,
    price: true,
    sampleType: false,
    homeCollection: true,
    tat: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3
          className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('search')}
        >
          <span>Search Tests</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.search ? '' : '-rotate-90'}`}
          />
        </h3>
        {expandedSections.search && (
          <Input
            type="text"
            placeholder="Search tests..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
          />
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h3
          className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('category')}
        >
          <span>Category</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.category ? '' : '-rotate-90'}`}
          />
        </h3>
        {expandedSections.category && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-start gap-3 cursor-pointer group py-1"
              >
                <div className="mt-0.5">
                  <Checkbox
                    checked={filters.category === cat}
                    onCheckedChange={(checked) =>
                      onFilterChange('category', checked ? cat : '')
                    }
                  />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-teal-600 transition-all duration-300 ease-out flex-1 leading-snug">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3
          className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <span>Price Range</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.price ? '' : '-rotate-90'}`}
          />
        </h3>
        {expandedSections.price && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-200">
                Min Price: ₹{filters.minPrice}
              </label>
              <input
                type="range"
                min="0"
                max="30000"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-200">
                Max Price: ₹{filters.maxPrice}
              </label>
              <input
                type="range"
                min="0"
                max="30000"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sample Type */}
      <div>
        <h3
          className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('sampleType')}
        >
          <span>Sample Type</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.sampleType ? '' : '-rotate-90'}`}
          />
        </h3>
        {expandedSections.sampleType && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sampleTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox
                  checked={filters.sampleType === type}
                  onCheckedChange={(checked) =>
                    onFilterChange('sampleType', checked ? type : '')
                  }
                />
                <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-teal-600 transition-all duration-300 ease-out">
                  {type}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Turnaround Time */}
      <div>
        <h3
          className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('tat')}
        >
          <span>Turnaround Time</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.tat ? '' : '-rotate-90'}`}
          />
        </h3>
        {expandedSections.tat && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {['Same Day', '24 Hours', '48 Hours', '3-4 Days'].map((t) => (
              <label
                key={t}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox
                  checked={filters.tat === t}
                  onCheckedChange={(checked) =>
                    onFilterChange('tat', checked ? t : '')
                  }
                />
                <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-teal-600 transition-all duration-300 ease-out flex-1 leading-snug">
                  {t}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Home Collection Toggle */}
      <div>
        <h3
          className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('homeCollection')}
        >
          <span>Availability</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.homeCollection ? '' : '-rotate-90'}`}
          />
        </h3>
        {expandedSections.homeCollection && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.homeCollection}
                onCheckedChange={(checked) =>
                  onFilterChange('homeCollection', checked === true)
                }
              />
              <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-teal-600 transition-all duration-300 ease-out">
                Home Collection Available
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Results & Reset */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-200">
          Found <span className="font-semibold text-teal-600">{totalResults}</span>{' '}
          tests
        </p>
        {(filters.search ||
          filters.category ||
          filters.sampleType ||
          filters.tat ||
          filters.homeCollection ||
          filters.minPrice > 0 ||
          filters.maxPrice < 30000) && (
          <Button
            onClick={onReset}
            variant="outline"
            className="w-full border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/20"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}
