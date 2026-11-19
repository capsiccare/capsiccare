import type { Metadata } from 'next'
import { getDiagnosticData } from '@/lib/data/data-service'
import { LabTestsClient } from './client-page'

export const metadata: Metadata = {
  title: 'Affordable Lab Tests & Blood Tests in Bankra, Howrah | Capsic Care Diagnostics',
  description: 'Book 100+ low-cost blood tests and pathology diagnostic investigations in Bankra, Kona, Domjur, Makardah, Santragachi & Howrah. NABL certified lab quality, 100% transparent pricing & free home sample collection. Reports on WhatsApp in 24h. Call/WhatsApp +91 8910260709.',
  keywords: [
    'Affordable blood tests Bankra',
    'Lab tests in Howrah',
    'Blood test near me Bankra',
    'Pathology lab in Bankra',
    'Home sample collection blood test Howrah',
    'CBC test price Bankra',
    'Thyroid test price Bankra',
    'Diabetes sugar test Bankra',
    'Lipid profile test Kona',
    'LFT test Domjur',
    'KFT test Santragachi',
    'Diagnostic centre Bankra Bazar',
    'Low cost pathology lab Kolkata Howrah'
  ],
  alternates: {
    canonical: 'https://capsic.in/lab-tests'
  },
  openGraph: {
    title: 'Affordable Lab Tests & Blood Tests in Bankra, Howrah | Capsic Care',
    description: 'Book 100+ low-cost blood tests with free doorstep home sample collection across Bankra, Kona, Domjur & Santragachi. NABL accredited reports in 24 hours.',
    url: 'https://capsic.in/lab-tests',
    siteName: 'Capsic Care Diagnostics',
    images: ['/logo.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affordable Lab Tests in Bankra & Howrah | Capsic Care',
    description: 'Low-cost pathology blood tests with free home sample collection across Bankra, Domjur & Howrah.',
    images: ['/logo.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
}

export default async function LabTestsPage() {
  const data = getDiagnosticData()

  const labTestsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DiagnosticLab',
        name: 'Capsic Care Diagnostics',
        url: 'https://capsic.in/lab-tests',
        telephone: '+918910260709',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Bankra Bazar, Dewan Para Road',
          addressLocality: 'Domjur, Howrah',
          postalCode: '711403',
          addressRegion: 'West Bengal',
          addressCountry: 'IN'
        }
      },
      {
        '@type': 'CollectionPage',
        name: 'Affordable Pathology Lab Tests in Bankra & Howrah',
        url: 'https://capsic.in/lab-tests',
        description: 'Comprehensive catalogue of individual blood and urine tests with transparent pricing and doorstep collection.'
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://capsic.in'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Lab Tests',
            item: 'https://capsic.in/lab-tests'
          }
        ]
      }
    ]
  }
  
  // We only send the necessary fields to the client to avoid massive hydrated JSON payloads.
  const serializedTests = data.tests.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    price: t.price,
    mrp: t.mrp || t.price,
    category: { name: t.category.name },
    sample_type: t.sample_type,
    turnaround_time: t.turnaround_time,
    home_collection_available: t.home_collection_available,
    short_description: t.short_description || t.full_description,
    full_description: t.full_description,
    parameters: t.parameters.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name
    }))
  }))

  const categories = data.categories.map(c => c.name)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(labTestsJsonLd) }}
      />
      <LabTestsClient initialTests={serializedTests as any} categories={categories} />
    </>
  )
}
