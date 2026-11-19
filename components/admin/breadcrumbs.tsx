'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const routeTitles: Record<string, string> = {
  admin: 'Dashboard',
  doctors: 'Doctor Management',
  patients: 'Patient Directory',
  appointments: 'Appointments',
  diagnostics: 'Diagnostics & Orders',
  billing: 'Billing & Invoices',
  staff: 'Staff & Tasks',
  careflow: 'CareFlow CRM',
  reports: 'Reports & Analytics',
  settings: 'Settings & Access',
  audit: 'Security & Audit',
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 overflow-x-auto whitespace-nowrap py-1">
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-teal-400 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Admin</span>
      </Link>

      {segments.slice(1).map((seg, idx) => {
        const href = `/${segments.slice(0, idx + 2).join('/')}`
        const isLast = idx === segments.length - 2
        const title = routeTitles[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-200 font-medium">{title}</span>
            ) : (
              <Link href={href} className="hover:text-teal-400 transition-colors">
                {title}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
