import type { Metadata } from 'next'
import { getDiagnosticData } from '@/lib/data/data-service'
import { HealthPackagesClient } from './client-page'

export const metadata: Metadata = {
  title: 'Affordable Health Packages & Full Body Checkups in Bankra | Capsic Care',
  description: 'Book affordable full-body health checkup packages with free home sample collection in Bankra, Bankra Bazar, Kabar Para, Kona, Makardah, Domjur & Santragachi. Transparent pricing, NABL certified labs & 24h reports on WhatsApp. Call/WhatsApp +91 8910260709.',
  keywords: [
    'Affordable health packages Bankra',
    'Full body checkup Bankra',
    'Health packages near me',
    'Blood test packages Howrah',
    'Master health checkup Domjur',
    'Senior citizen health package Kona',
    'Diabetes care package Makardah',
    'Cardiac heart checkup package Santragachi',
    'Free home sample collection health checkup Howrah',
    'Capsic Care health packages'
  ],
  alternates: {
    canonical: 'https://capsic.in/health-packages'
  },
  openGraph: {
    title: 'Affordable Health Packages & Full Body Checkups in Bankra | Capsic Care',
    description: 'Book comprehensive health checkup packages with free home sample collection across Bankra, Kona, Domjur & Santragachi. NABL certified lab reports in 24 hours.',
    url: 'https://capsic.in/health-packages',
    siteName: 'Capsic Care Diagnostics',
    images: ['/logo.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affordable Full Body Checkups in Bankra | Capsic Care',
    description: 'Book full body health checkups with free doorstep home collection in Bankra, Howrah.',
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

export default async function HealthPackagesPage() {
  const data = getDiagnosticData()

  const packagesJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalBusiness',
        name: 'Capsic Care Diagnostics',
        url: 'https://capsic.in/health-packages',
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
        name: 'Affordable Health Packages in Bankra & Howrah',
        url: 'https://capsic.in/health-packages',
        description: 'Doctor curated preventive health screening packages with free home collection.'
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
            name: 'Health Packages',
            item: 'https://capsic.in/health-packages'
          }
        ]
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(packagesJsonLd) }}
      />
      <HealthPackagesClient initialPackages={data.packages} />
    </>
  )
}
