import { Metadata } from 'next'
import { MapPin, Clock, Stethoscope, ArrowRight, Building2, Phone, ShieldCheck, CheckCircle2, Navigation, Calendar, Users, FlaskConical } from 'lucide-react'
import Link from 'next/link'
import { doctorsData } from '@/data/doctors'

export const metadata: Metadata = {
  title: 'Capsic Care Clinic in Bankra Bazar, Howrah | Doctor Consultations & Diagnostics',
  description: 'Visit Capsic Care Community Healthcare Centre at Bankra Bazar, Dewan Para Road, Domjur, Howrah (711403). Specialist OPD doctor consultations, assisted telemedicine, pathology sample collection, and affordable diagnostics. Open Mon-Sat 8AM-8PM, Sun 8AM-2PM. Call/WhatsApp +91 8910260709.',
  keywords: [
    'Clinic in Bankra',
    'Doctors Clinic Bankra Bazar',
    'Medical Centre in Domjur',
    'Capsic Care Clinic',
    'Doctor Consultation in Bankra',
    'Polyclinic in Bankra Howrah',
    'Diagnostic Centre Bankra',
    'Blood Test Clinic Bankra Bazar',
    'Dewan Para Road Clinic',
    'Healthcare Centre Kona Domjur',
    'Doctor Near Me Bankra',
    'Assisted Telemedicine Clinic Howrah',
    'Clinic near Kona Expressway',
    'OPD consultation Bankra'
  ],
  alternates: {
    canonical: 'https://capsic.in/our-clinics'
  },
  openGraph: {
    title: 'Capsic Care Clinic in Bankra Bazar, Howrah | Doctor Consultations & Diagnostics',
    description: 'Visit Capsic Care Community Healthcare Centre at Bankra Bazar, Dewan Para Road, Domjur, Howrah. Specialist doctor consultations, assisted telemedicine, and pathology diagnostics.',
    url: 'https://capsic.in/our-clinics',
    siteName: 'Capsic Care Healthcare & Diagnostics',
    images: ['/logo.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capsic Care Clinic in Bankra Bazar, Howrah',
    description: 'Specialist doctor consultations, assisted telemedicine, and pathology diagnostics at Bankra Bazar, Domjur, Howrah.',
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

export default function OurClinicsPage() {
  const clinicJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': 'https://capsic.in/our-clinics#clinic',
        name: 'Capsic Care Healthcare & Diagnostic Centre',
        description: 'Comprehensive neighbourhood community healthcare clinic providing specialist doctor consultations, assisted telemedicine, pathology diagnostics, and preventive health checks in Bankra, Howrah.',
        url: 'https://capsic.in/our-clinics',
        logo: 'https://capsic.in/logo.png',
        image: 'https://capsic.in/logo.png',
        telephone: '+918910260709',
        priceRange: '₹₹',
        currenciesAccepted: 'INR',
        paymentAccepted: 'Cash, UPI, Debit Card, Credit Card',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Bankra Bazar, Dewan Para Road',
          addressLocality: 'Domjur, Howrah',
          postalCode: '711403',
          addressRegion: 'West Bengal',
          addressCountry: 'IN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '22.6047',
          longitude: '88.2715'
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '08:00',
            closes: '20:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Sunday'],
            opens: '08:00',
            closes: '14:00'
          }
        ],
        areaServed: [
          'Bankra',
          'Bankra Bazar',
          'Kabar Para',
          'Kona',
          'Makardah',
          'Domjur',
          'Santragachi',
          'Salap',
          'Nibra',
          'Andul',
          'Baltikuri',
          'Dasnagar',
          'Kadamtala',
          'Howrah City'
        ],
        availableService: [
          { '@type': 'MedicalTherapy', name: 'Specialist Doctor OPD Consultations' },
          { '@type': 'MedicalTherapy', name: 'Assisted Telemedicine Video Consultations' },
          { '@type': 'MedicalTherapy', name: 'Pathology & Diagnostic Blood Sample Collection' },
          { '@type': 'MedicalTherapy', name: 'Chronic Disease & Preventive Health Triage' }
        ]
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
            name: 'Our Clinics',
            item: 'https://capsic.in/our-clinics'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Where is the Capsic Care Clinic located in Bankra?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Capsic Care Clinic is conveniently located at Bankra Bazar, Dewan Para Road, Domjur, Howrah – 711403, just minutes from the main Bankra market and easily accessible from Kona Expressway, Makardah, and Domjur.'
            }
          },
          {
            '@type': 'Question',
            name: 'What are the clinic opening hours?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The clinic is open Monday through Saturday from 8:00 AM to 8:00 PM, and on Sundays from 8:00 AM to 2:00 PM for doctor consultations and diagnostic sample collection.'
            }
          },
          {
            '@type': 'Question',
            name: 'Which specialist doctors are available at the clinic?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our specialist panel includes Family Physicians, Interventional Pain Physicians, Gynecologists, Orthopedic Surgeons, Diabetologists, Pediatricians, and Homeopathy specialists.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I book home blood sample collection from this clinic?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Certified phlebotomists from Capsic Care provide doorstep blood sample collection across Bankra, Kona, Domjur, Makardah, Santragachi, and Howrah. Call or WhatsApp +91 8910260709 to schedule.'
            }
          }
        ]
      }
    ]
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-white border-b border-teal-800/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.2),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
            <Building2 size={14} /> Community Healthcare Center • Bankra, Howrah
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
            Our Healthcare Clinic <br />
            <span className="text-teal-400">Right in Bankra Bazar, Howrah</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Experience quality healthcare closer to home. Visit our modern physical community care center for in-person specialist doctor OPD consultations, assisted telemedicine, and low-cost certified diagnostic testing.
          </p>
        </div>
      </section>

      {/* Main Clinic Card */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Visual & Landmark Info */}
            <div className="lg:col-span-5 bg-gradient-to-br from-teal-800 to-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <span className="inline-block px-3 py-1 bg-teal-500/30 text-teal-200 text-xs font-bold uppercase tracking-wider rounded-full border border-teal-400/30">
                  Primary Healthcare Center #01
                </span>
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">Capsic Care Medical Centre</h2>
                  <p className="text-teal-200 text-sm font-medium">Bankra Bazar Community Clinic</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-teal-700/50">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-teal-300 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-white">Full Address</p>
                      <p className="text-teal-100 text-sm leading-relaxed">
                        Bankra Bazar, Dewan Para Road<br />
                        Domjur, Howrah – 711403<br />
                        West Bengal, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <Navigation className="text-teal-300 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-white">Landmark & Transport</p>
                      <p className="text-teal-100 text-sm leading-relaxed">
                        Near Bankra Market &amp; Dewan Para Crossing. Easy access from Kona Expressway, Domjur Auto Stand, and Bankra 4-Point.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-teal-700/50 space-y-3 relative z-10">
                <a
                  href="https://maps.google.com/?q=Bankra+Bazar+Dewan+Para+Road+Domjur+Howrah+711403"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-white hover:bg-slate-100 text-teal-900 font-extrabold text-sm rounded-xl transition-all shadow-md"
                >
                  <Navigation size={16} /> Open in Google Maps
                </a>
                <p className="text-xs text-center text-teal-200">
                  Helpline: <a href="tel:+918910260709" className="text-white underline font-bold">+91 8910260709</a>
                </p>
              </div>
            </div>

            {/* Right Column: Schedule, Services & Booking */}
            <div className="lg:col-span-7 p-8 md:p-12 space-y-8 flex flex-col justify-between">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Centre Services &amp; Timings</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Affordable in-person consultations with certified specialists and on-site certified diagnostic specimen collection.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Hours */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold">
                      <Clock size={20} />
                      <h4>Clinic Timings</h4>
                    </div>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                      <li className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-semibold">Mon – Sat:</span>
                        <span className="text-slate-900 dark:text-white font-bold">8:00 AM – 8:00 PM</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="font-semibold">Sunday:</span>
                        <span className="text-slate-900 dark:text-white font-bold">8:00 AM – 2:00 PM</span>
                      </li>
                    </ul>
                  </div>

                  {/* Highlights */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold">
                      <ShieldCheck size={20} />
                      <h4>Key Capabilities</h4>
                    </div>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                        <span>Specialist OPD Consultations</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                        <span>Assisted Telemedicine Screen</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                        <span>Certified Blood & Urine Collection</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                        <span>Doorstep Sample Collection Hub</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Services list */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Stethoscope size={18} className="text-teal-600" /> Clinical Services Available On-Site
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Family Medicine</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Pain Medicine</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Gynecology</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Orthopedics</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Diabetology</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Pediatrics</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Homeopathy</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Pathology Tests</span>
                    <span className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 font-medium">Health Packages</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20book%20a%20doctor%20consultation%20at%20Bankra%20Bazar%20Centre."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-teal-500/20 text-sm"
                >
                  Book Doctor Consultation <ArrowRight size={16} />
                </a>
                <Link
                  href="/lab-tests"
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3.5 px-6 rounded-xl flex justify-center items-center gap-2 transition-colors text-sm"
                >
                  <FlaskConical size={16} /> View Lab Tests
                </Link>
                <a
                  href="tel:+918910260709"
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-colors text-sm"
                >
                  <Phone size={16} />
                </a>
              </div>
            </div>

          </div>

          {/* Interactive Google Map Embed */}
          <div className="w-full h-80 sm:h-96 border-t border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-800">
            <iframe
              title="Capsic Care Bankra Bazar Clinic Location"
              src="https://maps.google.com/maps?q=Bankra+Bazar+Dewan+Para+Road+Domjur+Howrah+711403&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Doctors Consulting At This Clinic */}
        <div className="mt-16 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Panel of Specialists</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Doctors Consulting at Bankra Bazar Centre
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Book your OPD physical slot or assisted telemedicine consultation directly with our verified specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorsData.map((doc) => (
              <Link
                key={doc.id}
                href={`/doctors/${doc.id}`}
                className="group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-lg transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center shrink-0">
                  {doc.imagePlaceholder || doc.name.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-500 truncate">Fee: ₹{doc.consultationFee} • {doc.physicalDays || 'By Appointment'}</p>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
