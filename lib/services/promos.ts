export interface PromoCode {
  id?: string
  code: string
  discount_percentage?: number
  discount_amount?: number
}

// Simple mock implementation without database
export async function validatePromoCode(code: string): Promise<{ discount: number; type: 'percentage' | 'amount' } | null> {
  const codeUpper = code.toUpperCase()
  
  // Hardcoded promo codes for simplicity
  const promos: Record<string, { discount: number; type: 'percentage' | 'amount' }> = {
    'WELCOME10': { discount: 10, type: 'percentage' },
    'HEALTH20': { discount: 20, type: 'percentage' },
    'FLAT500': { discount: 500, type: 'amount' },
  }
  
  return promos[codeUpper] || null
}

