'use client'

import { useState } from 'react'
import { Store, ArrowRight, CheckCircle2, TrendingUp, Handshake, Users } from 'lucide-react'

export default function JoinAsPharmacyPage() {
  const [formData, setFormData] = useState({
    pharmacyName: '',
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `PHARMACY PARTNER APPLICATION
    
Pharmacy Name: ${formData.pharmacyName}
Owner Name: ${formData.ownerName}
Phone: ${formData.phone}
Email: ${formData.email}
Location: ${formData.location}

Note: Interested in joining the Capsic Care Health Partner Network.`
    
    const encoded = encodeURIComponent(msg)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918910260709'
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`)
  }

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
            <Handshake size={16} />
            Partner with Us
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
            Turn Your Pharmacy into a <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Health Hub</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Become a Capsic Care Health Partner. Increase your pharmacy's revenue by offering premium lab collection services to your customers.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Extra Revenue",
                description: "Earn significant commissions on every diagnostic test booking made through your pharmacy."
              },
              {
                icon: Users,
                title: "Customer Loyalty",
                description: "Offer more services to your customers, making your pharmacy a one-stop destination for health needs."
              },
              {
                icon: CheckCircle2,
                title: "Zero Investment",
                description: "Join our network with no upfront costs. We provide the platform, marketing, and the phlebotomists."
              }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                  <benefit.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="text-center mb-10 space-y-3">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Register as Pharmacy</h2>
              <p className="text-slate-600 dark:text-slate-400">Fill out the details below to start your partnership journey.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pharmacy Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.pharmacyName}
                    onChange={(e) => setFormData({...formData, pharmacyName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Wellness Pharmacy"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Owner Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Full Name"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="+91"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location (City/Area) *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. North Kolkata"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:opacity-90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                Apply via WhatsApp
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
