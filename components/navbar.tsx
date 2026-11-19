'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { SearchBar } from '@/components/search-bar'

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
            <span className="hidden sm:inline text-slate-300">For updated price or info:</span>
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
      <nav className="glass dark:glass-dark bg-white/90 dark:bg-slate-950/50 backdrop-blur-xl border-b border-white/30 dark:border-white/10 rounded-b-3xl md:rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 font-bold text-lg md:text-xl hover:opacity-80 transition-all duration-300 ease-out"
            >
              <Image
                src="/logo.png"
                alt="Capsic Care Logo"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg"
                priority
              />
              <span className="hidden sm:inline text-sm md:text-base text-teal-600 dark:text-teal-300 font-semibold">Capsic Care</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 ml-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-white/5 hover:text-teal-600 transition-all duration-300 ease-out"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block mx-2 lg:mx-4 w-full lg:w-64">
              <SearchBar placeholder="Search tests..." />
            </div>

            {/* Search Bar - Mobile */}
            <div className="flex-1 lg:hidden mx-2">
              <SearchBar placeholder="Search tests..." />
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden md:flex gap-2 items-center">
              {cartCount > 0 && (
                <button
                  onClick={onCartClick}
                  className="relative btn-hover px-4 py-2 rounded-lg border-2 border-teal-500 text-teal-600 dark:text-teal-300 font-medium text-sm hover:bg-teal-50 dark:hover:bg-teal-500/10 flex items-center gap-2"
                >
                  <ShoppingCart size={18} />
                  <span>{cartCount}</span>
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex gap-1 items-center">
              {/* Mobile Cart Button */}
              {cartCount > 0 && (
                <button
                  onClick={onCartClick}
                  className="relative btn-hover p-2 rounded-lg text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10"
                >
                  <ShoppingCart size={20} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 ease-out text-slate-700 dark:text-slate-200"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4 space-y-3 animate-fade-in">

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-white/5 hover:text-teal-600 transition-all duration-300 ease-out"
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-3 py-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <a
                  href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20want%20to%20book%20a%20service."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium text-sm hover:shadow-lg transition-all duration-300 ease-out"
                >
                  Book Now
                </a>
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
