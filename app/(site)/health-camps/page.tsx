import { Calendar, MapPin, Clock, Stethoscope, Users, Building2, CheckCircle2, ArrowRight, Award, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { doctorsData } from '@/data/doctors'

export const metadata = {
  title: 'Free Health Camps & Events | Capsic Care',
  description: 'Join Capsic Care free cardiac health camps, specialist doctor consultations, and community wellness drives in Howrah & Kolkata.',
}

const WHATSAPP_NUMBER = '918910260709'
function getWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export default function HealthCampsPage() {
  const campLeaflets = [
    { src: '/images/camps/cc leaflet opening.jpeg', alt: 'Grand Opening - Esteemed Doctors Leaflet', title: 'Grand Opening Doctors Leaflet' },
    { src: '/images/camps/cc flex camp english.jpeg', alt: 'Free Cardiac Camp Flex Banner', title: 'Free Cardiac Camp Flex Banner' },
    { src: '/images/camps/cc leflet camp bangali.jpeg', alt: 'Bengali Cardiac Camp Announcement', title: 'Bengali Announcement Leaflet' },
    { src: '/images/camps/manipal capsic ad.jpeg', alt: 'Manipal Hospitals Collaboration', title: 'Manipal Hospitals Partner Banner' }
  ]

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* Hero Section */}
      <section className="bg-teal-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <span className="inline-block px-4 py-1.5 bg-teal-500/30 text-teal-200 border border-teal-400/30 font-semibold rounded-full text-xs uppercase tracking-wider">
            Community Healthcare Drives
          </span>
          <h1 className="text-4xl md:text-6xl font-bold">Health Camps & Events</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Bringing specialized healthcare and renowned medical experts directly to your neighborhood through regular health camps.
          </p>
        </div>
      </section>

      {/* Featured Event - Grand Opening */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-12 space-y-8 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/30 dark:to-slate-900">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded-full text-sm">
                  <Calendar size={16} /> 9 August 2026 (Sunday) • 09:00 AM
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                  FREE CARDIAC HEALTH CAMP
                </h2>
                <h3 className="text-xl font-medium text-teal-700 dark:text-teal-400">
                  Grand Opening of CAPSIC CARE Community Healthcare Centre
                </h3>
              </div>

              {/* Chief Guests */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chief Guests</h4>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 text-teal-600 rounded-full flex items-center justify-center shrink-0 font-bold text-lg">
                    KS
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Chief Guest</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Dr. Kunal Sarkar</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Director and Chief Cardiac Surgeon, Manipal Hospital EM Bypass</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 text-teal-600 rounded-full flex items-center justify-center shrink-0 font-bold text-lg">
                    SG
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Chief Guest</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Dr. Subarna Goswami</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Renowned Physician & Public Health Expert</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">In Collaboration With</p>
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Manipal Hospitals
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 border-l border-slate-100 dark:border-slate-800 space-y-8 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                    <Clock className="text-teal-600" size={20} /> Schedule
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">09:00 AM onwards</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                    <MapPin className="text-teal-600" size={20} /> Venue
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Bankra Bazar, Dewan Para Road, Domjur, Howrah - 711403</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Free Camp Benefits:</h4>
                <ul className="space-y-3">
                  {[
                    'Free Cardiac Specialist Consultation',
                    'Free ECG Checkup (As required)',
                    'Free Blood Pressure & Vitals Check',
                    'Free Random Blood Sugar Test',
                    'Expert Advice for Chest Pain, Heart Attack & Valve Care'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm">
                      <CheckCircle2 className="text-teal-500 shrink-0" size={18} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 space-y-3">
                <a 
                  href={getWhatsAppLink('Hello CAPSIC Care, I want to register my name for the FREE CARDIAC CAMP on 9th Aug 2026.')}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full block text-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/20"
                >
                  Register For Free Camp via WhatsApp
                </a>
                <p className="text-xs text-center text-slate-500 font-medium">
                  Direct Helpline: <a href="tel:+918910260709" className="text-teal-600 font-bold hover:underline">+91 8910260709</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Camp Leaflets & Posters Gallery */}
      <section className="py-12 bg-slate-100 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Official Media</span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Official Camp Posters & Leaflets
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Verified campaign announcements for CAPSIC Care Grand Opening & Free Cardiac Camp
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {campLeaflets.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</p>
                  <a
                    href={item.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline mt-2 inline-block"
                  >
                    View Full Image →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Esteemed Doctors Panel */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Medical Faculty
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Our Esteemed Specialists & Panel Doctors
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Consult with top specialists from Manipal Hospitals, SSKM Hospital, Desun Hospital, and leading medical institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorsData.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 overflow-hidden relative border border-teal-500/20">
                      {doc.image ? (
                        <Image
                          src={doc.image}
                          alt={doc.name}
                          fill
                          className={`object-cover ${doc.imagePosition || 'object-center'}`}
                          sizes="48px"
                        />
                      ) : (
                        doc.imagePlaceholder
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{doc.name}</h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{doc.specialty}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-1 rounded-lg shrink-0">
                    {doc.consultationFee > 0 ? `₹${doc.consultationFee}` : 'Free'}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">{doc.designation}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{doc.qualifications}</p>
              </div>

              <Link
                href={`/doctors/${doc.id}`}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-300 font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1"
              >
                View Profile & Consultation <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Future Events */}
      <section className="py-16 bg-slate-100 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="text-teal-600" /> Upcoming Health Drives
              </h2>
              <div className="space-y-4">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-teal-500">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Diabetes & Metabolic Screening</h3>
                  <p className="text-xs text-teal-600 mb-2 font-bold">Coming in September 2026</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Free HbA1c screening, neuropathy checkup, and expert diabetology advice.</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-teal-500">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Pediatric & Child Health Camp</h3>
                  <p className="text-xs text-teal-600 mb-2 font-bold">Coming in October 2026</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Child nutrition assessments, growth monitoring, and pediatric consultations.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="text-teal-600" /> Host a Health Camp
              </h2>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Organize a Camp in Your Neighborhood</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Partner with CAPSIC Care to bring free health screening, specialist doctors, and diagnostic camps to your community, NGO, or office.
                </p>
                <a
                  href={getWhatsAppLink('Hello CAPSIC Care, I would like to organize a Health Camp in my locality/organization.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Contact Camp Organizer via WhatsApp <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
