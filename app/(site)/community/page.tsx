import { Users, Heart, BookOpen, HandHeart, Trophy, Youtube, BookText, Share2, Target, Lightbulb, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Community Healthcare Movement | Capsic Care',
  description: 'Join the Capsic Care community healthcare movement. Making quality healthcare accessible to every family.',
}

export default function CommunityPage() {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-800 to-slate-900 text-white py-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113514693-dd3bb764b4c7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <span className="inline-block px-4 py-2 bg-teal-500/20 text-teal-300 font-bold rounded-full text-sm border border-teal-500/30">
            THE CAPSIC CARE MOVEMENT
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Healthcare For <br/><span className="text-teal-400">Every Family</span>
          </h1>
          <p className="text-xl text-teal-50 leading-relaxed font-light">
            We believe that geography, technology, and income should never dictate the quality of healthcare a family receives. We are building a movement to change this.
          </p>
        </div>
      </section>

      {/* Our Mission & Impact */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              To build India's largest and most accessible assisted healthcare network. We aim to empower local communities by creating physical touchpoints where people can walk in, feel cared for, and connect with the best doctors and diagnostic facilities in the country.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/about" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
                Read Our Story
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: '5000+', label: 'Families Impacted' },
              { val: '24', label: 'Health Camps' },
              { val: '100+', label: 'Local Volunteers' },
              { val: '15', label: 'NGO Partners' }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <p className="text-3xl font-black text-teal-600 dark:text-teal-400 mb-2">{stat.val}</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Initiatives Grid */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Initiatives</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Lightbulb, title: 'Healthcare Awareness', desc: 'Running local campaigns to educate families on preventive health, hygiene, and nutrition.' },
            { icon: HandHeart, title: 'Volunteer Programme', desc: 'Empowering local youth to become health advocates in their own neighborhoods.' },
            { icon: Target, title: 'CSR & NGO Partnerships', desc: 'Collaborating with corporate entities and non-profits to fund treatments and screenings for the underprivileged.' }
          ].map((item, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center mb-6">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-16 md:py-24 bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Community Stories</h2>
            <p className="text-teal-100 max-w-2xl mx-auto text-lg">Real stories of impact from the neighborhoods we serve.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-teal-800 rounded-3xl p-8 border border-teal-700/50">
                <div className="flex gap-1 text-teal-400 mb-6">
                  {[...Array(5)].map((_, j) => <span key={j}>★</span>)}
                </div>
                <p className="text-teal-50 text-lg italic mb-6 leading-relaxed">
                  "Having a Capsic Care centre in our village completely changed how my parents access healthcare. They no longer have to travel 15km just to show their reports to a specialist."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-teal-300" />
                  </div>
                  <div>
                     <p className="font-bold">Rahul Mondal</p>
                     <p className="text-sm text-teal-300">Domjur Resident</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/patient-success-stories" className="inline-flex items-center gap-2 text-teal-200 hover:text-white font-medium group">
              Read More Success Stories <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Health Education & Media */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#0a0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Articles */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-8">
                <BookText className="text-teal-600" /> Public Health Articles
              </h2>
              <div className="space-y-4">
                {[
                  'Understanding Dengue Prevention in Monsoons', 
                  'The Importance of Regular BP Monitoring',
                  'Child Nutrition: A Guide for Rural Communities'
                ].map((title, i) => (
                  <Link key={i} href="/blog" className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors group bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">Read article →</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-8">
                <Youtube className="text-red-500" /> Awareness Videos
              </h2>
              <div className="space-y-4">
                 <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                    <p className="font-medium">Video Player Placeholder</p>
                 </div>
                 <p className="font-semibold text-slate-900 dark:text-white text-center">Capsic Care: Our Vision for Bengal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
