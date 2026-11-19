'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  FlaskConical,
  Receipt,
  UserCheck,
  Workflow,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
  status?: 'active' | 'beta' | 'planned'
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard, status: 'active' },
  { name: 'Doctor Management', href: '/admin/doctors', icon: Stethoscope, status: 'active' },
  { name: 'Patient Directory', href: '/admin/patients', icon: Users, status: 'active' },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar, status: 'active' },
  { name: 'Diagnostics & Orders', href: '/admin/diagnostics', icon: FlaskConical, badge: 'Step 05', status: 'planned' },
  { name: 'Billing & Invoices', href: '/admin/billing', icon: Receipt, badge: 'Step 06', status: 'planned' },
  { name: 'Staff & Tasks', href: '/admin/staff', icon: UserCheck, badge: 'Step 07', status: 'planned' },
  { name: 'CareFlow CRM', href: '/admin/careflow', icon: Workflow, badge: 'Step 08', status: 'planned' },
  { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3, badge: 'Step 09', status: 'planned' },
  { name: 'Security & Audit', href: '/admin/audit', icon: ShieldCheck, status: 'active' },
  { name: 'Settings & Access', href: '/admin/settings', icon: Settings, status: 'active' },
]

interface SidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function AdminSidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20">
              <Activity className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  CAPSIC CARE <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono">OS</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Healthcare Operations</span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                
                {!collapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {!collapsed && item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Footer Collapse Toggle (Desktop only) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
