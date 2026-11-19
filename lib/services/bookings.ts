export interface Booking {
  id?: string
  booking_id?: string
  customer_id?: string
  full_name: string
  phone: string
  email?: string
  address: string
  city: string
  pincode: string
  date_of_birth?: string
  gender?: string
  notes?: string
  promo_code?: string
  partner_code?: string
  subtotal: number
  discount_amount: number
  total_amount: number
  status?: 'pending' | 'confirmed' | 'collected' | 'cancelled'
  test_ids: string[]
  collection_date?: string
}

// Simple mock implementation without database
export async function createBooking(booking: Booking) {
  // We simply generate an ID since we don't save to the database.
  // The workflow expects an object with booking_id.
  const bookingId = `BC-${Date.now()}`
  return { ...booking, booking_id: bookingId }
}

