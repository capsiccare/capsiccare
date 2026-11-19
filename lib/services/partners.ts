export type PartnerType = 'health' | 'business'

// Simple mock implementation without database
export async function validatePartnerCode(code: string) {
  const codeUpper = code.toUpperCase()
  
  // Hardcoded partner codes for simplicity
  const partners: Record<string, { partner_code: string; commission_rate: number }> = {
    'PARTNER1': { partner_code: 'PARTNER1', commission_rate: 10 },
    'DOC50': { partner_code: 'DOC50', commission_rate: 15 },
  }
  
  return partners[codeUpper] || null
}

