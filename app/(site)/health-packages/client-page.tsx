'use client'

import { PackageCard } from '@/components/package-card'
import { Package } from '@/lib/data/types'

export function HealthPackagesClient({ initialPackages }: { initialPackages: Package[] }) {
  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Header */}
      <section className="pt-24 pb-14 bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 text-white border-b border-teal-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              Transparent Low-Cost Pricing
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Affordable Health Packages in Bankra
            </h1>
            <p className="text-base sm:text-lg text-teal-100 leading-relaxed">
              Comprehensive full-body checkup profiles starting from ₹599. Free doorstep home sample collection is available if total test amount or price is above ₹2,000 across Howrah &amp; Kolkata (Bankra, Kona, Makardah, Domjur, Santragachi, and surrounding regions) with guaranteed 24-hour smart digital reports.
            </p>
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-teal-200">
                🚚 <strong>Free Home Sample Collection:</strong> Available if total amount is above <strong>₹2,000</strong> in Howrah &amp; Kolkata.
              </span>
              <div className="flex items-center gap-2 text-teal-100 text-xs">
                <span>For updated prices or info:</span>
                <a href="tel:+918910260709" className="font-bold underline text-white hover:text-teal-300">
                  📞 8910260709
                </a>
                <span>|</span>
                <a
                  href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20health%20packages%20and%20home%20sample%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-2.5 py-1 rounded-lg font-bold text-xs"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {initialPackages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {initialPackages.map((pkg) => (
                <div key={pkg.id} className="h-full">
                  <PackageCard pkg={pkg} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                No packages found
              </h3>
              <p className="text-slate-600 dark:text-slate-200">
                Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
