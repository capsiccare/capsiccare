import { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2,
  Stethoscope,
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Laptop,
  HeartPulse,
  Activity,
  Layers,
  Database,
  BarChart3,
  DollarSign,
  Briefcase,
  Bot,
  Truck,
  GraduationCap,
  Shield,
  FileCheck,
  Share2
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Healthcare Franchise & Business Opportunity in India | CAPSIC Network',
  description: 'Join CAPSIC\'s mission to build India\'s future healthcare network. Low investment healthcare franchise models: CAPSIC Connect, CAPSIC Care, and CAPSIC Plus diagnostic hubs.',
  keywords: [
    'Healthcare Franchise in India',
    'Medical Franchise Opportunity',
    'Telemedicine Franchise',
    'Diagnostic Centre Franchise',
    'Healthcare Business Opportunity',
    'Medical Centre Franchise',
    'Primary Healthcare Franchise',
    'Healthcare Startup India',
    'Assisted Telemedicine Centre',
    'Diagnostic Partner Network'
  ],
  openGraph: {
    title: 'Build India\'s Future Healthcare Network with CAPSIC',
    description: 'Explore technology-enabled healthcare franchise models across India with CAPSIC Care.',
    url: 'https://www.capsic.in/business-opportunity',
    siteName: 'CAPSIC Care',
    locale: 'en_IN',
    type: 'website',
  },
}

const WHATSAPP_NUMBER = '918910260709'

function getWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export default function BusinessOpportunityPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'CAPSIC Care Franchise Network',
    url: 'https://www.capsic.in/business-opportunity',
    logo: 'https://www.capsic.in/logo.png',
    description: 'Technology-enabled healthcare network franchise opportunity in India.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bankra Bazar, Dewan Para Road, Domjur',
      addressLocality: 'Howrah',
      addressRegion: 'West Bengal',
      postalCode: '711403',
      addressCountry: 'IN'
    },
    telephone: '+91 8910260709',
    areaServed: 'India'
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs md:text-sm font-semibold tracking-wide uppercase">
              <Sparkles size={16} /> Business Opportunity
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Build India's Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400">
                Healthcare Network
              </span>{' '}
              with CAPSIC
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-normal">
              Join CAPSIC's mission to make quality healthcare accessible in every neighborhood through technology-enabled healthcare centres.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <a
                href={getWhatsAppLink('Hello CAPSIC Care, I want to become a Franchise Partner with CAPSIC Network.')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-teal-500/25 transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                Become a Partner <ArrowRight size={18} />
              </a>
              <a
                href={getWhatsAppLink('Hello CAPSIC Care, I would like to talk to your team regarding business opportunities.')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold rounded-2xl border border-slate-700 transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                <PhoneCall size={18} /> Talk to Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CAPSIC Network Ecosystem Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <span className="text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wider">
            Ecosystem Structure
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
            The CAPSIC 4-Level Healthcare Network
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
            A modular, scalable healthcare delivery model built to cover rural wards, tier-2/3 towns, and urban centers seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Level 1: CAPSIC Connect */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3.5 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-full uppercase tracking-wider">
                  Level 1 • Micro Node
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-full border border-emerald-200 dark:border-emerald-800">
                  No full-time doctor required
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">CAPSIC Connect</h3>
              <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm mb-4">Healthcare Starts Here</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                <strong>Goal:</strong> One centre in every village, ward, or neighborhood.
              </p>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Investment</span>
                  <span className="font-bold text-slate-900 dark:text-white text-base">₹2–5 Lakh</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Space Required</span>
                  <span className="font-bold text-slate-900 dark:text-white text-base">80–150 sq ft</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ideal Partners</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Pharmacies', 'CSCs', 'Rural Entrepreneurs', 'Existing Healthcare Shops'].map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Services Provided</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                    {[
                      'Assisted Telemedicine',
                      'ABHA Creation',
                      'Blood Sample Collection',
                      'Home Sample Booking',
                      'Medicine Ordering',
                      'Ambulance Booking',
                      'Digital Health Records',
                      'Health Camps',
                      'Vitals Monitoring'
                    ].map((s, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-teal-500 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <a
              href={getWhatsAppLink('Hello CAPSIC Care, I want to inquire about CAPSIC Connect franchise model (₹2-5 Lakh).')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-center transition-colors text-sm flex items-center justify-center gap-2"
            >
              Inquire for CAPSIC Connect <ArrowRight size={16} />
            </a>
          </div>

          {/* Level 2: CAPSIC Care */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-teal-500/50 dark:border-teal-500/30 shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3.5 py-1 bg-teal-600 text-white font-bold text-xs rounded-full uppercase tracking-wider">
                  Level 2 • Primary Hub
                </span>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 px-3 py-1 bg-teal-50 dark:bg-teal-950/60 rounded-full border border-teal-200 dark:border-teal-800">
                  Network Backbone
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">CAPSIC Care</h3>
              <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm mb-4">Primary Healthcare Centre</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                <strong>Goal:</strong> The backbone of the CAPSIC healthcare network delivering comprehensive primary outpatient care.
              </p>

              <div className="grid grid-cols-2 gap-4 p-4 bg-teal-50/50 dark:bg-slate-800/80 rounded-2xl mb-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Investment</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 text-base">₹8–15 Lakh</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Space Required</span>
                  <span className="font-bold text-slate-900 dark:text-white text-base">300–600 sq ft</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Includes Everything in Connect Plus:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {[
                    'Physical OPD',
                    'Visiting Specialists',
                    'ECG Diagnostics',
                    'Nebulization',
                    'Dressing Room',
                    'Injections (Permitted)',
                    'Health Packages',
                    'Physiotherapy (Optional)',
                    'Home Collection'
                  ].map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 size={14} className="text-teal-500 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href={getWhatsAppLink('Hello CAPSIC Care, I am interested in opening a CAPSIC Care Primary Healthcare Centre (₹8-15 Lakh).')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-center transition-colors text-sm flex items-center justify-center gap-2"
            >
              Apply for CAPSIC Care <ArrowRight size={16} />
            </a>
          </div>

          {/* Level 3: CAPSIC Plus */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-full uppercase tracking-wider">
                  Level 3 • Advanced Hub
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 rounded-full border border-amber-200 dark:border-amber-800">
                  Asset-Light Model
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">CAPSIC Plus</h3>
              <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4">Advanced Diagnostics & Specialty Hub</p>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Investment</span>
                  <span className="font-bold text-slate-900 dark:text-white text-base">₹25–60 Lakh</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Model Type</span>
                  <span className="font-bold text-slate-900 dark:text-white text-base">Specialty Hub</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Includes Everything in Care Plus:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 mb-4">
                  {[
                    'Multiple Specialist OPDs',
                    'Advanced ECG & TMT',
                    'Corporate Health Checkups',
                    'Telemedicine Control Room',
                    'Franchise Support',
                    'Dedicated Marketing Team'
                  ].map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-900 dark:text-amber-300">
                  <strong>Asset-Light Diagnostic Strategy:</strong> High-capital MRI and CT machines are not purchased initially. CAPSIC Plus operates on an asset-light model by partnering with established nearby diagnostic centres and hospitals.
                </div>
              </div>
            </div>

            <a
              href={getWhatsAppLink('Hello CAPSIC Care, I want to inquire about CAPSIC Plus Advanced Diagnostics & Specialty Hub.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center transition-colors text-sm flex items-center justify-center gap-2"
            >
              Inquire for CAPSIC Plus <ArrowRight size={16} />
            </a>
          </div>

          {/* Level 4: CAPSIC Regional Hub */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3.5 py-1 bg-purple-900/60 text-purple-300 font-bold text-xs rounded-full uppercase tracking-wider border border-purple-700/50">
                  Level 4 • Central Command
                </span>
                <span className="text-xs font-bold text-slate-300 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                  Company / Strategic Partner
                </span>
              </div>
              <h3 className="text-2xl font-bold">CAPSIC Regional Hub</h3>
              <p className="text-purple-400 font-semibold text-sm mb-4">Territory Command & Operational Backbone</p>
              
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 mb-6">
                <strong>Note:</strong> Regional Hubs are <em>not a public franchise model</em> during early growth stage. They are company-operated or developed with strategic regional partners.
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Hub Functions</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-6">
                {[
                  'Doctor Onboarding',
                  'Technology & Infrastructure',
                  'AI Diagnostics Systems',
                  'Quality & Clinical Audits',
                  'Training Academy',
                  'Territory Marketing',
                  '24/7 Customer Support',
                  'Finance & Settlements',
                  'Territory Management',
                  'Clinical Governance',
                  'Data Analytics'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={getWhatsAppLink('Hello CAPSIC Care, I represent a strategic organization interested in Regional Hub partnership.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-center transition-colors text-sm flex items-center justify-center gap-2"
            >
              Strategic Partner Inquiry <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Our Real Strength Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
            <span className="text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wider">
              Core Assets & Capabilities
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Technology, Partnerships & Trust — Our True Assets
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
              CAPSIC's long-term value comes from a robust digital healthcare engine and established institutional ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Trusted Brand', desc: 'Strong healthcare reputation backed by Manipal Hospitals collaboration.' },
              { icon: Stethoscope, title: 'Doctor Network', desc: 'Access to eminent cardiac surgeons, pediatricians, and specialists.' },
              { icon: Bot, title: 'AI Platform', desc: 'AI-assisted clinical triage, symptom analysis, and decision support tools.' },
              { icon: Laptop, title: 'Healthcare Software', desc: 'Proprietary EMR, telemedicine portal, and clinic management software.' },
              { icon: FileCheck, title: 'Standard SOPs', desc: 'Rigorous medical protocols, sample handling standards, and audit guidelines.' },
              { icon: Users, title: 'Franchise Network', desc: 'Rapidly expanding community healthcare partner network.' },
              { icon: GraduationCap, title: 'Training Academy', desc: 'Comprehensive staff training for lab techs, phlebotomists, and clinic staff.' },
              { icon: PhoneCall, title: 'Call Centre', desc: 'Dedicated patient helpline for appointments, reports, and emergency support.' },
              { icon: Truck, title: 'Logistics', desc: 'Temperature-controlled cold-chain sample pickup and delivery network.' },
              { icon: Building2, title: 'Diagnostic Partners', desc: 'Tie-ups with leading NABL-accredited diagnostic labs and hospitals.' },
              { icon: Briefcase, title: 'Insurance Partners', desc: 'Seamless cashless claims and preventive health package tie-ups.' },
              { icon: Database, title: 'Consent-Based Data', desc: 'ABHA-linked, highly secure, consent-driven electronic health record management.' }
            ].map((item, idx) => {
              const IconComp = item.icon
              return (
                <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 transition-all duration-300 space-y-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center">
                    <IconComp size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data-Driven Expansion Flow */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <span className="text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wider">
            Smart Growth Strategy
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Data-Driven Territory Expansion
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
            CAPSIC expands into new territories only after rigorous data analysis of local healthcare demand metrics.
          </p>
        </div>

        {/* Data points analyzed */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-12">
          {[
            'Population Density',
            'Consultation Demand',
            'Nearby Pharmacy Density',
            'Existing Healthcare Facilities',
            'Telemedicine Adoption Rate',
            'Lab Booking Volume',
            'Repeat Patient Percentage',
            'Average Revenue per Patient',
            'Specialist Referral Demand'
          ].map((metric, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <BarChart3 className="text-teal-500 shrink-0" size={18} />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{metric}</span>
            </div>
          ))}
        </div>

        {/* Progression Flow */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-800">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8">
            Performance-Based Centre Upgrade Progression
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'CAPSIC Connect', desc: 'Micro node setup in village or ward' },
              { step: '02', title: 'CAPSIC Care', desc: 'Upgrade to full primary care clinic' },
              { step: '03', title: 'CAPSIC Plus', desc: 'Advanced diagnostics & specialty hub' },
              { step: '04', title: 'Regional Hub', desc: 'Strategic territory governance node' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 relative">
                <span className="text-3xl font-black text-teal-400 opacity-60 block mb-2">{item.step}</span>
                <h4 className="font-bold text-lg mb-1 text-white">{item.title}</h4>
                <p className="text-xs text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs md:text-sm text-teal-200 font-medium mt-8">
            * Note: Centre upgrades are strictly <strong>performance-based</strong> (volume, repeat patients, revenue) rather than time-based.
          </p>
        </div>
      </section>

      {/* Revenue Opportunities */}
      <section className="py-16 md:py-24 bg-slate-100 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
            <span className="text-teal-600 dark:text-teal-400 font-bold text-sm uppercase tracking-wider">
              Monetization Channels
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Multiple Revenue Streams for Partners
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
              Partnering with CAPSIC unlocks diversified, sustainable income channels across clinical, diagnostic, and corporate services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Franchise Fee', desc: 'Upfront brand & territory licensing structure for new centers.' },
              { title: 'Royalty Income', desc: 'Sustainable recurring service royalty tied to centre performance.' },
              { title: 'Software Subscription', desc: 'SaaS licensing for EMR, clinical booking & telemedicine suite.' },
              { title: 'Consultation Commission', desc: 'Earnings on physical OPD and assisted telemedicine doctor consultations.' },
              { title: 'Diagnostic Commission', desc: 'High-margin revenue on blood tests, ECG, and pathology packages.' },
              { title: 'Pharmacy Commission', desc: 'Margin share on medicine orders placed through the CAPSIC app.' },
              { title: 'Home Sample Collection', desc: 'Service charges for doorstep phlebotomy and blood sample pickups.' },
              { title: 'Corporate Health Programs', desc: 'Revenue from executive health checkups and employee wellness drives.' },
              { title: 'Insurance Partnerships', desc: 'Earnings from pre-policy health checkups and insurance claims.' },
              { title: 'White-Label Licensing', desc: 'Licensing CAPSIC platform tech to regional hospital networks.' },
              { title: 'AI Services (Future)', desc: 'Monetization of advanced AI diagnostic triaging tools & analytics.' }
            ].map((rev, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-2">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-sm">
                  ${idx + 1}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{rev.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{rev.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs md:text-sm font-semibold uppercase tracking-wider">
            Start Your Journey
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Become a CAPSIC Franchise Partner
          </h2>
          <p className="text-base md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Whether you're a pharmacist, entrepreneur, healthcare professional, or community leader, you can help bring accessible healthcare to your community while building a sustainable business.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={getWhatsAppLink('Hello CAPSIC Care, I would like to APPLY NOW for a CAPSIC Franchise Centre.')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-9 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl shadow-xl shadow-teal-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Apply Now <ArrowRight size={18} />
            </a>
            <a
              href={getWhatsAppLink('Hello CAPSIC Care, I would like to REQUEST A CONSULTATION about the CAPSIC Business Opportunity.')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-9 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl border border-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <PhoneCall size={18} /> Request a Consultation
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
