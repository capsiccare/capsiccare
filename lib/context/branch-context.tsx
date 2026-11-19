'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface BranchInfo {
  id: string
  code: string
  name: string
  city: string
  isHeadquarters: boolean
}

interface BranchContextType {
  selectedBranchId: string
  setSelectedBranchId: (id: string) => void
  branches: BranchInfo[]
  activeBranch: BranchInfo | null
  isLoading: boolean
  refreshBranches: () => Promise<void>
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  const loadBranches = async () => {
    try {
      const res = await fetch('/api/v1/branches')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setBranches(json.data)
      }
    } catch (err) {
      console.error('Failed to load branches in context:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBranches()
  }, [])

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || null

  return (
    <BranchContext.Provider
      value={{
        selectedBranchId,
        setSelectedBranchId,
        branches,
        activeBranch,
        isLoading,
        refreshBranches: loadBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider')
  }
  return context
}
