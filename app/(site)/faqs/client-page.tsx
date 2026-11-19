'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { FAQ } from '@/lib/data/types'

export function FAQsClient({ faqs }: { faqs: FAQ[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Safely handle undefined or empty faqs
  const groupedFAQs = (faqs || []).reduce((acc, faq) => {
    const category = faq.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

  const categories = Object.keys(groupedFAQs)

  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      {/* Header */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-200 max-w-2xl mx-auto">
            Find answers to common questions about our services, booking process, and test procedures.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white px-4 py-2 border-l-4 border-teal-600 dark:border-teal-400">
                  {category}
                </h2>

                <div className="space-y-3">
                  {groupedFAQs[category].map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === faq.id ? null : faq.id)
                        }
                        className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                      >
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white text-left">
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0 ml-4">
                          {expandedId === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                          )}
                        </div>
                      </button>

                      {expandedId === faq.id && (
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <p className="text-xl text-slate-600 dark:text-slate-200">
              FAQs will be available soon.
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              For now, please contact us via WhatsApp for any questions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
