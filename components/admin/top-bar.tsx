'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBranch } from '@/lib/context/branch-context'
import {
  Menu,
  Search,
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Check,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

interface TopBarProps {
  onMobileMenuClick: () => void
}

export function AdminTopBar({ onMobileMenuClick }: TopBarProps) {
  const router = useRouter()
  const { selectedBranchId, setSelectedBranchId, branches, activeBranch } = useBranch()

  const [userProfile, setUserProfile] = useState<{
    fullName: string
    email: string
    role: string
  } | null>(null)
  
  const [showBranchMenu, setShowBranchMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/v1/me')
        const json = await res.json()
        if (json.success && json.data) {
          const u = json.data
          const primaryRole = u.roles?.[0]?.role || 'Staff'
          setUserProfile({
            fullName: u.fullName || 'Operational User',
            email: u.email || '',
            role: primaryRole.replace('_', ' ').toUpperCase(),
          })
        }
      } catch (err) {
        console.error('Failed to load active user profile:', err)
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Failed to sign out:', err)
      router.push('/login')
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Branch Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Branch Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBranchMenu(!showBranchMenu)
              setShowUserMenu(false)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 text-xs text-slate-200 transition-all font-medium"
          >
            <Building2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {selectedBranchId === 'all'
                ? 'All Branches (Enterprise)'
                : activeBranch?.name || 'Select Branch'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Operating Branch Context
              </div>
              <button
                onClick={() => {
                  setSelectedBranchId('all')
                  setShowBranchMenu(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  selectedBranchId === 'all'
                    ? 'bg-teal-500/10 text-teal-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>All Branches (Global View)</span>
                {selectedBranchId === 'all' && <Check className="h-3.5 w-3.5" />}
              </button>

              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBranchId(b.id)
                    setShowBranchMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                    selectedBranchId === b.id
                      ? 'bg-teal-500/10 text-teal-400 font-medium'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  {selectedBranchId === b.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                const q = searchQuery.trim()
                if (q.toUpperCase().startsWith('DOC') || q.toLowerCase().includes('dr.')) {
                  router.push(`/admin/doctors?q=${encodeURIComponent(q)}`)
                } else {
                  router.push(`/admin/patients?q=${encodeURIComponent(q)}`)
                }
              }
            }}
            placeholder="Search patients by UHID/phone, doctors (Press Enter)..."
            className="w-full pl-9 pr-12 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
          <kbd className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] font-mono text-slate-500 pointer-events-none">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right: Notifications & User Profile Menu */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle className="bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
              setShowBranchMenu(false)
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-400 ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-1.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Operational Alerts</span>
                <span className="text-[10px] text-teal-400 font-mono">Live</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-medium text-slate-200">System Activated</div>
                  <div className="text-[11px] text-slate-400">Database connected to Howrah Bankra Central Hub.</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-medium text-slate-200">Doctor Chamber Active</div>
                  <div className="text-[11px] text-slate-400">Dr. Sanjoy Kumar Dey OPD scheduled for today.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
              setShowBranchMenu(false)
            }}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-800 transition-all text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-teal-300 font-semibold text-xs flex items-center justify-center">
              {userProfile?.fullName
                ? userProfile.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                : 'CC'}
            </div>
            <div className="hidden sm:flex flex-col truncate">
              <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                {userProfile?.fullName || 'Active Staff'}
              </span>
              <span className="text-[10px] text-teal-400 font-mono">
                {userProfile?.role || 'SUPER ADMIN'}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-medium text-white truncate">
                  {userProfile?.fullName || 'Clinical Staff'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {userProfile?.email || 'staff@capsic.in'}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    router.push('/admin/settings')
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>Security & Access</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
