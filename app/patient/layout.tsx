import React from 'react'
import { PatientProvider } from '@/lib/modules/patient-portal/patient-context'
import { PatientHeader } from '@/components/patient/patient-header'
import { PatientSidebar, PatientBottomNav } from '@/components/patient/patient-nav'

export const metadata = {
  title: 'CAPSIC CARE — Patient Portal & Digital Health Records',
  description: 'Self-service patient appointment booking, digital prescriptions, lab reports, and longitudinal health records.',
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
        <PatientHeader />
        <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <PatientSidebar />
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
        <PatientBottomNav />
      </div>
    </PatientProvider>
  )
}
