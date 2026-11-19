'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  Stethoscope,
  Heart,
  Users,
  Building2,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { SearchBar } from '@/components/search-bar'
import { ThemeToggle } from '@/components/theme-toggle'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/lab-tests', label: 'Lab Tests' },
  { href: '/health-packages', label: 'Packages' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/partner', label: 'Partner' },
  { href: '/contact', label: 'Contact' },
]

interface NavbarProps {
  onCartClick?: () => void
}

export function Navbar({ onCartClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPortalsOpen, setIsPortalsOpen] = useState(false)
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()

  return (
    <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 ease-out md:fixed md:w-full">
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-950 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 border-b border-teal-600/30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border border-teal-400/30 shrink-0">
              Notice
            </span>
            <span className="text-slate-100">
              🚚 <strong className="text-white">Free Home Sample Collection</strong> available if total test amount is above <strong className="text-amber-300">₹2,000</strong> (in Howrah &amp; Kolkata).
            </span>
          </div>
          <div className="flex items-center gap-2 text-teal-200 text-[11px] font-semibold shrink-0">
            <span className="hidden sm:inline text-slate-300">Helpline:</span>
            <a
              href="tel:+918910260709"
              className="hover:text-white underline decoration-teal-400 underline-offset-2 transition-colors font-bold"
            >
              📞 8910260709
            </a>
            <span className="text-slate-400">|</span>
            <a
              href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20updated%20test%20prices%20and%20home%20sample%20collection."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shadow-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <nav className="glass dark:glass-dark bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl border-b border-white/30 dark:border-white/10 rounded-b-3xl md:rounded-b-3xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 font-bold text-lg md:text-xl hover:opacity-80 transition-all duration-300 ease-out shrink-0"
            >
              <Image
                src="/logo.png"
                alt="Capsic Care Logo"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg"
                priority
              />
              <span className="hidden sm:inline text-sm md:text-base text-teal-600 dark:text-teal-300 font-semibold">
                Capsic Care
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 ml-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-white/5 hover:text-teal-600 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              {/* Portals Dropdown Menu */}
              <div
                className="relative"
                onMouseEnter={() => setIsPortalsOpen(true)}
                onMouseLeave={() => setIsPortalsOpen(false)}
              >
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 hover:bg-teal-100 flex items-center gap-1 transition-all"
                >
                  <span>Portals</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {isPortalsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      href="/patient"
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold">Patient Portal</div>
                        <div className="text-[10px] text-slate-400">Reports, Rx & Appointments</div>
                      </div>
                    </Link>

                    <Link
                      href="/doctor"
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <Stethoscope className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold">Doctor Chambers</div>
                        <div className="text-[10px] text-slate-400">Clinical EMR & E-Prescriptions</div>
                      </div>
                    </Link>

                    <Link
                      href="/login?portal=staff"
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold">Staff & Billing Desk</div>
                        <div className="text-[10px] text-slate-400">POS & Reception Counter</div>
                      </div>
                    </Link>

                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold">Enterprise Admin</div>
                        <div className="text-[10px] text-slate-400">Management & MIS Analytics</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block mx-2 w-48 xl:w-60">
              <SearchBar placeholder="Search tests..." />
            </div>

            {/* CTA Buttons - Desktop */}
            <div className="hidden md:flex gap-2 items-center shrink-0">
              <ThemeToggle />

              {/* Join as Doctor Button */}
              <Link
                href="/register?role=doctor"
                className="px-3 py-1.5 rounded-xl border border-teal-500/40 text-teal-600 dark:text-teal-400 font-bold text-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all flex items-center gap-1.5"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Join as Doctor</span>
              </Link>

              {/* Login Button */}
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>

              {cartCount > 0 && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 rounded-xl border-2 border-teal-500 text-teal-600 dark:text-teal-300 font-medium text-xs hover:bg-teal-50 dark:hover:bg-teal-500/10 flex items-center gap-1.5"
                >
                  <ShoppingCart size={16} />
                  <span>{cartCount}</span>
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex gap-1 items-center">
              <ThemeToggle />
              {cartCount > 0 && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 rounded-lg text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10"
                >
                  <ShoppingCart size={18} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 text-slate-700 dark:text-slate-200"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isOpen && (
            <div className="md:hidden pb-4 space-y-3 animate-fade-in pt-2">
              <div className="mb-2">
                <SearchBar placeholder="Search tests..." />
              </div>

              {/* Portal Quick Access on Mobile */}
              <div className="p-2 rounded-2xl bg-teal-50/60 dark:bg-slate-900 border border-teal-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/patient"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2 shadow-sm"
                >
                  <Heart className="h-4 w-4" />
                  <span>Patient Portal</span>
                </Link>
                <Link
                  href="/doctor"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 shadow-sm"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Doctor EMR</span>
                </Link>
                <Link
                  href="/login?portal=staff"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  <span>Staff Desk</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Admin MIS</span>
                </Link>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-white/5 hover:text-teal-600 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 px-3 rounded-xl border border-teal-600 text-teal-600 font-bold text-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register?role=doctor"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 px-3 rounded-xl bg-teal-600 text-white font-bold text-xs"
                >
                  Join as Doctor
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navbar - Desktop only */}
      <div className="hidden md:block h-16" />
    </header>
  )
}
