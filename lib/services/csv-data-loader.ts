import { parse } from 'csv-parse/sync'

export interface LabTest {
  id: string
  name: string
  price: number
  mrp?: number
  description: string
  category: string
  homeCollection: boolean
  reportTime: string
  fasting?: boolean
  parameters?: string[]
}

export interface HealthPackage {
  id: string
  name: string
  price: number
  mrp?: number
  description: string
  includes: string[]
  testCount: number
  benefits?: string[]
}

export interface Category {
  id: string
  name: string
  type: string
}

let cachedTests: LabTest[] | null = null
let cachedPackages: HealthPackage[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 3600000 // 1 hour

async function fetchCSV(filename: string): Promise<string> {
  try {
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) throw new Error(`Failed to fetch ${filename}`)
    return await response.text()
  } catch (error) {
    console.error(`[v0] Error fetching CSV ${filename}:`, error)
    return ''
  }
}

export async function loadTests(): Promise<LabTest[]> {
  const now = Date.now()
  if (cachedTests && now - cacheTimestamp < CACHE_DURATION) {
    return cachedTests
  }

  try {
    const csvContent = await fetchCSV('tests.csv')
    if (!csvContent) return []

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as any[]

    cachedTests = records.map((row, idx) => ({
      id: row.test_id || `TST${idx}`,
      name: row.test_name || row.name || '',
      price: parseFloat(row.price) || 0,
      mrp: parseFloat(row.mrp) || parseFloat(row.price) || 0,
      description: row.description || row.test_description || '',
      category: row.category || 'General',
      homeCollection: row.home_collection === 'true' || row.home_collection === true,
      reportTime: row.turnaround_time || row.report_time || '24 hours',
      fasting: row.fasting_required === 'true' || row.fasting_required === true,
      parameters: row.parameters ? row.parameters.split(';').map((p: string) => p.trim()) : [],
    }))

    cacheTimestamp = now
    console.log(`[v0] Loaded ${cachedTests.length} tests from CSV`)
    return cachedTests
  } catch (error) {
    console.error('[v0] Error loading tests:', error)
    return []
  }
}

export async function loadPackages(): Promise<HealthPackage[]> {
  const now = Date.now()
  if (cachedPackages && now - cacheTimestamp < CACHE_DURATION) {
    return cachedPackages
  }

  try {
    const csvContent = await fetchCSV('packages.csv')
    if (!csvContent) return []

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    }) as any[]

    cachedPackages = records.map((row, idx) => ({
      id: row.package_id || `PKG${idx}`,
      name: row.package_name || row.name || '',
      price: parseFloat(row.price) || 0,
      mrp: parseFloat(row.mrp) || parseFloat(row.original_price) || parseFloat(row.price) || 0,
      description: row.description || row.package_description || '',
      includes: row.tests_included
        ? row.tests_included.split(';').map((t: string) => t.trim())
        : [],
      testCount: parseInt(row.test_count) || parseInt(row.tests_count) || 0,
      benefits: row.benefits ? row.benefits.split(';').map((b: string) => b.trim()) : [],
    }))

    cacheTimestamp = now
    console.log(`[v0] Loaded ${cachedPackages.length} packages from CSV`)
    return cachedPackages
  } catch (error) {
    console.error('[v0] Error loading packages:', error)
    return []
  }
}

export async function searchTests(query: string): Promise<LabTest[]> {
  const tests = await loadTests()
  const lowerQuery = query.toLowerCase()

  return tests.filter(
    (test) =>
      test.name.toLowerCase().includes(lowerQuery) ||
      test.description.toLowerCase().includes(lowerQuery) ||
      test.category.toLowerCase().includes(lowerQuery)
  )
}

export async function getTestsByCategory(category: string): Promise<LabTest[]> {
  const tests = await loadTests()
  return tests.filter((test) => test.category.toLowerCase() === category.toLowerCase())
}

export async function getPackageById(id: string): Promise<HealthPackage | undefined> {
  const packages = await loadPackages()
  return packages.find((pkg) => pkg.id === id)
}

export async function getTestById(id: string): Promise<LabTest | undefined> {
  const tests = await loadTests()
  return tests.find((test) => test.id === id)
}
