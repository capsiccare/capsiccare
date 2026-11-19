import { Store, Building, Stethoscope, HeartHandshake, Laptop, TrendingUp, ShieldCheck, GraduationCap, ClipboardCheck, ArrowRight, FlaskConical, Users, MonitorPlay, Building2 } from 'lucide-react'

export const metadata = {
  title: 'Partner With Capsic Care | Join Our Network',
  description: 'Join India\'s largest assisted healthcare network. Partner with Capsic Care as a laboratory, hospital, doctor, or entrepreneur.',
}

const partnerCategories = [
  { icon: FlaskConical, title: 'Laboratory Partners', description: 'NABL & CAP accredited pathology labs ensuring clinical precision.' },
  { icon: Building2, title: 'Hospital Partners', description: 'Leading multispecialty hospitals for tertiary care referrals.' },
  { icon: Stethoscope, title: 'Doctor Partners', description: 'Eminent specialists and compassionate general physicians.' },
  { icon: Users, title: 'Healthcare Professionals', description: 'Nurses, health assistants, and phlebotomists driving our care.' },
  { icon: HeartHandshake, title: 'NGOs & Non-Profits', description: 'Organizations helping us take healthcare to the grassroots.' },
  { icon: MonitorPlay, title: 'Technology Partners', description: 'Digital health innovators powering our telemedicine.' },
]

export default function PartnerPage() {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      
      {/* Header Section */}
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block px-4 py-2 bg-teal-500/20 text-teal-300 font-bold rounded-full text-sm uppercase tracking-wider border border-teal-500/30">
            Partnership Network
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Together For Better <span className="text-teal-400">Healthcare</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Capsic Care is proud to collaborate with India's most trusted healthcare institutions, laboratories, and organizations to build a comprehensive care network.
          </p>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">Our Esteemed Partners</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-4xl mx-auto">
            {/* Partner 1 */}
            <div className="p-8 md:p-12 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:shadow-xl hover:border-teal-500/30 transition-all flex flex-col items-center justify-center min-h-[250px]">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Manipal Hospitals</h3>
               <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-full border border-teal-200 dark:border-teal-800">
                 Hospital Partner
               </span>
            </div>
            {/* Partner 2 */}
            <div className="p-8 md:p-12 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:shadow-xl hover:border-cyan-500/30 transition-all flex flex-col items-center justify-center min-h-[250px]">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Veins Laboratory</h3>
               <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 text-sm font-semibold rounded-full border border-cyan-200 dark:border-cyan-800">
                 Laboratory Partner
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner Section */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#0a0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">Become a Healthcare Partner</h2>
            <p className="text-lg text-slate-700 dark:text-slate-400">
              We are looking for driven individuals and organizations to partner with us in bringing quality healthcare to every neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Who can partner */}
            <div className="space-y-8">
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white border-l-4 border-teal-500 pl-4">
                  Who Can Partner With Us?
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { icon: Store, title: 'Pharmacies' },
                   { icon: HeartHandshake, title: 'Healthcare Entrepreneurs' },
                   { icon: Building, title: 'Clinics & Nursing Homes' },
                   { icon: ClipboardCheck, title: 'Diagnostic Centres' },
                   { icon: Stethoscope, title: 'Doctors' },
                   { icon: TrendingUp, title: 'Healthcare Investors' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/50 transition-colors">
                     <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg flex items-center justify-center shrink-0">
                       <item.icon size={20} />
                     </div>
                     <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full -z-0" />
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 relative z-10">Partner Registration Form</h3>
               <form className="space-y-5 relative z-10">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                     <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="First Name" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                     <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Last Name" />
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                   <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="+91" />
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Partnership Type</label>
                   <select className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none text-slate-700 dark:text-slate-300">
                     <option>Pharmacy Partner</option>
                     <option>Clinic / Nursing Home</option>
                     <option>Doctor Partner</option>
                     <option>Diagnostic Centre</option>
                     <option>Investor / Entrepreneur</option>
                   </select>
                 </div>

                 <button type="button" className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-colors mt-4 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20">
                   Submit Application <ArrowRight size={18} />
                 </button>
               </form>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Franchise & Partner Benefits</h2>
              <p className="text-lg text-slate-700 dark:text-slate-400">Everything you need to successfully run and scale a community healthcare centre.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Laptop, title: 'Technology Platform', desc: 'End-to-end software for teleconsultations, billing, and patient records.' },
                { icon: ShieldCheck, title: 'Brand Trust', desc: 'Leverage the Capsic Care brand known for quality and affordability.' },
                { icon: Stethoscope, title: 'Doctor Network', desc: 'Instant access to our panel of general physicians and specialists.' },
                { icon: ClipboardCheck, title: 'Diagnostic Network', desc: 'Seamless integration with accredited labs for sample pickup and reports.' },
                { icon: TrendingUp, title: 'Marketing Support', desc: 'Local marketing campaigns, health camps, and digital promotions.' },
                { icon: GraduationCap, title: 'Staff Training', desc: 'Comprehensive training for your health assistants and phlebotomists.' },
                { icon: Building, title: 'Operations Setup', desc: 'Standardized SOPs and guidance for setting up your physical clinic.' },
                { icon: HeartHandshake, title: 'Patient Management', desc: 'Dedicated support team to help manage patient queries and follow-ups.' }
              ].map((benefit, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors shadow-sm">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 rounded-xl flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <benefit.icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-400 font-medium">{benefit.desc}</p>
                </div>
              ))}
            </div>
         </div>
      </section>
    </div>
  )
}
