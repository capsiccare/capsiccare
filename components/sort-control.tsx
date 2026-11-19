'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterOptions } from '@/hooks/use-filters'

interface SortControlProps {
  sortBy: FilterOptions['sortBy']
  onSortChange: (value: FilterOptions['sortBy']) => void
  totalResults: number
}

export function SortControl({ sortBy, onSortChange, totalResults }: SortControlProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-slate-600 dark:text-slate-200">
        Showing <span className="font-semibold">{totalResults}</span> tests
      </p>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-48 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700">
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="discount">Highest Discount</SelectItem>
          <SelectItem value="name">Name: A to Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
