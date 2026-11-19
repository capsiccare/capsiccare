import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Award, 
  GraduationCap, 
  Shield, 
  HeartPulse, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  AlertCircle, 
  FlaskConical, 
  ChevronRight, 
  Stethoscope, 
  HelpCircle, 
  Check, 
  Building2, 
  UserCheck, 
  ArrowRight,
  Video
} from 'lucide-react'

import { DoctorProfileBooking } from '@/components/doctor-profile-booking'
import { doctorsData, getDoctorById } from '@/data/doctors'
import { getDoctorSEOContent, priorityDoctorAreas } from '@/lib/doctor-seo-content'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  
  let doctorId = slug
  let areaName: string | undefined = undefined

  if (slug.includes('-in-')) {
    const parts = slug.split('-in-')
    doctorId = parts[0]
    const matchedArea = priorityDoctorAreas.find(a => a.slug === parts[1])
    areaName = matchedArea ? matchedArea.name : parts[1].replace(/-/g, ' ')
  }

  const doctor = getDoctorById(doctorId)
  if (!doctor) {
    return { title: 'Doctor Not Found | Capsic Care' }
  }

  const seo = getDoctorSEOContent(doctor, areaName)

  return {
    title: seo.seoTitle,
    description: seo.seoDescription,
    keywords: seo.seoKeywords,
    alternates: {
      canonical: `https://capsic.in/doctors/${slug}`
    },
    openGraph: {
      title: seo.seoTitle,
      description: seo.seoDescription,
      url: `https://capsic.in/doctors/${slug}`,
      siteName: 'Capsic Care Healthcare & Diagnostics',
      images: doctor.image ? [doctor.image] : ['/logo.png'],
      type: 'profile'
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.seoTitle,
      description: seo.seoDescription,
      images: doctor.image ? [doctor.image] : ['/logo.png']
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
}

export function generateStaticParams() {
  const paths: { slug: string }[] = []

  doctorsData.forEach(doc => {
    // Base route
    paths.push({ slug: doc.id })

    // Hyperlocal area permutations
    priorityDoctorAreas.forEach(area => {
      paths.push({ slug: `${doc.id}-in-${area.slug}` })
    })
  })

  return paths
}

export default async function DoctorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let doctorId = slug
  let areaName: string | undefined = undefined

  if (slug.includes('-in-')) {
    const parts = slug.split('-in-')
    doctorId = parts[0]
    const matchedArea = priorityDoctorAreas.find(a => a.slug === parts[1])
    areaName = matchedArea ? matchedArea.name : parts[1].replace(/-/g, ' ')
  }

  const doctor = getDoctorById(doctorId)
  if (!doctor) {
    notFound()
  }

  const seo = getDoctorSEOContent(doctor, areaName)
  const currentArea = areaName || 'Bankra'

  const whatsappBookingMsg = `Hello Capsic Care, I would like to book an appointment with *${doctor.name}* (${doctor.specialty}) for consultation in ${currentArea}.`

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* Inject JSON-LD Schema for Local Physician & FAQs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }}
      />

      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-white pt-28 pb-20 border-b border-teal-800/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.2),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-teal-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-slate-500">/</span>
            <Link href="/doctors" className="hover:text-white transition-colors">Doctors</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200 font-bold truncate">{doctor.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Doctor Photo & Badges */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-3xl bg-slate-800 border-4 border-teal-500/40 flex items-center justify-center shrink-0 overflow-hidden shadow-2xl relative group">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className={`object-cover ${doctor.imagePosition || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                    sizes="(max-width: 768px) 192px, 256px"
                    priority
                  />
                ) : (
                  <span className="text-7xl font-black text-slate-500">{doctor.imagePlaceholder}</span>
                )}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md rounded-xl py-1.5 px-3 border border-teal-500/30 text-center">
                  <span className="text-[11px] font-bold text-teal-300 flex items-center justify-center gap-1">
                    <CheckCircle2 size={13} className="text-teal-400" /> Verified Specialist
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Doctor Info & Key Highlights */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3.5 py-1 bg-teal-500/20 text-teal-300 font-bold tracking-wider uppercase text-xs rounded-full border border-teal-500/30 flex items-center gap-1.5">
                  <Stethoscope size={14} /> {doctor.specialty}
                </span>
                <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-500/30">
                  {doctor.consultationFee > 0 ? `Consultation Fee: ₹${doctor.consultationFee}` : 'Free Consultation (₹0)'}
                </span>
                <span className="px-3.5 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full border border-amber-500/30 flex items-center gap-1">
                  <MapPin size={13} /> {currentArea} & Nearby
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
                {doctor.name}
              </h1>
              
              <p className="text-base sm:text-lg text-teal-100 font-medium leading-relaxed">
                {doctor.designation}
              </p>

              {/* Credentials Strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs sm:text-sm font-semibold text-slate-300">
                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <GraduationCap size={18} className="text-teal-400 shrink-0" />
                  <span>{doctor.qualifications}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <Award size={18} className="text-teal-400 shrink-0" />
                  <span>{doctor.experience} Clinical Experience</span>
                </div>
                {doctor.availability && (
                  <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <Clock size={18} className="text-teal-400 shrink-0" />
                    <span>{doctor.availability}</span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
                <a
                  href={`https://wa.me/918910260709?text=${encodeURIComponent(whatsappBookingMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Phone size={16} /> Quick WhatsApp Booking
                </a>
                <a
                  href="#booking-section"
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20"
                >
                  <Calendar size={16} /> View Available Slots
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Rich Clinical & SEO Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. Clinical Overview & Background */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    About {doctor.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Clinical Background & Credentials</p>
                </div>
              </div>

              <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-3">
                <p>{seo.overview}</p>
                {doctor.about && <p>{doctor.about}</p>}
              </div>
            </div>

            {/* 2. Why Consult Dr. [Name] (Clinical Edge) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Why Consult {doctor.name}?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Clinical Edge & Patient-First Care</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seo.whyConsult.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Problems & Medical Conditions Treated */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Conditions & Problems Treated
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Specialized medical treatments provided</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seo.problemsTreated.map((prob, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {prob.condition}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
                      {prob.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. When to Consult (Symptoms Checklist) */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/50 space-y-4">
              <h3 className="text-lg font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
                When Should You Book a Consultation?
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                If you or your family members are experiencing any of the following symptoms, schedule a consultation with {doctor.name}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {seo.symptomsList.map((symptom, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Recommended Diagnostic Lab Tests */}
            {seo.recommendedTests.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Recommended Lab Tests for {doctor.specialty}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Available with free home sample collection in Bankra & nearby</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {seo.recommendedTests.map((test, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-3 transition-all hover:border-teal-500/50 hover:shadow-sm">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            test.type === 'package' || test.category === 'Health Package'
                              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                              : 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300'
                          }`}>
                            {test.type === 'package' || test.category === 'Health Package' ? 'Special Package' : test.category}
                          </span>
                          {test.mrp && test.mrp > test.price && (
                            <span className="text-[10px] font-black text-green-600 dark:text-green-400">
                              {Math.round(((test.mrp - test.price) / test.mrp) * 100)}% OFF
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {test.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-teal-600 dark:text-teal-400">₹{test.price}</span>
                          {test.mrp && test.mrp > test.price && (
                            <span className="text-xs text-slate-400 line-through">₹{test.mrp}</span>
                          )}
                        </div>
                        <Link 
                          href={test.type === 'package' || test.category === 'Health Package' ? `/packages/${test.slug}` : `/tests/${test.slug}`}
                          className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          Book Now <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Physical Center & Telemedicine Availability */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/50 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Consultation Modes & Location Details
                  </h3>
                  <p className="text-xs text-teal-200">Visit in-person or connect via Assisted Telemedicine</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-sm text-teal-300 flex items-center gap-1.5">
                    <Building2 size={16} /> Physical Clinic
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    <strong>Capsic Care Center:</strong> Bankra Bazar, Dewan Para Road, Domjur, Howrah – 711403 (Near Bankra Market).
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-sm text-teal-300 flex items-center gap-1.5">
                    <Video size={16} /> Assisted Telemedicine
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Live video consultation with medical assistant support available for patients across Bankra, Kona, Domjur, Makardah, Santragachi, and Howrah.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Frequently Asked Questions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Frequently Asked Questions ({doctor.name})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to know before booking</p>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {seo.faqs.map((faq, idx) => (
                  <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-start gap-2">
                      <span className="text-teal-600 dark:text-teal-400 font-black">Q:</span>
                      <span>{faq.question}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 pl-5 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Booking Widget & Local Area Navigator */}
          <div className="lg:col-span-4 space-y-6" id="booking-section">
            
            {/* Interactive Appointment Booking Widget */}
            <DoctorProfileBooking doctor={doctor} />

            {/* Service Areas Navigation Chips */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="text-teal-500" size={18} />
                Consultation Service Areas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consult {doctor.name} physically at Bankra Bazar or via assisted telemedicine in:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {priorityDoctorAreas.map(area => (
                  <Link 
                    key={area.slug}
                    href={`/doctors/${doctor.id}-in-${area.slug}`}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                      areaName?.toLowerCase() === area.name.toLowerCase()
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    {doctor.specialty} in {area.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Direct Support Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-700 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 dark:text-teal-300">Need Assistance?</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Instant Appointment Desk</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Call or message our medical coordinators for urgent slot booking or telemedicine assistance.
              </p>
              <a 
                href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20need%20assistance%20booking%20a%20doctor%20appointment."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold bg-teal-600 text-white px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Phone size={14} /> WhatsApp +91 8910260709
              </a>
            </div>

          </div>

        </div>
      </section>
    </div>
  )
}
