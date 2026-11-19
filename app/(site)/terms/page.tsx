import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Capsic Care',
  description: 'Terms of service for Capsic Care healthcare diagnostics',
}

export default function TermsPage() {
  return (
    <div className="w-full bg-white dark:bg-[#0a0e14]">
      <section className="pt-20 pb-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Terms of Service
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
              1. Agreement to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              2. Use License
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              Permission is granted to temporarily download one copy of the materials (information or software) on the Capsic Care website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-200">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              3. Disclaimer
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              The materials on the Capsic Care website are provided on an 'as is' basis. Capsic Care makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              4. Limitations
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              In no event shall Capsic Care or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Capsic Care website.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              5. Accuracy of Materials
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              The materials appearing on the Capsic Care website could include technical, typographical, or photographic errors. Capsic Care does not warrant that any of the materials on the website are accurate, complete, or current. Capsic Care may make changes to the materials contained on the website at any time without notice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              6. Links
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              Capsic Care has not reviewed all of the sites linked to the website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Capsic Care of the site. Use of any such linked website is at the user's own risk.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              7. Modifications
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              Capsic Care may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              8. Governing Law
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              9. Contact Information
            </h2>
            <p className="text-slate-600 dark:text-slate-200 text-base md:text-lg leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at capsiccare@gmail.com or call +91 8910260709.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
