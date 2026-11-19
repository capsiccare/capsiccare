'use client'

import { useState } from 'react'
import { Microscope, ArrowRight, CheckCircle2, FlaskConical, ClipboardList, BarChartHorizontal } from 'lucide-react'

export default function JoinAsLabPage() {
  const [formData, setFormData] = useState({
    labName: '',
    labHead: '',
    phone: '',
    email: '',
    nablId: '',
    location: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `LAB PARTNER APPLICATION
    
Lab Name: ${formData.labName}
Lab Head/Owner: ${formData.labHead}
NABL/ID: ${formData.nablId}
Phone: ${formData.phone}
Location: ${formData.location}

Note: Interested in joining the Capsic Care Labs Aggregator Network.`
    
    const encoded = encodeURIComponent(msg)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918910260709'
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`)
  }

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
            <Microscope size={16} />
            Laboratory Partnership
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
            Scale Your Laboratory <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Across the Region</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Integrate your diagnostic lab with Capsic Care's aggregator platform to reach thousands of new patients and optimize your testing capacity.
          </p>
        </div>
      </section>

      {/* Integration Benefits */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12">
          {[
            {
              icon: FlaskConical,
              title: "Increased Volume",
              description: "Receive a consistent flow of samples from our wide network of pharmacy and digital partners."
            },
            {
              icon: ClipboardList,
              title: "Streamlined Logistics",
              description: "We manage the entire home collection and sample delivery process using our expert phlebotomy team."
            },
            {
              icon: BarChartHorizontal,
              title: "Growth Analytics",
              description: "Access detailed insights on test trends and market demands in your service area."
            }
          ].map((item, idx) => (
            <div key={idx} className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
                <item.icon size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-950 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Lab Partnership Registry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Lab Name</label>
                  <input type="text" required value={formData.labName} onChange={(e) => setFormData({...formData, labName: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">NABL/Reg ID</label>
                  <input type="text" required value={formData.nablId} onChange={(e) => setFormData({...formData, nablId: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Lab Head / Owner</label>
                <input type="text" required value={formData.labHead} onChange={(e) => setFormData({...formData, labHead: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Location</label>
                  <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-500/20">
                Submit Lab Details
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
