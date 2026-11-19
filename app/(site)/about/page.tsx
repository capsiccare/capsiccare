import { MapPin, Smartphone, BookOpen, Coins, HeartHandshake } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
  title: 'About Us | Capsic Care',
  description: 'The story behind Capsic Care and our mission to democratize healthcare in India.',
}

export default function AboutPage() {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* Hero Section */}
      <section className="bg-teal-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">Our Story</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
            We started with a simple belief: that no family should ever have to compromise on their health because of where they live or how much they earn.
          </p>
        </div>
      </section>

      {/* The Founder Story */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Born From A <br/><span className="text-teal-600 dark:text-teal-400">Personal Mission</span>
            </h2>
            <div className="space-y-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                The seed for Capsic Care was planted when our founder witnessed a heartbreaking reality: families traveling hours to the city, navigating complex hospital systems, and spending a fortune just to get a basic diagnosis or consult a specialist.
              </p>
              <p>
                It wasn't a lack of medical advancement that failed them—it was a lack of accessibility. The gap between world-class healthcare in the cities and the struggling families in semi-urban and rural areas was too wide.
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                We realized that if families couldn't reach quality healthcare, we had to bring quality healthcare to them.
              </p>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <HeartHandshake size={64} className="mb-4 opacity-50" />
                  <p className="font-medium text-lg">Compassionate Care</p>
                </div>
             </div>
             <div className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                <p className="text-3xl font-black text-teal-600 dark:text-teal-400">100%</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Commitment</p>
             </div>
          </div>
        </div>
      </section>

      {/* The Four Pillars */}
      <section className="py-16 md:py-24 bg-slate-100 dark:bg-[#0a0e14] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">Healthcare Should Never Depend On...</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We are dismantling the four major barriers that prevent families from receiving the care they deserve.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Distance',
                description: "You shouldn't have to travel to a metro city for world-class doctors. We're building physical centres in every neighborhood."
              },
              {
                icon: Smartphone,
                title: 'Technology',
                description: "Not everyone knows how to use an app. Our 'Assisted Telemedicine' means a real human helps you connect with the doctor."
              },
              {
                icon: BookOpen,
                title: 'Awareness',
                description: "Prevention is better than cure. We run continuous health education camps to empower communities with medical knowledge."
              },
              {
                icon: Coins,
                title: 'Income',
                description: "Quality shouldn't be a luxury. By aggregating services and bringing them local, we provide radical price transparency and affordability."
              }
            ].map((pillar, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6">
                  <pillar.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{pillar.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
