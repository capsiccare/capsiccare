import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId, ApiError } from '@/lib/api/response'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

const createItemSchema = z.object({
  item_type: z.enum(['test', 'package']),
  name: z.string().min(2, 'Name is required').max(255),
  code: z.string().min(2, 'Code is required').max(50),
  category_id: z.string().uuid().optional().nullable(),
  sample_type: z.string().optional().default('Blood / Serum'),
  fasting_required: z.boolean().default(false),
  turnaround_hours: z.number().int().min(1).default(24),
  home_collection_supported: z.boolean().default(true),
  price_paise: z.number().int().min(0, 'Price must be non-negative'),
  mrp_paise: z.number().int().min(0).optional(),
  branch_id: z.string().uuid().optional().nullable(), // optional branch override
  description: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')?.trim()
    const query = searchParams.get('q')?.trim()
    const category = searchParams.get('category')?.trim()
    const itemType = searchParams.get('type')?.trim() || 'all'
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10))

    const supabase = await createServerSupabaseClient()

    let testsList: any[] = []
    let packagesList: any[] = []

    // 1. Query Diagnostic Tests
    if (itemType === 'all' || itemType === 'test') {
      let testQuery = supabase
        .from('diagnostic_tests')
        .select(`
          id, code, name, slug, sample_type, fasting_required,
          turnaround_hours, home_collection_supported, description, is_active,
          diagnostic_categories ( id, name, slug )
        `)
        .eq('is_active', true)

      if (query) {
        testQuery = testQuery.or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      }

      if (category && category !== 'all') {
        testQuery = testQuery.eq('category_id', category)
      }

      const { data: tests, error: testErr } = await testQuery
        .order('name', { ascending: true })
        .limit(limit)

      if (testErr) {
        throw new ApiError('DATABASE_ERROR', `Failed to query tests: ${testErr.message}`, 500)
      }
      testsList = tests || []
    }

    // 2. Query Diagnostic Packages
    if (itemType === 'all' || itemType === 'package') {
      let pkgQuery = supabase
        .from('diagnostic_packages')
        .select(`
          id, code, name, slug, badge, description, is_active
        `)
        .eq('is_active', true)

      if (query) {
        pkgQuery = pkgQuery.or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      }

      const { data: pkgs, error: pkgErr } = await pkgQuery
        .order('name', { ascending: true })
        .limit(limit)

      if (pkgErr) {
        throw new ApiError('DATABASE_ERROR', `Failed to query packages: ${pkgErr.message}`, 500)
      }
      packagesList = pkgs || []
    }

    // 3. Batch Query Prices
    const allTestIds = testsList.map((t) => t.id)
    const allPkgIds = packagesList.map((p) => p.id)

    let testPrices: any[] = []
    if (allTestIds.length > 0) {
      let priceQ = supabase
        .from('diagnostic_prices')
        .select('test_id, price_paise, mrp_paise, branch_id')
        .in('test_id', allTestIds)
        .eq('is_active', true)

      if (branchId && branchId !== 'all') {
        priceQ = priceQ.or(`branch_id.eq.${branchId},branch_id.is.null`)
      } else {
        priceQ = priceQ.is('branch_id', null)
      }

      const { data: prices } = await priceQ
      testPrices = prices || []
    }

    let pkgPrices: any[] = []
    if (allPkgIds.length > 0) {
      let priceQ = supabase
        .from('diagnostic_prices')
        .select('package_id, price_paise, mrp_paise, branch_id')
        .in('package_id', allPkgIds)
        .eq('is_active', true)

      if (branchId && branchId !== 'all') {
        priceQ = priceQ.or(`branch_id.eq.${branchId},branch_id.is.null`)
      } else {
        priceQ = priceQ.is('branch_id', null)
      }

      const { data: prices } = await priceQ
      pkgPrices = prices || []
    }

    // 4. Merge results
    const formattedTests = testsList.map((t) => {
      // Find branch price or default org price
      const priceRow =
        testPrices.find((p) => p.test_id === t.id && p.branch_id === branchId) ||
        testPrices.find((p) => p.test_id === t.id && p.branch_id === null)
      const pricePaise = priceRow ? priceRow.price_paise : 0
      const mrpPaise = priceRow ? (priceRow.mrp_paise || pricePaise) : 0

      return {
        id: t.id,
        code: t.code,
        name: t.name,
        slug: t.slug,
        itemType: 'test' as const,
        categoryId: t.diagnostic_categories?.id,
        categoryName: t.diagnostic_categories?.name || 'General Pathology',
        sampleType: t.sample_type,
        fastingRequired: t.fasting_required,
        turnaroundHours: t.turnaround_hours,
        homeCollectionSupported: t.home_collection_supported,
        pricePaise,
        priceInr: Math.round(pricePaise / 100),
        mrpPaise,
        mrpInr: Math.round(mrpPaise / 100),
        discountPaise: Math.max(0, mrpPaise - pricePaise),
        isActive: t.is_active,
      }
    })

    const formattedPackages = packagesList.map((p) => {
      const priceRow =
        pkgPrices.find((pr) => pr.package_id === p.id && pr.branch_id === branchId) ||
        pkgPrices.find((pr) => pr.package_id === p.id && pr.branch_id === null)
      const pricePaise = priceRow ? priceRow.price_paise : 0
      const mrpPaise = priceRow ? (priceRow.mrp_paise || pricePaise) : 0

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        slug: p.slug,
        itemType: 'package' as const,
        badge: p.badge || 'POPULAR',
        sampleType: 'Blood / Fasting Profile',
        fastingRequired: true,
        turnaroundHours: 24,
        homeCollectionSupported: true,
        pricePaise,
        priceInr: Math.round(pricePaise / 100),
        mrpPaise,
        mrpInr: Math.round(mrpPaise / 100),
        discountPaise: Math.max(0, mrpPaise - pricePaise),
        isActive: p.is_active,
      }
    })

    const combined = [...formattedPackages, ...formattedTests]
    const paginated = combined.slice(offset, offset + limit)

    return successResponse(paginated, {
      total: combined.length,
      limit,
      offset,
    }, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = createItemSchema.parse(body)

    const admin = createAdminClient()
    const mrpPaise = parsed.mrp_paise || parsed.price_paise

    if (parsed.item_type === 'test') {
      const { data: test, error: testErr } = await admin
        .from('diagnostic_tests')
        .insert({
          organization_id: user.organizationId,
          code: parsed.code.trim().toUpperCase(),
          name: parsed.name.trim(),
          slug: parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          category_id: parsed.category_id || null,
          sample_type: parsed.sample_type,
          fasting_required: parsed.fasting_required,
          turnaround_hours: parsed.turnaround_hours,
          home_collection_supported: parsed.home_collection_supported,
          description: parsed.description || null,
          is_active: true,
        })
        .select()
        .single()

      if (testErr || !test) {
        throw new ApiError('DATABASE_ERROR', `Failed to create test: ${testErr?.message}`, 500)
      }

      // Insert Price
      await admin.from('diagnostic_prices').insert({
        organization_id: user.organizationId,
        branch_id: parsed.branch_id || null,
        item_type: 'test',
        test_id: test.id,
        price_paise: parsed.price_paise,
        mrp_paise: mrpPaise,
        is_active: true,
      })

      await recordAuditEvent({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DIAGNOSTIC_TEST_CREATED',
        entityType: 'diagnostic_test',
        entityId: test.id,
        newValues: test,
      })

      return successResponse(test, undefined, 201, requestId)
    } else {
      const { data: pkg, error: pkgErr } = await admin
        .from('diagnostic_packages')
        .insert({
          organization_id: user.organizationId,
          code: parsed.code.trim().toUpperCase(),
          name: parsed.name.trim(),
          slug: parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: parsed.description || null,
          is_active: true,
        })
        .select()
        .single()

      if (pkgErr || !pkg) {
        throw new ApiError('DATABASE_ERROR', `Failed to create package: ${pkgErr?.message}`, 500)
      }

      await admin.from('diagnostic_prices').insert({
        organization_id: user.organizationId,
        branch_id: parsed.branch_id || null,
        item_type: 'package',
        package_id: pkg.id,
        price_paise: parsed.price_paise,
        mrp_paise: mrpPaise,
        is_active: true,
      })

      await recordAuditEvent({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DIAGNOSTIC_PACKAGE_CREATED',
        entityType: 'diagnostic_package',
        entityId: pkg.id,
        newValues: pkg,
      })

      return successResponse(pkg, undefined, 201, requestId)
    }
  } catch (err) {
    return handleApiError(err, req)
  }
}
