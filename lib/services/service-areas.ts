export interface ServiceArea {
  id: string
  state: string
  district: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// All West Bengal districts are serviceable
const westBengalDistricts = [
  'Kolkata', 'Howrah', 'West Midnapore', 'East Midnapore', 'Nadia',
  'North 24 Parganas', 'South 24 Parganas', 'Birbhum', 'Bankura',
  'Purba Bardhaman', 'Paschim Bardhaman', 'Jalpaiguri', 'Darjeeling', 'Kalimpong'
]

export async function getServiceAreas(): Promise<ServiceArea[]> {
  try {
    return westBengalDistricts.map((district, idx) => ({
      id: `SA-${idx}`,
      state: 'West Bengal',
      district,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  } catch (error) {
    console.error('[v0] Error fetching service areas:', error)
    return []
  }
}

export async function getServiceAreasByState(state: string): Promise<ServiceArea[]> {
  try {
    if (state !== 'West Bengal') return []
    return await getServiceAreas()
  } catch (error) {
    console.error('[v0] Error fetching service areas for state:', error)
    return []
  }
}

export async function isServiceAvailable(state: string, district: string): Promise<boolean> {
  try {
    if (state !== 'West Bengal') {
      console.log('[v0] Service not available in state:', state)
      return false
    }

    const isAvailable = westBengalDistricts.includes(district)
    console.log('[v0] Service availability for', district, ':', isAvailable)
    return isAvailable
  } catch (error) {
    console.error('[v0] Error checking service availability:', error)
    return false
  }
}

