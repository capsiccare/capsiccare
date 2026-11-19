import { MapPin, Phone, Mail, Clock, MessageSquare, Send } from 'lucide-react'

export const metadata = {
  title: 'Contact Us | Capsic Care',
  description: 'Get in touch with Capsic Care for any queries, support, or feedback.',
}

export default function ContactPage() {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14] py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We are here to help. Reach out to our community healthcare team for any inquiries or support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Get In Touch</h2>

                {/* Home Sample Collection & Price Notice */}
                <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-bold text-xs uppercase tracking-wider">
                      Notice
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      🚚 Free Home Sample Collection
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Free home sample collection is available if total test amount or price is above <strong>₹2,000</strong> (in Howrah &amp; Kolkata).
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    For updated prices or any information, contact <a href="tel:+918910260709" className="font-bold text-teal-600 dark:text-teal-400 underline">8910260709</a> or connect on <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20have%20an%20inquiry%20regarding%20updated%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 dark:text-emerald-400 underline">WhatsApp</a>.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Clinic Address</h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">Bankra Bazar, Dewan Para Road<br/>Domjur, Howrah – 711403</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Phone</h3>
                      <a href="tel:+918910260709" className="text-slate-600 dark:text-slate-400 mt-1 hover:text-teal-600 transition-colors">+91 8910260709</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">WhatsApp</h3>
                      <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20have%20a%20general%20inquiry." target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 mt-1 hover:text-teal-600 transition-colors">+91 8910260709</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Email</h3>
                      <a href="mailto:capsiccare@gmail.com" className="text-slate-600 dark:text-slate-400 mt-1 hover:text-teal-600 transition-colors">capsiccare@gmail.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Business Hours</h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">Monday - Saturday: 8:00 AM - 8:00 PM<br/>Sunday: 8:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>
             </div>
             
             {/* Google Maps Integration */}
             <div className="w-full h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                <iframe 
                  src="https://maps.google.com/maps?q=Capsic+Care,+Bazar,+Dewan+Para+Rd,+Bankra,+Howrah,+West+Bengal+711403&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
             </div>
          </div>

          {/* Enquiry Form */}
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send an Enquiry</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="button" 
                className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
