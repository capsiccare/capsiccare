import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, RefreshCw, Clock, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Refund & Cancellation Policy | Capsic Care Healthcare',
  description: 'Official refund, cancellation, and sample collection rescheduling policy for Capsic Care Health Network.',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline mb-4"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <ShieldCheck size={16} /> Trust & Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Last Updated: November 2026 • Capsic Care Health Network (Howrah &amp; Kolkata)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <RefreshCw size={24} className="text-teal-600 dark:text-teal-400 mb-2" />
            <h3 className="font-bold text-sm mb-1">100% Doorstep Refund</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full refund if cancelled before phlebotomist dispatch to your address.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Clock size={24} className="text-teal-600 dark:text-teal-400 mb-2" />
            <h3 className="font-bold text-sm mb-1">3–5 Working Days</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Online UPI / Bank payments reversed directly to original source account.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle2 size={24} className="text-teal-600 dark:text-teal-400 mb-2" />
            <h3 className="font-bold text-sm mb-1">Zero Re-draw Fee</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Free recollect if lab technical hemolysis or sample inadequacy occurs.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Diagnostic Tests &amp; Health Packages Cancellation
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Patients may cancel their lab test or health package order anytime prior to physical sample collection. If cancellation occurs before phlebotomist dispatch, 100% of the amount paid will be refunded. If a phlebotomist has already arrived at the designated address, a nominal transport fee of ₹100 may be deducted from the total refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Doctor Consultation Cancellation &amp; Rescheduling
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Appointments booked with our doctors can be rescheduled or cancelled up to 2 hours before the scheduled chamber slot. If a doctor is unavailable due to medical emergencies, patients will be offered an immediate alternative doctor slot or a full refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Processing of Refunds (UPI &amp; Bank Transfers)
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Refunds for payments collected via HDFC Bank SmartHub VYAPAR or UPI will be initiated within 24 hours of cancellation approval and credited back to the customer&apos;s originating bank account or UPI VPA within 3 to 5 banking business days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Quality Guarantee &amp; Sample Recollection
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              In rare instances where a biological sample is deemed insufficient (QNS) or hemolyzed by the diagnostic laboratory analyzers, Capsic Care will perform a second home collection free of any additional charge. If the patient prefers not to provide a second sample, a full refund for that specific test will be issued.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. Contact Us for Cancellations or Billing Assistance
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              For any refund inquiries, billing discrepancies, or immediate cancellation support, please reach our customer desk:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Phone Helpline: <a href="tel:+918910260709" className="font-bold text-teal-600 dark:text-teal-400 underline">+91 8910260709</a></li>
              <li>WhatsApp Support: <a href="https://wa.me/918910260709" className="font-bold text-teal-600 dark:text-teal-400 underline">+91 8910260709</a></li>
              <li>Official Email: <a href="mailto:capsiccare@gmail.com" className="font-bold text-teal-600 dark:text-teal-400 underline">capsiccare@gmail.com</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
