'use client'

import { useState } from 'react'
import { Building2, ArrowRight, CheckCircle2, ShieldPlus, BarChart3, Radio } from 'lucide-react'

export default function JoinAsHospitalPage() {
  const [formData, setFormData] = useState({
    hospitalName: '',
    contactPerson: '',
    phone: '',
    location: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `HOSPITAL/CLINIC PARTNER APPLICATION
    
Hospital Name: ${formData.hospitalName}
Contact Person: ${formData.contactPerson}
Phone: ${formData.phone}
Location: ${formData.location}

Note: Interested in institutional partnership with Capsic Care.`
    
    const encoded = encodeURIComponent(msg)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918910260709'
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`)
  }

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold mb-4 border border-slate-200 dark:border-slate-700">
            <Building2 size={16} />
            Institutional Solutions
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
            Comprehensive Diagnostic <br />
            <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Support for Hospitals</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Scale your clinical operations and improve patient satisfaction with our managed home collection services and tech-enabled diagnostics.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12">
          {[
            {
              icon: ShieldPlus,
              title: "Outreach Expansion",
              description: "Provide diagnostic services to your patients even after discharge, directly at their homes."
            },
            {
              icon: BarChart3,
              title: "Operational Efficiency",
              description: "Reduce OPD congestion by outsourcing routine sample collections to our trusted network."
            },
            {
              icon: Radio,
              title: "Real-time Tracking",
              description: "Monitor patient report statuses and history through our dedicated partner dashboard."
            }
          ].map((item, idx) => (
            <div key={idx} className="space-y-4 text-center md:text-left">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden">
            <div className="md:w-1/2 p-8 md:p-12 bg-slate-900 text-white space-y-6">
              <h2 className="text-3xl font-bold">Institutional Partnership</h2>
              <p className="text-slate-400 text-lg">We offer customized diagnostic workflows for Private Hospitals, Clinics, and Nursing Homes.</p>
              <div className="space-y-3">
                <div className="flex gap-3 items-start text-sm">
                  <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                  <span>NABL Accredited Partner Labs</span>
                </div>
                <div className="flex gap-3 items-start text-sm">
                  <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                  <span>Bulk Pricing & Revenue Share</span>
                </div>
                <div className="flex gap-3 items-start text-sm">
                  <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                  <span>Dedicated Account Manager</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Hospital/Clinic Name</label>
                  <input type="text" required value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Contact Person</label>
                  <input type="text" required value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Location</label>
                  <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20">
                  Submit Institutional Request
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
