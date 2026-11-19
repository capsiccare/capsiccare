'use client'

import React, { useState } from 'react'
import {
  MessageSquareHeart,
  Star,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export default function PatientFeedbackPage() {
  const { activePatientId, t } = usePatient()
  const [rating, setRating] = useState(5)
  const [waitRating, setWaitRating] = useState(4)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePatientId) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/v1/patient/feedback?patientId=${activePatientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          facility_rating: waitRating,
          comments,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquareHeart className="h-6 w-6 text-teal-600" />
          Patient Experience & Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your feedback directly drives continuous clinical improvement and quality of care at CAPSIC CARE.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
            Thank You for Your Feedback!
          </h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            Your review has been securely logged with our Clinical Governance and Patient Experience committee.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setComments('')
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
          >
            Submit Another Feedback
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5"
        >
          {/* Doctor / Overall Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Overall Clinical Consultation Experience (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Facility / Wait Time Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Chamber Cleanliness, Staff Courtesy & Wait Times
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setWaitRating(star)}
                  className="p-1 text-teal-500 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= waitRating ? 'fill-teal-500 text-teal-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                {waitRating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Comments & Suggestions
            </label>
            <textarea
              required
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="What did our doctors or staff do exceptionally well? How can we make your next visit even better?"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <button
            disabled={submitting}
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? 'Submitting...' : 'Submit Patient Feedback'}
          </button>
        </form>
      )}
    </div>
  )
}
