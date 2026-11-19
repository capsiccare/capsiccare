'use client'

import { useState, useMemo } from 'react'
import { useDataManagement } from '@/hooks/use-data-management'

export interface FilterOptions {
  search: string
  category: string
  minPrice: number
  maxPrice: number
  organ: string
  gender: string
  homeCollection: boolean
  hasDiscount: boolean
  sortBy: 'price-low' | 'price-high' | 'discount' | 'name' | 'popular'
}

export function useFilters() {
  const { labTests } = useDataManagement()
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 20000,
    organ: '',
    gender: '',
    homeCollection: false,
    hasDiscount: false,
    sortBy: 'popular',
  })

  const filteredTests = useMemo(() => {
    let results = [...labTests]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      results = results.filter(
        (test) =>
          test.name.toLowerCase().includes(searchLower) ||
          test.description.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.category) {
      results = results.filter((test) => test.category === filters.category)
    }

    // Price filter
    results = results.filter(
      (test) =>
        test.price >= filters.minPrice && test.price <= filters.maxPrice
    )

    // Organ filter
    if (filters.organ) {
      results = results.filter((test) =>
        test.organs.includes(filters.organ)
      )
    }

    // Gender filter
    if (filters.gender) {
      results = results.filter(
        (test) =>
          test.gender === 'all' || test.gender === filters.gender
      )
    }

    // Home collection filter
    if (filters.homeCollection) {
      results = results.filter((test) => test.homeCollection)
    }

    // Discount filter
    if (filters.hasDiscount) {
      results = results.filter((test) => test.discount && test.discount > 0)
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        results.sort((a, b) => b.price - a.price)
        break
      case 'discount':
        results.sort((a, b) => (b.discount || 0) - (a.discount || 0))
        break
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popular':
      default:
        // Keep original order (most popular)
        break
    }

    return results
  }, [filters, labTests])

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 20000,
      organ: '',
      gender: '',
      homeCollection: false,
      hasDiscount: false,
      sortBy: 'popular',
    })
  }

  return {
    filters,
    filteredTests,
    updateFilter,
    resetFilters,
    totalResults: filteredTests.length,
  }
}
