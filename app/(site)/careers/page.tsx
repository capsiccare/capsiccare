'use client'

import { useState } from 'react'
import { Briefcase, ArrowRight, CheckCircle2, Heart, Zap, Globe } from 'lucide-react'

export default function CareersPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    resume_link: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const message = `CAREER APPLICATION
    
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Position applied for: ${formData.position}
Experience: ${formData.experience} years
Resume/Portfolio: ${formData.resume_link}

Message:
${formData.message}`
    
    const encoded = encodeURIComponent(message)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918910260709'
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`)
  }

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold mb-4">
            <Briefcase size={16} />
            We're Hiring!
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
            Build the Future of <br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Healthcare Diagnostics</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Join West Bengal's fastest-growing lab aggregator platform. We are looking for passionate individuals to help us make healthcare accessible to every household.
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Join Capsic Care?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              We value innovation, empathy, and hard work. Here’s what you can expect when you join our team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Impactful Work",
                description: "Be part of a mission that directly improves people's lives through better healthcare access."
              },
              {
                icon: Zap,
                title: "Growth Opportunities",
                description: "As a rapidly expanding startup, your career growth is tied to our success. The sky is the limit."
              },
              {
                icon: Globe,
                title: "Dynamic Culture",
                description: "Work in a collaborative, fast-paced environment where your ideas actually matter."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-8 lg:p-12 bg-gradient-to-br from-teal-600 to-teal-700 text-white space-y-6">
              <h2 className="text-3xl font-bold leading-tight">Apply for a Position</h2>
              <p className="text-teal-50 text-lg opacity-90">
                Interested in working with us? Fill out the form and our recruitment team will get in touch via WhatsApp.
              </p>
              
              <div className="space-y-4 pt-6">
                <div className="flex gap-3 items-center">
                  <CheckCircle2 className="text-teal-200" size={20} />
                  <span>Transparent hiring process</span>
                </div>
                <div className="flex gap-3 items-center">
                  <CheckCircle2 className="text-teal-200" size={20} />
                  <span>Competitive compensation</span>
                </div>
                <div className="flex gap-3 items-center">
                  <CheckCircle2 className="text-teal-200" size={20} />
                  <span>Flexible work arrangements</span>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position</label>
                  <select 
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">Select Position</option>
                    <option value="Phlebotomist">Phlebotomist (Home Collection)</option>
                    <option value="Sales Executive">Sales & Business Development</option>
                    <option value="Customer Support">Customer Care Executive</option>
                    <option value="Operations Manager">Operations & Logistics</option>
                    <option value="Others">General Application</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Experience (Years)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resume Link (Google Drive/LinkedIn)</label>
                  <input 
                    type="url" 
                    required
                    value={formData.resume_link}
                    onChange={(e) => setFormData({...formData, resume_link: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Submit Application
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
