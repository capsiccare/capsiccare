'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Laptop } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  variant?: 'icon' | 'dropdown' | 'pill'
}

export function ThemeToggle({ className = '', showLabel = false, variant = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 animate-pulse ${className}`}
        aria-hidden="true"
      />
    )
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-500 dark:hover:border-teal-400 text-xs font-medium transition-all shadow-2xs ${className}`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-all ${className}`}
          aria-label="Select theme"
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-teal-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          {showLabel && (
            <span className="capitalize">{theme || 'system'}</span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs">
            <button
              onClick={() => {
                setTheme('light')
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                theme === 'light' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                setTheme('dark')
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                theme === 'dark' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-teal-400" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => {
                setTheme('system')
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                theme === 'system' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>System</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // Default: Icon toggle button
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:text-teal-600 dark:hover:text-teal-300 transition-colors ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform -rotate-12 hover:rotate-0 duration-300" />
      )}
    </button>
  )
}
