'use client'

import { useState, useEffect } from 'react'
// Transform packages data to match interface
const healthPackages: any[] = []
const HARDCODED_SAMPLE_FAQS: any[] = []

export interface LabTest {
  id: string
  name: string
  price: number
  mrp?: number
  description: string
  category: string
  testCount: number
  homeCollection: boolean
  organs: string[]
  gender: string
  discount?: number
  reportTime: string
  features?: string[]
}

export interface HealthPackage {
  id: string
  name: string
  price: number
  mrp?: number
  description: string
  category: string
  testCount: number
  benefits?: string[]
  idealFor?: string
  fasting?: boolean
}

export interface Category {
  id: string
  name: string
  type: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const transformedPackages: HealthPackage[] = healthPackages.map((pkg: any) => ({
  id: pkg.id,
  name: pkg.name,
  price: pkg.price,
  mrp: pkg.mrp,
  description: pkg.description,
  category: 'Health Package',
  testCount: pkg.testsCount,
  benefits: pkg.testsList || [],
  idealFor: pkg.ideal,
  fasting: pkg.fastingRequired,
}))

// Fallback data for immediate rendering
const FALLBACK_DATA = {
  labTests: [],
  healthPackages: transformedPackages,
  categories: [
    { id: 'cat-1', name: 'Blood Tests', type: 'diagnostic' },
    { id: 'cat-2', name: 'Heart & Lipid Tests', type: 'diagnostic' },
    { id: 'cat-3', name: 'Thyroid Tests', type: 'diagnostic' },
    { id: 'cat-4', name: 'Vitamin Tests', type: 'diagnostic' },
    { id: 'cat-5', name: 'Infection Tests', type: 'diagnostic' },
    { id: 'cat-6', name: 'General Lab Tests', type: 'diagnostic' },
    { id: 'cat-7', name: 'Urine Tests', type: 'diagnostic' },
  ],
  faqs: (HARDCODED_SAMPLE_FAQS || []),
}

// DIRECT DATA - NO ASYNC, NO LOADING DELAYS
// All tests are pre-loaded from the CSV file at build time
export function useDataManagement() {
  const [labTests, setLabTests] = useState<LabTest[]>(FALLBACK_DATA.labTests)
  const [healthPackages] = useState<HealthPackage[]>(FALLBACK_DATA.healthPackages)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all 694 tests from API
    const loadTests = async () => {
      try {
        const response = await fetch('/api/all-tests')
        if (response.ok) {
          const data = await response.json()
          if (data.tests && data.tests.length > 0) {
            console.log(`[v0] SUCCESS: Loaded ${data.tests.length} tests`)
            setLabTests(data.tests)
          }
        }
      } catch (err) {
        console.log('[v0] Error loading tests, using fallback')
      } finally {
        setLoading(false)
      }
    }

    loadTests()
  }, [])

  return {
    labTests,
    healthPackages,
    categories: FALLBACK_DATA.categories,
    faqs: FALLBACK_DATA.faqs,
    loading,
    error: null,
  }
}
