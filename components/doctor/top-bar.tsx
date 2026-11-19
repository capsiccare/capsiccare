'use client'

import React from 'react'
import { Menu, Stethoscope, Bell, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

interface TopBarProps {
  onMobileMenuClick: () => void
  doctorName?: string
  doctorSpecialty?: string
}

export function DoctorTopBar({ onMobileMenuClick, doctorName = 'Dr. Sanjoy Kumar Dey', doctorSpecialty = 'Cardiology & General Medicine' }: TopBarProps) {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {doctorName}
            </h2>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium leading-none">
              {doctorSpecialty}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Chamber 1</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] font-medium text-slate-500 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>WBMC Verified</span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}
