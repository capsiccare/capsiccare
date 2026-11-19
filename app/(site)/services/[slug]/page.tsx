import { Stethoscope, Video, Users, Beaker, Home, HeartPulse, ShieldCheck, Activity, Users2, CheckCircle2, ArrowRight, Shield, Heart } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const serviceData: Record<string, any> = {
  'doctor-consultation': {
    title: 'Expert Doctor Consultations',
    subtitle: 'Quality Medical Advice in Your Neighborhood',
    icon: Stethoscope,
    description: 'We believe that primary healthcare is the foundation of a healthy community. Our physical clinics are staffed with highly experienced general physicians ready to diagnose and treat a wide range of everyday health issues.',
    features: [
      'Experienced General Physicians',
      'Walk-in and pre-booked appointments',
      'Instant digital prescriptions',
      'Integrated diagnostics on-site'
    ],
    highlight: 'No more traveling hours just to see a trusted doctor. Walk into your nearest Capsic Care Centre today.'
  },
  'assisted-telemedicine': {
    title: 'Assisted Telemedicine',
    subtitle: 'Connecting You to Specialists Flawlessly',
    icon: Video,
    description: 'Technology shouldn\'t be a barrier to health. In our Assisted Telemedicine model, you visit our clinic, and our trained healthcare assistants check your vitals and set up a high-definition video call with a top specialist.',
    features: [
      'No app downloads or technical knowledge required',
      'Physical vital checks (BP, Sugar, ECG) before the call',
      'High-definition secure video link',
      'Real-time physical assistance during the consultation'
    ],
    highlight: 'We bridge the digital divide. Get specialist care from India\'s top hospitals without leaving your town.'
  },
  'specialist-consultation': {
    title: 'Specialist Consultations',
    subtitle: 'Expert Care for Complex Conditions',
    icon: Users,
    description: 'Capsic Care brings renowned specialists from fields like Cardiology, Orthopedics, Pediatrics, and Gynecology right to your community through our hybrid model of periodic physical visits and daily telemedicine.',
    features: [
      'Access to leading city-based specialists',
      'Cardiology, Orthopedics, Gynecology, Pediatrics',
      'End-to-end case management and follow-ups',
      'Affordable consultation fees'
    ],
    highlight: 'Receive tertiary-level medical opinions without the tertiary-level travel costs.'
  },
  'diagnostics': {
    title: 'Advanced Diagnostics',
    subtitle: 'Clinical Precision, Radical Transparency',
    icon: Beaker,
    description: 'Accurate diagnosis is the first step to a cure. We partner with NABL & CAP accredited laboratories to ensure that your test reports are 100% accurate, fast, and remarkably affordable.',
    features: [
      'NABL & CAP Accredited Lab Partners',
      'Same-day reports for routine tests',
      'Digital report access via WhatsApp',
      'Transparent pricing with no hidden costs'
    ],
    highlight: 'Never compromise on the quality of your test reports. Quality diagnostics, made accessible.'
  },
  'home-sample-collection': {
    title: 'Home Sample Collection',
    subtitle: 'Serving Entire Howrah & Kolkata',
    icon: Home,
    description: 'Why step out when the lab can come to you? Our team of highly trained and certified phlebotomists provides safe, hygienic, and painless blood sample collection right from the comfort of your home. Free Home Sample Collection is available if total test amount is above ₹2,000 (in Howrah & Kolkata). For updated prices or information, contact 8910260709 or WhatsApp.',
    features: [
      'Free Home Collection: On total test amount above ₹2,000 in Howrah & Kolkata',
      'Extensive Coverage: Entire Howrah & Kolkata',
      'Updated Prices & Info: Call/WhatsApp 8910260709',
      'Highly trained, certified phlebotomists',
      'Hygienic and painless collection process',
      'Choose your preferred time slot'
    ],
    highlight: 'Free Home Sample Collection available if total test amount is above ₹2,000 in Howrah & Kolkata! For updated prices or information, contact 8910260709 or WhatsApp.'
  },
  'health-packages': {
    title: 'Comprehensive Health Packages',
    subtitle: 'Curated Full-Body Checkups',
    icon: Heart,
    description: 'Routine checkups can save lives. We have curated a variety of full-body health packages tailored for different age groups, lifestyles, and medical histories to keep you and your family protected.',
    features: [
      'Basic to Advanced Full Body Checkups',
      'Senior Citizen Wellness Packages',
      'Women\'s Health & Maternity Packages',
      'Post-COVID & Immunity Checkups'
    ],
    highlight: 'Prevention is better than cure. Invest in a full-body checkup today for a healthier tomorrow.'
  },
  'preventive-health-checkups': {
    title: 'Preventive Health Checkups',
    subtitle: 'Stop Diseases Before They Start',
    icon: ShieldCheck,
    description: 'Our preventive screening programs are designed to identify potential health risks before they become severe, empowering you to take control of your health proactively.',
    features: [
      'Early detection of diabetes and hypertension',
      'Cardiac risk profiling',
      'Cancer screening markers',
      'Personalized health risk assessments'
    ],
    highlight: 'Empowering communities through proactive health monitoring and early intervention.'
  },
  'lifestyle-disease-screening': {
    title: 'Lifestyle Disease Screening',
    subtitle: 'Managing Modern Health Challenges',
    icon: Activity,
    description: 'Conditions like diabetes, thyroid disorders, and high cholesterol require continuous monitoring. We offer specialized screening panels that are affordable and easy to track over time.',
    features: [
      'Comprehensive Diabetic Profiles',
      'Advanced Lipid & Cholesterol Panels',
      'Complete Thyroid Profiles',
      'Dietary and lifestyle consultation referrals'
    ],
    highlight: 'Stay on top of your chronic conditions with our precise and affordable monitoring panels.'
  },
  'community-healthcare': {
    title: 'Community Healthcare Initiatives',
    subtitle: 'Building a Healthier Neighborhood',
    icon: Users2,
    description: 'Capsic Care is more than a clinic; it\'s a movement. We regularly organize local health education camps, hygiene drives, and awareness programs to uplift the overall health standard of our communities.',
    features: [
      'Free periodic health camps',
      'Local youth volunteer programs',
      'Hygiene and nutrition workshops',
      'Partnerships with local NGOs'
    ],
    highlight: 'Healthcare goes beyond the clinic walls. Join us in making our communities healthier.'
  }
}

export function generateStaticParams() {
  return Object.keys(serviceData).map((slug) => ({
    slug,
  }))
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceData[slug]

  if (!service) {
    notFound()
  }

  const Icon = service.icon

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-24 pb-32 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 bg-teal-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-teal-500/30">
              <Icon size={48} className="text-teal-400" />
            </div>
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 bg-teal-900 text-teal-300 font-bold uppercase tracking-wider text-sm rounded-full border border-teal-700">
                Capsic Care Service
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">{service.title}</h1>
              <p className="text-xl text-teal-100 font-medium max-w-2xl">{service.subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Description & Features) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Overview</h2>
              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-8">
                {service.description}
              </p>

              <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-100 dark:border-teal-900/50 mb-8">
                <p className="text-teal-800 dark:text-teal-200 font-semibold italic text-lg text-center">
                  "{service.highlight}"
                </p>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="text-teal-600" /> Key Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <CheckCircle2 size={20} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (CTA) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Need this service?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">
                Our support team is ready to assist you. Book an appointment or request more information via WhatsApp.
              </p>
              
              <a 
                href="https://wa.me/918910260709" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
              >
                Contact via WhatsApp <ArrowRight size={18} />
              </a>

              {slug === 'home-sample-collection' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 text-center space-y-2">
                  <p className="text-sm font-bold text-teal-950 dark:text-teal-100">
                    🚚 Free Home Sample Collection on total test amount above ₹2,000 (in Howrah &amp; Kolkata)
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    For updated price, collection charges, or information, contact <a href="tel:+918910260709" className="font-bold underline text-teal-700 dark:text-teal-300">8910260709</a> or WhatsApp.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
