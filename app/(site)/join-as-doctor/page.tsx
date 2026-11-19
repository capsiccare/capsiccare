'use client'

import { useState } from 'react'
import { Stethoscope, CheckCircle2, Shield, UploadCloud, AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'

export default function DoctorOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Extract checkboxes
    const documents = formData.getAll('documents').join(', ')
    formData.set('documents', documents)

    // Using URLSearchParams to prepare for x-www-form-urlencoded (Best for Google Apps Script Web App)
    const urlEncodedData = new URLSearchParams()
    formData.forEach((value, key) => {
      urlEncodedData.append(key, value.toString())
    })

    try {
      // NOTE: Replace this URL with your actual Google Apps Script Web App URL once deployed
      const scriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
      
      // If the user hasn't replaced the URL yet, simulate a success for testing
      if (scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.warn('Google Apps Script URL is not configured. Simulating success.')
        setTimeout(() => {
          setIsSubmitting(false)
          setIsSuccess(true)
        }, 1500)
        return
      }

      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: urlEncodedData,
        // mode: 'no-cors' is required when calling Google Apps Script from a browser to avoid CORS errors
        // Note: 'no-cors' means you won't be able to read the response object, it will be opaque.
        mode: 'no-cors' 
      })

      // Assuming success if the fetch didn't throw an error
      setIsSubmitting(false)
      setIsSuccess(true)

    } catch (err: any) {
      console.error('Submission error:', err)
      setError('Something went wrong submitting your application. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e14] flex items-center justify-center py-24 px-4">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-10 text-center shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Application Submitted</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Thank you for your interest in partnering with Capsic Care. Our medical director will review your details and our onboarding team will contact you shortly to collect your documents and proceed with the integration.
          </p>
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-2xl mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">Doctor Onboarding</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Thank you for your interest with Capsic Care. Would request you to spare few minutes and fill in the following details to complete your onboarding process.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 flex items-center gap-3 border-b border-red-100 dark:border-red-900/30">
              <AlertCircle size={20} />
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-12">
            
            {/* 1. Personal Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Shield size={20} className="text-teal-600" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input required name="fullName" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Dr. John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Medical Registration Number (with Year) *</label>
                  <input required name="registrationNumber" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 12345 (2010)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                  <input required name="mobileNumber" type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+91" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email ID *</label>
                  <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="doctor@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assistant / Appointment Phone Number (if any)</label>
                  <input name="assistantPhone" type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+91" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Consultation Fees (₹) *</label>
                  <input required name="consultationFees" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 500" />
                </div>
              </div>
            </section>

            {/* 2. Professional Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <FileText size={20} className="text-teal-600" /> Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Specialization *</label>
                  <input required name="specialization" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Cardiology, Pediatrics" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Years of Experience *</label>
                  <input required name="experience" type="number" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Degree / Qualifications *</label>
                  <input required name="degree" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. MBBS, MD (Medicine)" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Designation</label>
                  <input name="designation" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Senior Consultant" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">You would like to see your Degree-Designation as:</label>
                  <input name="desiredTitle" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Dr. John Doe, MBBS, MD - Senior Consultant" />
                </div>
              </div>
            </section>

            {/* 3. Practice & Telemedicine */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Stethoscope size={20} className="text-teal-600" /> Practice & Telemedicine Details
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attached Hospital(s) / Clinic(s) with address and phone numbers</label>
                  <textarea name="hospitals" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="For better patient guidance..."></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-100 dark:border-teal-900/50">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-teal-900 dark:text-teal-100">Available Telemedicine Days & Timings</label>
                    <input name="telemedicineTimings" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Mon-Wed, 4 PM - 6 PM" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-teal-900 dark:text-teal-100">Telemedicine Consultation Fee (₹)</label>
                    <input name="telemedicineFee" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 400" />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Additional Info & Docs */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                <UploadCloud size={20} className="text-teal-600" /> Additional Info & Documents
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Languages Spoken</label>
                  <input name="languages" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. English, Hindi, Bengali" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Any Additional / Important Information you would like to provide:</label>
                  <textarea name="additionalInfo" rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Documents to Attach (Xerox copies to be provided to our team)</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Check the documents you have ready for our team.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Passport-size Photograph',
                      'Updated Medical Registration Certificate',
                      'Degree / Qualification Certificates (if available)',
                      'Visiting Card'
                    ].map((doc, idx) => (
                      <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                        <input type="checkbox" name="documents" value={doc} className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Declaration */}
            <section className="bg-slate-100 dark:bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Declaration</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                I hereby confirm that the information provided above is true and accurate to the best of my knowledge. I authorize Capsic Care to use these details for professional onboarding, appointment management, telemedicine services, and promotional activities related to my practice.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Doctor's Signature (Type Full Name) *</label>
                  <input required name="signature" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Your Full Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date *</label>
                  <input required name="date" type="date" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'}`}
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
            
          </form>
        </div>

      </div>
    </div>
  )
}
