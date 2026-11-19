/**
 * WhatsApp Integration Service
 * Generates WhatsApp message URLs with all booking/form details
 * Users click the link to open WhatsApp with pre-filled message
 */

export interface BookingWhatsAppData {
  fullName: string
  phone: string
  email?: string
  address: string
  city: string
  state: string
  pincode: string
  dateOfBirth?: string
  gender?: string
  tests: Array<{ name: string; price: number }>
  totalAmount: number
  discountAmount?: number
  finalAmount: number
  promoCode?: string
  partnerCode?: string
  notes?: string
  prescriptionFileName?: string
  collectionDate?: string
  bookingId: string
}

export interface PartnerFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  partnerType: 'health_professional' | 'business_partner'
  profession?: string
  businessType?: string
  organization?: string
  message?: string
}

export interface BlogFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

/**
 * Generate WhatsApp message for booking
 */
export function generateBookingWhatsAppMessage(data: BookingWhatsAppData): string {
  const testsList = data.tests.map(t => {
    const mrp = Math.max((t as any).mrp || t.price, t.price)
    const savings = mrp - t.price
    if (savings > 0) {
      return `• *${t.name}*\n   ₹${t.price} ~(MRP: ₹${mrp})~ _Save ₹${savings}_`
    }
    return `• *${t.name}* — ₹${t.price}`
  }).join('\n')
  
  const isFreeCollection = (data.finalAmount || data.totalAmount) >= 2000
  const collectionStatus = isFreeCollection
    ? `✅ *FREE Doorstep Home Collection Qualified*\n   _(Order value ₹${data.finalAmount} ≥ ₹2,000 in Howrah & Kolkata)_`
    : `🚚 *Home Collection:* Free on orders above ₹2,000 (Howrah & Kolkata)\n   _For updated collection charges or prices, contact 8910260709._`

  const message = `🏥 *CAPSIC CARE DIAGNOSTICS*
*Lab Test Booking Request*
━━━━━━━━━━━━━━━━━━━━━━━

📋 *Booking ID:* ${data.bookingId}

👤 *Patient Details:*
• Name: *${data.fullName}*
• Phone: ${data.phone}${data.gender ? `\n• Gender: ${data.gender}` : ''}${data.dateOfBirth ? `\n• DOB / Age: ${data.dateOfBirth}` : ''}${data.email ? `\n• Email: ${data.email}` : ''}

📍 *Collection Address:*
• ${data.address}
• ${data.city}, ${data.state} - ${data.pincode}

🧪 *Selected Tests / Packages:*
${testsList}

💰 *Payment Summary:*
• Subtotal: ₹${data.totalAmount}${data.discountAmount && data.discountAmount > 0 ? `\n• Discount Savings: -₹${data.discountAmount}` : ''}
• *Final Amount Payable: ₹${data.finalAmount}*
${data.promoCode ? `• Promo Code: ${data.promoCode}\n` : ''}${data.partnerCode ? `• Partner Code: ${data.partnerCode}\n` : ''}
${collectionStatus}
${data.collectionDate ? `\n📅 *Preferred Collection Date:* ${data.collectionDate}` : ''}${data.prescriptionFileName ? `\n📎 *Prescription:* ${data.prescriptionFileName}` : ''}${data.notes ? `\n📝 *Notes:* ${data.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━
📞 *Helpline / WhatsApp:* +91 8910260709
🌐 *Website:* https://capsic.in

_Please confirm my booking and assign a phlebotomist._`

  return encodeURIComponent(message)
}

/**
 * Generate WhatsApp message for partner inquiry
 */
export function generatePartnerWhatsAppMessage(data: PartnerFormData): string {
  const message = `🤝 *CAPSIC CARE - PARTNER INQUIRY*
━━━━━━━━━━━━━━━━━━━━━━━

💼 *Type:* ${data.partnerType === 'health_professional' ? 'Health Professional' : 'Business Partner'}

👤 *Contact Information:*
• Name: *${data.firstName} ${data.lastName}*
• Phone: ${data.phone}
• Email: ${data.email}
${data.partnerType === 'health_professional' 
  ? `• Profession: ${data.profession || 'Not specified'}`
  : `• Business Type: ${data.businessType || 'Not specified'}\n• Organization: ${data.organization || 'Not specified'}`
}
${data.message ? `\n💬 *Message:*\n"${data.message}"\n` : ''}
📍 *Service Coverage:* Howrah, Kolkata & Nearby Districts
🚚 *Home Sample Collection:* Free for orders above ₹2,000
━━━━━━━━━━━━━━━━━━━━━━━
📞 *Direct Helpline:* +91 8910260709
🌐 *Website:* https://capsic.in

_Please contact me regarding partnership opportunities._`

  return encodeURIComponent(message)
}

/**
 * Generate WhatsApp message for blog inquiry
 */
export function generateBlogWhatsAppMessage(data: BlogFormData): string {
  const message = `📩 *CAPSIC CARE - INQUIRY*
━━━━━━━━━━━━━━━━━━━━━━━

👤 *Sender Details:*
• Name: *${data.name}*
• Phone: ${data.phone}
• Email: ${data.email}

📌 *Subject:* ${data.subject}

💬 *Message:*
${data.message}
━━━━━━━━━━━━━━━━━━━━━━━
📞 *Helpline / WhatsApp:* +91 8910260709
🌐 *Website:* https://capsic.in`

  return encodeURIComponent(message)
}

/**
 * Get WhatsApp business number
 * Replace this with your actual business WhatsApp number
 */
export function getWhatsAppBusinessNumber(): string {
  // Format: country code + number (e.g., 918910260709 for +91 8910260709)
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918910260709'
}

/**
 * Generate WhatsApp chat link
 */
export function getWhatsAppChatLink(
  phoneNumber: string,
  message: string
): string {
  return `https://wa.me/${phoneNumber}?text=${message}`
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsAppChat(
  message: string,
  phoneNumber?: string
): void {
  const businessNumber = phoneNumber || getWhatsAppBusinessNumber()
  const link = getWhatsAppChatLink(businessNumber, message)
  
  if (typeof window !== 'undefined') {
    window.open(link, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Share booking details to WhatsApp
 */
export function shareBookingToWhatsApp(data: BookingWhatsAppData, phoneNumber?: string): void {
  const message = generateBookingWhatsAppMessage(data)
  openWhatsAppChat(message, phoneNumber)
}

/**
 * Share partner inquiry to WhatsApp
 */
export function sharePartnerInquiryToWhatsApp(data: PartnerFormData, phoneNumber?: string): void {
  const message = generatePartnerWhatsAppMessage(data)
  openWhatsAppChat(message, phoneNumber)
}

/**
 * Share blog inquiry to WhatsApp
 */
export function shareBlogInquiryToWhatsApp(data: BlogFormData, phoneNumber?: string): void {
  const message = generateBlogWhatsAppMessage(data)
  openWhatsAppChat(message, phoneNumber)
}
