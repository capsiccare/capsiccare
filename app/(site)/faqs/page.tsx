import { getDiagnosticData } from '@/lib/data/data-service'
import { FAQsClient } from './client-page'

export const metadata = {
  title: 'Frequently Asked Questions | Capsic Care',
  description: 'Find answers to common questions about our services, booking process, and test procedures.'
}

export default async function FAQsPage() {
  const data = getDiagnosticData()
  
  return <FAQsClient faqs={data.faqs || []} />
}
