import type { Metadata } from 'next'
import { DoctorsDirectory } from '@/components/doctors-directory'
import { doctorsData } from '@/data/doctors'

export const metadata: Metadata = {
  title: 'Specialist Doctors in Bankra & Nearby Areas | Book Consultation | Capsic Care',
  description: 'Consult top specialist doctors in Bankra, Kona, Domjur, Makardah & Santragachi. Family Physicians, Pediatricians, Gynecologists, Orthopedics, Diabetologists & Pain Specialists. In-Clinic at Bankra Bazar & Assisted Telemedicine.',
  keywords: [
    'Doctors in Bankra',
    'Specialist Doctor in Bankra',
    'Best Doctor Near Bankra',
    'Doctor in Domjur',
    'Doctor in Kona',
    'Doctor in Makardah',
    'Doctor in Santragachi',
    'Pediatrician in Bankra',
    'Gynecologist in Bankra',
    'Orthopedic Doctor in Bankra',
    'Pain Specialist Bankra',
    'Diabetologist Bankra',
    'Family Physician Bankra',
    'Doctor Consultation Fee Bankra',
    'Doctor in Bankra Bazar Howrah'
  ],
  alternates: {
    canonical: 'https://capsic.in/doctors'
  },
  openGraph: {
    title: 'Specialist Doctors in Bankra & Nearby Areas | Book Consultation | Capsic Care',
    description: 'Consult top specialist doctors in Bankra, Kona, Domjur, Makardah & Santragachi. In-clinic at Bankra Bazar & Assisted Telemedicine.',
    url: 'https://capsic.in/doctors',
    siteName: 'Capsic Care Healthcare & Diagnostics',
    images: ['/logo.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Specialist Doctors in Bankra & Howrah | Capsic Care',
    description: 'Consult top specialist doctors in Bankra, Kona, Domjur & Santragachi. Affordable fees from ₹300.',
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

export default function DoctorsPage() {
  const doctorsDirectoryJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        name: 'Capsic Care Healthcare & Diagnostic Centre',
        url: 'https://capsic.in/doctors',
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
        '@type': 'ItemList',
        name: 'Specialist Doctors at Capsic Care Bankra',
        itemListElement: doctorsData.map((doc, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: `${doc.name} - ${doc.specialty}`,
          url: `https://capsic.in/doctors/${doc.id}`
        }))
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
            name: 'Doctors',
            item: 'https://capsic.in/doctors'
          }
        ]
      }
    ]
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14] py-16 md:py-24">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorsDirectoryJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-6 mb-12 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-400 font-bold rounded-full text-sm uppercase tracking-wider border border-teal-200 dark:border-teal-800">
            Specialist Doctor Consultations • Bankra & Nearby
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight">
            Consult Top Specialists <br/><span className="text-teal-600 dark:text-teal-400">Right in Bankra & Nearby</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Book physical in-person appointments at our <strong>Bankra Bazar Medical Centre (Dewan Para Rd, Domjur, Howrah)</strong> or connect via <strong>Assisted Telemedicine</strong> across Bankra, Kona, Makardah, Domjur, Santragachi, and Salap.
          </p>
        </div>

        {/* Interactive Directory with Search, Filter & Dual Booking */}
        <DoctorsDirectory doctors={doctorsData} />

      </div>
    </div>
  )
}
