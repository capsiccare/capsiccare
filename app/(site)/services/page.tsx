import { Stethoscope, Video, Activity, Users, Shield, TestTube, Home, Heart, Beaker, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Our Services | Capsic Care',
  description: 'Comprehensive community healthcare services including telemedicine, diagnostics, and doctor consultations.',
}

const services = [
  {
    icon: Stethoscope,
    title: 'Doctor Consultation',
    description: 'Expert medical consultations with experienced general physicians at our community centres.',
    link: '/services/doctor-consultation'
  },
  {
    icon: Video,
    title: 'Assisted Telemedicine',
    description: 'Remote HD consultations with specialists, assisted by our trained healthcare workers on-ground.',
    link: '/services/assisted-telemedicine'
  },
  {
    icon: Users,
    title: 'Specialist Consultation',
    description: 'Access to leading specialists in cardiology, orthopedics, pediatrics, and more.',
    link: '/services/specialist-consultation'
  },
  {
    icon: Beaker,
    title: 'Diagnostics',
    description: 'Search and book from our comprehensive list of 5000+ pathology and lab tests with clinical precision.',
    link: '/lab-tests'
  },
  {
    icon: Home,
    title: 'Home Sample Collection',
    description: 'Safe sample collection across Howrah & Kolkata. Free home sample collection on test amounts above ₹2000. Contact 8910260709 or WhatsApp for updated prices & info.',
    link: '/services/home-sample-collection'
  },
  {
    icon: Heart,
    title: 'Health Packages',
    description: 'Curated full-body checkups and wellness packages tailored for all age groups and needs.',
    link: '/health-packages'
  },
  {
    icon: Shield,
    title: 'Preventive Health Checkups',
    description: 'Proactive screening programs designed to identify potential health risks before they become severe.',
    link: '/services/preventive-health-checkups'
  },
  {
    icon: Activity,
    title: 'Lifestyle Disease Screening',
    description: 'Specialized tests for diabetes, thyroid, cholesterol, and cardiovascular health management.',
    link: '/services/lifestyle-disease-screening'
  },
  {
    icon: Users,
    title: 'Community Healthcare',
    description: 'Local health education, awareness camps, and outreach programs for the neighborhood.',
    link: '/services/community-healthcare'
  }
]

export default function ServicesPage() {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14] py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 mb-16">
          <span className="text-teal-600 dark:text-teal-400 font-bold tracking-wider uppercase text-sm">Comprehensive Care</span>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white">Our Services</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From preventive checkups to specialist consultations, we offer complete healthcare solutions designed for the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 group flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <service.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{service.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">{service.description}</p>
              
              <Link href={service.link} className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium group-hover:gap-3 transition-all mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                Learn More <ArrowRight size={18} />
              </Link>
            </div>
          ))}
          
          {/* Coming Soon */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col h-full items-center justify-center text-center opacity-70">
            <FileText size={48} className="text-slate-400 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">More Services</h3>
            <p className="text-slate-600 dark:text-slate-400">
              We are constantly expanding our offerings to bring more healthcare services to your neighborhood.
            </p>
            <span className="mt-4 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">Coming Soon</span>
          </div>
        </div>

      </div>
    </div>
  )
}
