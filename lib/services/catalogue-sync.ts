import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/config/env'

// Zod schemas matching actual CSV headers
const CsvTestSchema = z.object({
  test_id: z.string().min(1),
  test_name: z.string().min(1),
  slug: z.string().optional(),
  category_id: z.string().optional().default('CAT001'),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Price must be a valid non-negative number',
  }),
  mrp: z.string().optional().default('0'),
  sample_type: z.string().optional().default('Blood / Serum'),
  turnaround_time: z.string().optional().default('24 hours'),
  home_collection_available: z.string().optional().default('Yes'),
})

const CsvCategorySchema = z.object({
  category_id: z.string().min(1),
  category_name: z.string().min(1),
  category_slug: z.string().optional(),
  description: z.string().optional(),
})

const CsvPackageSchema = z.object({
  package_id: z.string().min(1),
  package_name: z.string().min(1),
  package_slug: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Price must be a valid non-negative number',
  }),
  discount_price: z.string().optional(),
})

export interface SyncValidationReport {
  timestamp: string
  tests: {
    total: number
    valid: number
    invalid: number
    duplicates: number
    errors: { id: string; error: string }[]
  }
  categories: {
    total: number
    valid: number
    invalid: number
  }
  packages: {
    total: number
    valid: number
    invalid: number
  }
  databaseSyncApplied: boolean
}

function parseCsvFile<T>(filename: string): T[] {
  const filePath = path.join(process.cwd(), 'public', 'data', filename)
  if (!fs.existsSync(filePath)) {
    return []
  }
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const parsed = Papa.parse<T>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })
  return parsed.data
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validates the static CSV catalogue data and optionally synchronizes
 * active records to Supabase PostgreSQL.
 */
export async function syncCatalogueData(dryRun: boolean = true): Promise<SyncValidationReport> {
  const report: SyncValidationReport = {
    timestamp: new Date().toISOString(),
    tests: { total: 0, valid: 0, invalid: 0, duplicates: 0, errors: [] },
    categories: { total: 0, valid: 0, invalid: 0 },
    packages: { total: 0, valid: 0, invalid: 0 },
    databaseSyncApplied: false,
  }

  // 1. Process Categories
  const rawCategories = parseCsvFile<any>('categories.csv')
  report.categories.total = rawCategories.length
  const validatedCategories: { id: string; name: string; slug: string }[] = []

  for (const cat of rawCategories) {
    const parse = CsvCategorySchema.safeParse(cat)
    if (parse.success) {
      report.categories.valid += 1
      validatedCategories.push({
        id: parse.data.category_id,
        name: parse.data.category_name,
        slug: parse.data.category_slug || slugify(parse.data.category_name),
      })
    } else {
      report.categories.invalid += 1
    }
  }

  // 2. Process Tests
  const rawTests = parseCsvFile<any>('tests.csv')
  report.tests.total = rawTests.length
  const seenTestCodes = new Set<string>()
  const validatedTests: {
    code: string
    name: string
    slug: string
    categoryId: string
    pricePaise: number
    mrpPaise: number
    sampleType: string
    turnaroundHours: number
    homeCollection: boolean
  }[] = []

  for (const item of rawTests) {
    const parse = CsvTestSchema.safeParse(item)
    if (!parse.success) {
      report.tests.invalid += 1
      report.tests.errors.push({
        id: item.test_id || 'unknown',
        error: parse.error.issues[0]?.message || 'Invalid row',
      })
      continue
    }

    const {
      test_id,
      test_name,
      slug,
      category_id,
      price,
      mrp,
      sample_type,
      turnaround_time,
      home_collection_available,
    } = parse.data
    const code = `TEST-${test_id}`

    if (seenTestCodes.has(code)) {
      report.tests.duplicates += 1
      continue
    }
    seenTestCodes.add(code)

    const rawPrice = parseFloat(price)
    const rawMrp = parseFloat(mrp) || rawPrice
    const pricePaise = Math.round(rawPrice * 100)
    const mrpPaise = Math.round(Math.max(rawMrp, rawPrice) * 100)
    const turnaroundHours = parseInt(turnaround_time, 10) || 24

    report.tests.valid += 1
    validatedTests.push({
      code,
      name: test_name,
      slug: slug || slugify(test_name),
      categoryId: category_id,
      pricePaise,
      mrpPaise,
      sampleType: sample_type,
      turnaroundHours,
      homeCollection: home_collection_available.toLowerCase() !== 'no',
    })
  }

  // 3. Process Packages
  const rawPackages = parseCsvFile<any>('packages.csv')
  report.packages.total = rawPackages.length
  const validatedPackages: {
    code: string
    name: string
    slug: string
    pricePaise: number
    mrpPaise: number
  }[] = []

  for (const pkg of rawPackages) {
    const parse = CsvPackageSchema.safeParse(pkg)
    if (parse.success) {
      report.packages.valid += 1
      const rawPrice = parseFloat(parse.data.discount_price || parse.data.price)
      const rawMrp = parseFloat(parse.data.price) || rawPrice
      const pricePaise = Math.round(rawPrice * 100)
      const mrpPaise = Math.round(Math.max(rawMrp, rawPrice) * 100)

      validatedPackages.push({
        code: `PKG-${parse.data.package_id}`,
        name: parse.data.package_name,
        slug: parse.data.package_slug || slugify(parse.data.package_name),
        pricePaise,
        mrpPaise,
      })
    } else {
      report.packages.invalid += 1
    }
  }

  // 4. Database Sync (Only if explicitly non-dryRun and Supabase is configured)
  if (!dryRun && isSupabaseConfigured()) {
    try {
      const admin = createAdminClient()
      const { data: org } = await admin.from('organizations').select('id').eq('code', 'CAPSIC_CARE').single()
      if (org) {
        // Upsert categories
        for (const cat of validatedCategories) {
          await admin.from('diagnostic_categories').upsert(
            {
              organization_id: org.id,
              code: `CAT-${cat.id}`,
              name: cat.name,
              slug: cat.slug,
              is_active: true,
            },
            { onConflict: 'slug' }
          )
        }

        report.databaseSyncApplied = true
      }
    } catch (error) {
      console.error('Failed to sync catalogue to database:', error)
    }
  }

  return report
}
