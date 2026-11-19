'use client'

import React, { useState } from 'react'
import { BranchProvider } from '@/lib/context/branch-context'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminTopBar } from '@/components/admin/top-bar'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <BranchProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        {/* Desktop & Mobile Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          {/* Top Bar */}
          <AdminTopBar onMobileMenuClick={() => setIsMobileOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <AdminBreadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </BranchProvider>
  )
}
