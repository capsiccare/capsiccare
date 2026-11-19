import { createAdminClient } from '@/lib/supabase/admin'

export interface CartItemInput {
  itemType: 'test' | 'package' | 'consultation' | 'home_collection' | 'other'
  referenceId?: string
  description?: string
  unitPricePaise?: number
  quantity?: number
}

export interface CalculatedItem {
  itemType: 'test' | 'package' | 'consultation' | 'home_collection' | 'other'
  referenceId?: string
  description: string
  quantity: number
  unitPricePaise: number
  discountPaise: number
  taxPaise: number
  totalPaise: number
  isTaxExempt: boolean
  taxRatePercent: number
  hsnSac: string
}

export interface CartPricingResult {
  items: CalculatedItem[]
  subtotalPaise: number
  discountPaise: number
  taxPaise: number
  collectionFeePaise: number
  totalPaise: number
  totalInr: number
  promoCode?: string
  appliedPromo?: {
    code: string
    discountType: string
    discountValue: number
    discountAmountPaise: number
  } | null
  homeCollectionRule?: {
    baseFeePaise: number
    freeThresholdPaise: number
    isFree: boolean
  } | null
}

/**
 * Server-side centralized pricing and tax calculation engine for CAPSIC CARE OS.
 * Strictly operates on integer paise.
 */
export async function calculateCartPricing(params: {
  branchId: string
  items: CartItemInput[]
  isHomeCollection?: boolean
  fulfillmentType?: 'walk_in' | 'home_collection' | string
  promoCode?: string
}): Promise<CartPricingResult> {
  const admin = createAdminClient()
  const { branchId, items, promoCode } = params
  const isHomeCollection = Boolean(params.isHomeCollection || params.fulfillmentType === 'home_collection')

  // 1. Fetch Tax Classifications
  const { data: taxClasses } = await admin
    .from('tax_classifications')
    .select('*')
    .eq('is_active', true)

  const exemptTax = (taxClasses || []).find((t) => t.is_exempt) || {
    rate_percent: 0,
    hsn_sac: '999312',
    is_exempt: true,
  }
  const standardTax = (taxClasses || []).find((t) => t.code === 'GST_18') || {
    rate_percent: 18,
    hsn_sac: '999319',
    is_exempt: false,
  }

  // 2. Fetch Home Collection Fee Rules for the branch or org default
  let baseCollectionFeePaise = 10000 // default ₹100
  let freeCollectionThresholdPaise = 100000 // default ₹1,000

  const { data: colRule } = await admin
    .from('home_collection_rules')
    .select('*')
    .or(`branch_id.eq.${branchId},branch_id.is.null`)
    .eq('is_active', true)
    .order('branch_id', { ascending: false }) // prioritize branch-specific over org-wide
    .limit(1)
    .maybeSingle()

  if (colRule) {
    baseCollectionFeePaise = colRule.base_fee_paise
    freeCollectionThresholdPaise = colRule.free_threshold_paise
  }

  // 3. Process Line Items
  const calculatedItems: CalculatedItem[] = []
  let subtotalPaise = 0

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1)
    let unitPrice = item.unitPricePaise || 0
    let description = item.description || 'Medical Service'
    let isExempt = true
    let taxRate = 0
    let hsn = '999312'

    if (item.itemType === 'test' && item.referenceId) {
      // Lookup test and price
      const { data: test } = await admin
        .from('diagnostic_tests')
        .select('id, name, code')
        .eq('id', item.referenceId)
        .maybeSingle()

      if (test) description = `${test.name} (${test.code})`

      // Lookup price with branch override fallback
      const { data: priceRow } = await admin
        .from('diagnostic_prices')
        .select('price_paise')
        .eq('test_id', item.referenceId)
        .or(`branch_id.eq.${branchId},branch_id.is.null`)
        .eq('is_active', true)
        .order('branch_id', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (priceRow) {
        unitPrice = priceRow.price_paise
      }
      isExempt = true
      taxRate = exemptTax.rate_percent || 0
      hsn = exemptTax.hsn_sac || '999312'
    } else if (item.itemType === 'package' && item.referenceId) {
      // Lookup package and price
      const { data: pkg } = await admin
        .from('diagnostic_packages')
        .select('id, name, code')
        .eq('id', item.referenceId)
        .maybeSingle()

      if (pkg) description = `${pkg.name} (${pkg.code})`

      const { data: priceRow } = await admin
        .from('diagnostic_prices')
        .select('price_paise')
        .eq('package_id', item.referenceId)
        .or(`branch_id.eq.${branchId},branch_id.is.null`)
        .eq('is_active', true)
        .order('branch_id', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (priceRow) {
        unitPrice = priceRow.price_paise
      }
      isExempt = true
      taxRate = exemptTax.rate_percent || 0
      hsn = exemptTax.hsn_sac || '999312'
    } else if (item.itemType === 'consultation') {
      description = item.description || 'Doctor OPD Consultation'
      isExempt = true
      taxRate = 0
      hsn = '999311'
    } else if (item.itemType === 'other') {
      isExempt = false
      taxRate = standardTax.rate_percent || 18
      hsn = standardTax.hsn_sac || '999319'
    }

    const itemSubtotal = unitPrice * qty
    const itemTax = isExempt ? 0 : Math.round((itemSubtotal * taxRate) / 100)
    const itemTotal = itemSubtotal + itemTax

    subtotalPaise += itemSubtotal

    calculatedItems.push({
      itemType: item.itemType,
      referenceId: item.referenceId,
      description,
      quantity: qty,
      unitPricePaise: unitPrice,
      discountPaise: 0,
      taxPaise: itemTax,
      totalPaise: itemTotal,
      isTaxExempt: isExempt,
      taxRatePercent: taxRate,
      hsnSac: hsn,
    })
  }

  // 4. Calculate Home Collection Fee
  let collectionFeePaise = 0
  let isCollectionFree = false

  if (isHomeCollection) {
    if (subtotalPaise >= freeCollectionThresholdPaise) {
      collectionFeePaise = 0
      isCollectionFree = true
    } else {
      collectionFeePaise = baseCollectionFeePaise
      isCollectionFree = false
    }

    // Add home collection as line item
    calculatedItems.push({
      itemType: 'home_collection',
      description: isCollectionFree
        ? 'Home Sample Collection (Complimentary / Free Threshold Met)'
        : 'Home Sample Collection Doorstep Service',
      quantity: 1,
      unitPricePaise: collectionFeePaise,
      discountPaise: isCollectionFree ? baseCollectionFeePaise : 0,
      taxPaise: 0,
      totalPaise: collectionFeePaise,
      isTaxExempt: true,
      taxRatePercent: 0,
      hsnSac: '999312',
    })
  }

  // 5. Evaluate Promo Code & Discounts
  let discountPaise = 0
  let appliedPromo: CartPricingResult['appliedPromo'] = null

  if (promoCode && promoCode.trim()) {
    const cleanCode = promoCode.trim().toUpperCase()
    const { data: promo } = await admin
      .from('promotions')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle()

    if (promo) {
      const minOrder = promo.min_order_paise || 0
      if (subtotalPaise >= minOrder) {
        let calcDiscount = 0
        if (promo.discount_type === 'percentage') {
          calcDiscount = Math.round((subtotalPaise * promo.discount_value) / 100)
        } else {
          calcDiscount = promo.discount_value
        }

        if (promo.max_discount_paise && calcDiscount > promo.max_discount_paise) {
          calcDiscount = promo.max_discount_paise
        }

        // Never exceed subtotal
        calcDiscount = Math.min(calcDiscount, subtotalPaise)
        discountPaise = calcDiscount

        appliedPromo = {
          code: promo.code,
          discountType: promo.discount_type,
          discountValue: promo.discount_value,
          discountAmountPaise: calcDiscount,
        }
      }
    }
  }

  // 6. Tax summation across all items
  const taxPaise = calculatedItems.reduce((sum, it) => sum + it.taxPaise, 0)

  // 7. Final Net Total
  const totalPaise = Math.max(0, subtotalPaise - discountPaise + collectionFeePaise + taxPaise)

  return {
    items: calculatedItems,
    subtotalPaise,
    discountPaise,
    taxPaise,
    collectionFeePaise,
    totalPaise,
    totalInr: Math.round(totalPaise / 100),
    promoCode: appliedPromo?.code,
    appliedPromo,
    homeCollectionRule: isHomeCollection
      ? {
          baseFeePaise: baseCollectionFeePaise,
          freeThresholdPaise: freeCollectionThresholdPaise,
          isFree: isCollectionFree,
        }
      : null,
  }
}
