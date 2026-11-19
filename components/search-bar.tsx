'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { blogArticles } from '@/lib/blog-content'

interface SearchResult {
  type: string
  id: string
  title: string
  subtitle?: string
  href: string
}

interface SearchBarProps {
  placeholder?: string
  onClose?: () => void
}

export function SearchBar({ placeholder = 'Search doctors, tests, packages...', onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const handleSearch = async (value: string) => {
    setQuery(value)

    if (!value.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <a
              key={`${result.type}-${result.id}`}
              href={result.href}
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
              onClick={() => {
                setQuery('')
                setResults([])
                setIsOpen(false)
              }}
            >
              <div className="mt-1">
                {result.type === 'doctor' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                )}
                {result.type === 'test' && (
                  <div className="w-2 h-2 rounded-full bg-teal-600" />
                )}
                {result.type === 'article' && (
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                )}
                {result.type !== 'doctor' && result.type !== 'test' && result.type !== 'article' && (
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {result.title}
                </p>
                {result.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-300 truncate">
                    {result.subtitle}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-50 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-200 text-center">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  )
}
