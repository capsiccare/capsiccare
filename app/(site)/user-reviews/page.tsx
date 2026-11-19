import { Star, ShieldCheck, CheckCircle2, ThumbsUp } from 'lucide-react'

export default function UserReviewsPage() {
  const reviews = [
    { name: "Suman Ghosh", rating: 5, comment: "Excellent service. The phlebotomist arrived exactly on time. The packaging and handling of samples were very professional.", source: "Google" },
    { name: "Anita Chatterjee", rating: 5, comment: "I've tried many labs but Capsic Care's transparency is what won me over. No hidden costs for home collection.", source: "Facebook" },
    { name: "Rahul Sharma", rating: 5, comment: "Fast results and great support on WhatsApp. My first choice for blood tests in Kolkata now.", source: "WhatsApp" },
    { name: "Barnali Sen", rating: 4, comment: "Good experience, reports were easy to read. Will recommend to others.", source: "Google" },
    { name: "Debashis Paul", rating: 5, comment: "The home collection was truly painless and quick. Excellent digital report system.", source: "Google" },
    { name: "Rina Das", rating: 5, comment: "Very impressed with the professional attitude. Safe and hygienic collection.", source: "Google" }
  ]

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Hero */}
      <section className="pt-32 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={28} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Customer Reviews</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Trusted by 1000+ happy customers across Kolkata & Howrah.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">4.9/5</p>
            <p className="text-sm font-semibold text-slate-500 uppercase">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">1k+</p>
            <p className="text-sm font-semibold text-slate-500 uppercase">Verified Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">100%</p>
            <p className="text-sm font-semibold text-slate-500 uppercase">Sanitized Kits</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-teal-600 mb-1">98%</p>
            <p className="text-sm font-semibold text-slate-500 uppercase">Response Rate</p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white dark:bg-[#0a0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <ShieldCheck size={32} />
            <span>SECURE BOOKING</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <CheckCircle2 size={32} />
            <span>NABL PARTNERS</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <ThumbsUp size={32} />
            <span>MD REVIEWED</span>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.map((rev, idx) => (
              <div key={idx} className="break-inside-avoid bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1 mb-2">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {rev.source}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">"{rev.comment}"</p>
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{rev.name}</p>
                  <p className="text-[10px] text-teal-600 font-bold">Verified Customer</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
