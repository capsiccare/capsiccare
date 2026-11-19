'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  FileText,
  Pill,
  Activity,
  FlaskConical,
  Truck,
  CreditCard,
  Clock,
  Users,
  HelpCircle,
  MessageSquareHeart,
  Settings,
  FolderOpen,
} from 'lucide-react'
import { usePatient } from '@/lib/modules/patient-portal/patient-context'

export function PatientSidebar() {
  const pathname = usePathname()
  const { t } = usePatient()

  const navItems = [
    { label: t.nav.dashboard, href: '/patient', icon: LayoutDashboard },
    { label: t.nav.appointments, href: '/patient/appointments', icon: Calendar },
    { label: t.nav.doctors, href: '/patient/doctors', icon: Stethoscope },
    { label: t.nav.prescriptions, href: '/patient/prescriptions', icon: FileText },
    { label: t.nav.medications, href: '/patient/medications', icon: Pill },
    { label: t.nav.records, href: '/patient/health-records', icon: Activity },
    { label: t.nav.diagnostics, href: '/patient/diagnostics', icon: FlaskConical },
    { label: t.nav.reports, href: '/patient/diagnostics/reports', icon: FolderOpen },
    { label: t.nav.homeCollection, href: '/patient/home-collection', icon: Truck },
    { label: t.nav.billing, href: '/patient/billing', icon: CreditCard },
    { label: t.nav.followUps, href: '/patient/follow-ups', icon: Clock },
    { label: t.nav.family, href: '/patient/family', icon: Users },
    { label: t.nav.support, href: '/patient/support', icon: HelpCircle },
    { label: t.nav.feedback, href: '/patient/feedback', icon: MessageSquareHeart },
    { label: t.nav.settings, href: '/patient/settings', icon: Settings },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 space-y-1 shrink-0 overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16">
      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
        Patient Care Menu
      </div>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/patient'
            ? pathname === '/patient'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-teal-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </aside>
  )
}

export function PatientBottomNav() {
  const pathname = usePathname()
  const { t } = usePatient()

  const quickNav = [
    { label: t.nav.dashboard, href: '/patient', icon: LayoutDashboard },
    { label: t.nav.appointments, href: '/patient/appointments', icon: Calendar },
    { label: t.nav.prescriptions, href: '/patient/prescriptions', icon: FileText },
    { label: t.nav.diagnostics, href: '/patient/diagnostics', icon: FlaskConical },
    { label: t.nav.records, href: '/patient/health-records', icon: Activity },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-around">
      {quickNav.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/patient'
            ? pathname === '/patient'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="truncate max-w-[64px]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
