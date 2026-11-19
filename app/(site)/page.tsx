import type { Metadata } from 'next'
import { Stethoscope, HeartPulse, Building2, Smartphone, Users, MapPin, ArrowRight, CheckCircle2, Shield, Calendar, Clock, HandHeart, Coins, BookOpen, FlaskConical, Stethoscope as StethoscopeIcon, Droplet, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { doctorsData } from '@/data/doctors'

export const metadata: Metadata = {
  title: 'Capsic Care | Affordable Diagnostic Tests, Blood Tests & Doctors in Bankra, Howrah',
  description: 'Capsic Care is your neighbourhood healthcare centre in Bankra Bazar, Domjur, Howrah. Affordable blood tests with free home sample collection, trusted specialist doctors, and assisted telemedicine across Kona, Makardah, Santragachi & Howrah. NABL certified quality & 24h reports on WhatsApp.',
  keywords: [
    'Capsic Care',
    'Affordable Diagnostic Tests in Bankra',
    'Low-Cost Blood Tests in Bankra',
    'Blood Test Near Bankra Bazar',
    'Doctor Consultation in Bankra',
    'Specialist Doctors in Bankra Howrah',
    'Diagnostic Centre in Domjur',
    'Home Sample Collection Bankra',
    'Blood Test Kona',
    'Pathology Lab Makardah',
    'Diagnostic Centre Santragachi',
    'Assisted Telemedicine Howrah',
    'Full Body Checkup Bankra',
    'CBC Test Price Bankra',
    'Thyroid Test Price Howrah',
    'Diabetes Sugar Test Bankra Bazar'
  ],
  alternates: {
    canonical: 'https://capsic.in'
  },
  openGraph: {
    title: 'Capsic Care | Affordable Diagnostic Tests, Blood Tests & Doctors in Bankra, Howrah',
    description: 'Affordable blood tests with free home sample collection, trusted specialist doctors, and assisted telemedicine in Bankra Bazar, Domjur, Howrah.',
    url: 'https://capsic.in',
    siteName: 'Capsic Care Diagnostics',
    images: ['/logo.png'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capsic Care | Affordable Diagnostics & Doctors in Bankra',
    description: 'Affordable blood tests with free home sample collection & specialist doctor consultations in Bankra, Howrah.',
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

export default function HomePage() {
  const featuredDoctorIds = ['dr-tooneer-mallik', 'dr-wasim-karim', 'dr-priti-medda', 'dr-parvez-ahmed-khan']
  const featuredDoctors = featuredDoctorIds
    .map((id) => doctorsData.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': 'https://capsic.in/#clinic',
        name: 'Capsic Care Healthcare & Diagnostic Centre',
        alternateName: 'Capsic Care Diagnostics',
        url: 'https://capsic.in',
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
          'Howrah',
          'Kolkata'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://capsic.in/#website',
        url: 'https://capsic.in',
        name: 'Capsic Care',
        publisher: {
          '@id': 'https://capsic.in/#clinic'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://capsic.in/api/search?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What services does Capsic Care provide in Bankra, Howrah?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Capsic Care provides low-cost pathology blood tests, diagnostic health checkup packages, specialist doctor OPD consultations, and assisted telemedicine across Bankra, Kona, Domjur, Makardah, and Santragachi.'
            }
          },
          {
            '@type': 'Question',
            name: 'How do I book free home sample collection for blood tests?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can book free home sample collection online or via WhatsApp (+91 8910260709). Certified phlebotomists collect samples in sterile vacutainers with zero upfront advance payment.'
            }
          },
          {
            '@type': 'Question',
            name: 'Where is the Capsic Care Medical Centre located?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The medical centre is located at Bankra Bazar, Dewan Para Road, Domjur, Howrah – 711403, near Bankra Market.'
            }
          },
          {
            '@type': 'Question',
            name: 'When are diagnostic test reports delivered?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'NABL-certified smart digital reports are delivered directly to your WhatsApp and email within 24 hours of sample collection.'
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 pt-16 pb-20 sm:pt-24 sm:pb-28 md:pt-32 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-white to-slate-50 dark:from-teal-950/20 dark:via-[#0a0e14] dark:to-slate-950 z-0" />
        <div className="absolute top-0 right-0 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-400 font-bold tracking-wider rounded-full text-xs sm:text-sm border border-teal-200 dark:border-teal-800 shadow-sm">
                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-teal-500"></span>
                </span>
                AFFORDABLE DIAGNOSTICS &amp; HOME COLLECTION
              </span>
              <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] sm:text-xs rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <MapPin size={13} className="text-teal-600 dark:text-teal-400 shrink-0" /> Bankra • Kona • Domjur • Makardah • Santragachi
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.15] mb-4 sm:mb-6 tracking-tight">
              Accessible Healthcare, Doctors &amp; Affordable Diagnostics <br className="hidden sm:inline" />
              <span className="text-teal-600 dark:text-teal-400">Right In Your Neighbourhood.</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8 sm:mb-10 max-w-2xl leading-relaxed font-normal">
              Connect with trusted doctors, access assisted telemedicine, and get most affordable diagnostic tests — all through your neighbourhood Capsic Care centre.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
              <Link href="/lab-tests" className="px-7 py-3.5 sm:px-8 sm:py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 text-center flex items-center justify-center gap-2 text-sm sm:text-base">
                Browse 700+ Tests <ArrowRight size={18} />
              </Link>
              <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20lab%20tests%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 sm:px-8 sm:py-4 bg-white dark:bg-slate-900 text-teal-700 dark:text-white border-2 border-teal-600 dark:border-slate-700 rounded-xl font-bold hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors text-center shadow-sm text-sm sm:text-base">
                Book Home Collection
              </a>
            </div>
            <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800/60 max-w-2xl text-xs text-slate-700 dark:text-slate-300">
              🚚 <strong>Free Home Sample Collection</strong> is available if total test amount is above <strong>₹2,000</strong> (in Howrah &amp; Kolkata). For updated prices or information, contact <a href="tel:+918910260709" className="font-bold underline text-teal-700 dark:text-teal-300">8910260709</a> or <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20updated%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-600 dark:text-emerald-400">WhatsApp</a>.
            </div>
          </div>
        </div>
      </section>

      {/* The Featured Doctors Section */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-[#0a0e14] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10 sm:mb-12">
            <span className="inline-block px-4 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-400 font-bold rounded-full text-xs sm:text-sm uppercase tracking-wider mb-3.5 border border-teal-200 dark:border-teal-800">
              Expert Care Panel
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">Consult Top Specialists</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">Our esteemed panel of specialists is available for OPD physical &amp; assisted telemedicine consultations.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12">
            {featuredDoctors.map((doctor) => (
              <Link href={`/doctors/${doctor.id}`} key={doctor.id} className="group flex flex-col items-center text-center bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-xl transition-all">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 sm:mb-5 overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-md group-hover:border-teal-500 transition-all duration-300 relative shrink-0">
                  {doctor.image ? (
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 112px, 144px"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-black text-slate-400 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500">
                      {doctor.imagePlaceholder}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <span className="bg-teal-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">Consult</span>
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg md:text-xl mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">{doctor.name}</h3>
                <p className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 line-clamp-2">{doctor.specialty}</p>
              </Link>
            ))}
          </div>

          <Link href="/doctors" className="inline-flex items-center gap-2 font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors border-b-2 border-transparent hover:border-teal-600 pb-1 text-sm sm:text-base">
            View All Doctors <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* The Assisted Telemedicine Vision */}
      <section className="py-16 sm:py-20 bg-teal-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight">
                What is <span className="text-teal-300">Assisted Telemedicine?</span>
              </h2>
              <p className="text-base sm:text-lg text-teal-50 leading-relaxed opacity-90">
                Technology is only useful if you know how to use it. Many families struggle with apps and video calls.
                Our "Assisted Telemedicine" model means you simply walk into our physical community centre, and our trained healthcare assistants connect you to India's top specialists in real-time, taking your vitals and helping the doctor examine you remotely.
              </p>
              <ul className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                {[
                  'No app downloads required',
                  'Vitals checked physically by trained staff',
                  'High-definition secure video consultation',
                  'Instant digital prescriptions printed on-site'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-teal-400 shrink-0" size={20} />
                    <span className="font-medium text-sm sm:text-base md:text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-teal-800 p-6 sm:p-8 rounded-3xl border border-teal-700 shadow-2xl relative">
              <div className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <Smartphone className="text-teal-600 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="aspect-video bg-teal-950 rounded-2xl flex items-center justify-center text-teal-700 mb-4 sm:mb-6 overflow-hidden border-2 border-teal-800/50 shadow-inner">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/VQbjo46BGuU?si=2Tj4Z9X0XwL6_g1d&amp;controls=1"
                  title="Capsic Care Assisted Telemedicine"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Bridging The Gap</h3>
              <p className="text-xs sm:text-sm text-teal-200">Connecting rural and semi-urban communities to tertiary care specialists flawlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages & Lab Tests Preview */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold rounded-full text-xs sm:text-sm uppercase tracking-wider mb-3.5 border border-rose-200 dark:border-rose-800/50">
                Diagnostics
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">Popular Health Packages</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg">Comprehensive full-body checkups and individual lab tests with clinical precision and radical price transparency.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/lab-tests" className="px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm">
                Search 700+ Tests
              </Link>
              <Link href="/health-packages" className="px-5 py-2.5 sm:px-6 sm:py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20 text-xs sm:text-sm flex items-center gap-2">
                All Packages <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Home Sample Collection Banner */}
          <div className="mb-8 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-teal-950 dark:text-teal-100">
              <span className="px-2.5 py-1 bg-teal-600 text-white rounded-full font-black text-[11px] uppercase tracking-wide shrink-0">
                Notice
              </span>
              <span>
                🚚 <strong>Free Home Sample Collection</strong> is available if total test amount or price is above <strong>₹2,000</strong> (in Howrah &amp; Kolkata).
              </span>
            </div>
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200 font-medium shrink-0">
              <span className="hidden sm:inline">For updated prices or info:</span>
              <a href="tel:+918910260709" className="font-bold underline text-slate-900 dark:text-white hover:text-teal-600">
                📞 8910260709
              </a>
              <span>or</span>
              <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20updated%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { slug: 'thyroid-wellness-check-package', title: 'Thyroid & Wellness', desc: 'T3, T4, TSH, CBC & Hemoglobin check.', price: '₹549', mrp: '₹1418', icon: HeartPulse, tag: 'SPECIAL OFFER' },
              { slug: 'basic-full-body-checkup', title: 'Basic Full Body', desc: '7 vital tests: Heart, Liver, Kidney, Thyroid, Sugar, CBC.', price: '₹769', mrp: '₹1884', icon: FlaskConical, tag: 'POPULAR' },
              { slug: 'diabetes-sugar-care-package', title: 'Diabetes & Sugar Care', desc: 'Fasting Sugar, PPBS, 3-Month HbA1c & Lipid.', price: '₹769', mrp: '₹1815', icon: Droplet, tag: 'BEST VALUE' },
              { slug: 'heart-metabolic-check-package', title: 'Heart & Metabolic', desc: 'Lipids, HbA1c, Fasting Sugar & Creatinine.', price: '₹879', mrp: '₹2067', icon: StethoscopeIcon, tag: 'CARDIAC' },
              { slug: 'vitamin-energy-check-package', title: 'Vitamin & Energy', desc: 'Vitamin B12, D3, Calcium & Complete Blood Count.', price: '₹1200', mrp: '₹3119', icon: Sparkles, tag: 'ENERGY' },
            ].map((pkg, i) => (
              <Link key={i} href={`/packages/${pkg.slug}`} className="bg-slate-50 dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100 dark:bg-teal-900/10 rounded-bl-[80px] -z-0 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                      <pkg.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/70 px-2 py-0.5 rounded-full">
                      {pkg.tag === 'BEST VALUE' ? 'BEST VALUE' : pkg.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 transition-colors">{pkg.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 line-clamp-2">{pkg.desc}</p>
                </div>
                <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{pkg.price}</span>
                    <span className="text-xs text-slate-400 line-through ml-1.5">{pkg.mrp}</span>
                  </div>
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">Book <ArrowRight size={12} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid (High Contrast Light Mode) */}
      <section className="py-24 bg-slate-100 dark:bg-[#0a0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Comprehensive Healthcare</h2>
            <p className="text-lg text-slate-700 dark:text-slate-400">Everything you need, right in your neighborhood.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, title: 'Doctor Consult', desc: 'Expert physical & digital consultations.' },
              { icon: HeartPulse, title: 'Diagnostics', desc: 'NABL accredited pathology tests.' },
              { icon: Building2, title: 'Health Camps', desc: 'Free & subsidized community screening.' },
              { icon: Users, title: 'Specialists', desc: 'Access to top-tier specialist doctors.' }
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-md border border-slate-300 dark:border-slate-800 hover:shadow-xl hover:border-teal-500/50 transition-all group">
                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <s.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-slate-700 dark:text-slate-400 font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Clinic & Google Maps (Merged from Our Clinics) */}
      <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 h-[400px] lg:h-[500px] w-full bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-700">
              <iframe
                src="https://maps.google.com/maps?q=Capsic+Care,+Bazar,+Dewan+Para+Rd,+Bankra,+Howrah,+West+Bengal+711403&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="order-1 lg:order-2 space-y-8 lg:pl-8">
              <span className="inline-block px-4 py-2 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-400 font-bold rounded-full text-sm border border-teal-200 dark:border-teal-800">
                Our First Community Centre
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Capsic Care Centre
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-12 h-12 bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Visit Us</h3>
                    <p className="text-slate-700 dark:text-slate-400 mt-1 font-medium">Bankra Bazar, Dewan Para Road<br />Domjur, Howrah – 711403</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 w-12 h-12 bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Opening Hours</h3>
                    <p className="text-slate-700 dark:text-slate-400 mt-1 font-medium">Mon - Sat: 8:00 AM - 8:00 PM<br />Sunday: 8:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20book%20an%20appointment%20or%20service." className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors shadow-lg">
                  Book A Visit <ArrowRight size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us / Founder Story (Merged from About Page) */}
      <section className="py-24 bg-slate-50 dark:bg-[#0a0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-16 border border-slate-300 dark:border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/10 rounded-bl-full -z-0" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                  Born From A <span className="text-teal-600 dark:text-teal-400">Personal Mission</span>
                </h2>
                <div className="space-y-4 text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <p>
                    The seed for Capsic Care was planted when we witnessed a heartbreaking reality: families traveling hours to the city, navigating complex hospital systems, and spending a fortune just to get a basic diagnosis.
                  </p>
                  <p>
                    It wasn't a lack of medical advancement that failed them—it was a lack of accessibility. We realized that if families couldn't reach quality healthcare, we had to bring quality healthcare to them.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: MapPin, title: 'Distance', desc: "Care in your neighborhood." },
                  { icon: Smartphone, title: 'Technology', desc: "Assisted, human-first telemedicine." },
                  { icon: BookOpen, title: 'Awareness', desc: "Continuous health education." },
                  { icon: Coins, title: 'Income', desc: "Radical price transparency." }
                ].map((pillar, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <pillar.icon size={28} className="text-teal-600 dark:text-teal-400 mb-4" />
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{pillar.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Network Preview */}
      <section className="py-20 bg-teal-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-teal-950/50 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-teal-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 bg-teal-800/50 text-teal-300 font-bold rounded-full text-sm uppercase tracking-wider mb-6 border border-teal-700">
                  Join The Movement
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Become a Healthcare Partner</h2>
                <p className="text-lg text-teal-100 mb-8 leading-relaxed">
                  Whether you are a doctor looking to expand your reach, or an entrepreneur wanting to open a Capsic Care franchise, we provide the technology and brand support you need.
                </p>
                <Link href="/partner" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-900 font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-lg">
                  Explore Partnership <ArrowRight size={20} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'For Doctors', href: '/join-as-doctor' },
                  { label: 'For Hospitals', href: '/join-as-hospital' },
                  { label: 'For Pharmacies', href: '/join-as-pharmacy' },
                  { label: 'For Labs', href: '/join-as-lab' }
                ].map((item, i) => (
                  <Link key={i} href={item.href} className="flex flex-col items-center justify-center p-6 bg-teal-800/40 rounded-2xl border border-teal-700/50 hover:bg-teal-700/50 hover:border-teal-500 transition-all text-center group">
                    <span className="font-bold text-teal-50 group-hover:text-white">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact (Merged from Community Page) */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">The Capsic Care Movement</h2>
            <p className="text-xl text-slate-300">
              We aim to empower local communities by creating physical touchpoints where people can walk in, feel cared for, and connect with the best.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { val: '5000+', label: 'Families Impacted' },
              { val: '24', label: 'Health Camps' },
              { val: '100+', label: 'Local Volunteers' },
              { val: '15', label: 'Partner Doctors' }
            ].map((stat, i) => (
              <div key={i} className="p-6">
                <p className="text-4xl md:text-5xl font-black text-teal-400 mb-2">{stat.val}</p>
                <p className="text-lg font-medium text-slate-300 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
