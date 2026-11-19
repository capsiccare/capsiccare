import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Capsic Care',
  description: 'Privacy policy for Capsic Care healthcare diagnostics',
}

export default function PrivacyPage() {
  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      <section className="pt-20 pb-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-200 mt-4">
            Last updated: August 16, 2026
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              1. Information We Collect
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              We collect information you voluntarily provide to us when using our services, including personal information such as your name, email address, phone number, age, medical history, and address. We also automatically collect certain information about your device and usage patterns.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              2. How We Use Your Information
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              Your information is used to provide our lab testing services, improve our platform, communicate with you about bookings and results, and ensure the security of our services. We never sell your personal information to third parties.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              3. Data Security
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              We implement industry-standard security measures to protect your personal information. All data transmissions are encrypted using SSL technology. Your medical records are stored securely and accessed only by authorized personnel.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              4. Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              You have the right to access, modify, or delete your personal information at any time. You can also opt-out of marketing communications. To exercise these rights, contact us at capsiccare@gmail.com.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              5. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              If you have questions about our privacy practices, please contact us at capsiccare@gmail.com or call +91 8910260709.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
