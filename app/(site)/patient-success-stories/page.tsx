import { Star, Quote, Calendar, MapPin, User, ArrowRight, HeartPulse } from 'lucide-react'

export default function PatientSuccessStoriesPage() {
  const stories = [
    {
      name: "Mrs. Anjali Roy",
      location: "Behala, Kolkata",
      date: "March 2024",
      story: "My elderly mother needed regular blood tests for her diabetes management. Traveling to a lab every month was becoming very difficult for her. Capsic care has been a blessing. Their phlebotomists are very gentle, and we get the reports on WhatsApp within the same day. Highly recommended for senior citizen care.",
      rating: 5,
      test: "Diabetes Profile"
    },
    {
      name: "Mr. Souvik Das",
      location: "Howrah",
      date: "February 2024",
      story: "I work long hours and never had the time to visit a diagnostic center for a full body checkup. Capsic Care's early morning collection service (6:30 AM) saved my day. The process was professional, and the digital reports were very easy to understand. The pricing is also much better than standard labs.",
      rating: 5,
      test: "Premium Full Body Package"
    },
    {
      name: "Dr. Pallavi Mehta",
      location: "Salt Lake",
      date: "January 2024",
      story: "As a working professional and a mother, I value efficiency. I booked a Dengue test for my child during an emergency. The sample was collected within 2 hours of booking and the report came in record time. The accuracy and the speed of service during such a critical time was impressive.",
      rating: 5,
      test: "Fever/Dengue Profile"
    }
  ]

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6">
            <HeartPulse size={40} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Real Stories, Real Impact</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            At Capsic Care, every test we perform is part of a patient's journey towards better health. Here are a few stories of how we've helped our community in Kolkata and Howrah.
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {stories.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="flex gap-1 mb-6">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <Quote size={48} className="text-rose-100 dark:text-slate-800 mb-4 transition-colors group-hover:text-rose-200" />
                
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed italic mb-8 flex-grow">
                  "{item.story}"
                </p>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold uppercase tracking-wider">
                        <span>{item.test}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {item.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Write Your Own Health Story</h2>
          <p className="text-slate-400 text-lg">Experience the most convenient and professional home lab test service in West Bengal.</p>
          <div className="pt-4">
             <a
              href="/lab-tests"
              className="px-8 py-4 bg-rose-600 hover:bg-rose-700 rounded-xl font-bold transition-all inline-flex items-center gap-2"
            >
              Book Your Test Now
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
