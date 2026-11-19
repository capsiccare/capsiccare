'use client'

import { useCart } from '@/hooks/use-cart'
import { Plus, X } from 'lucide-react'

interface AddToCartButtonProps {
  test: {
    id: string
    name: string
    price: number
    mrp?: number
    categoryName: string
    testCount: number // Default 1 for single tests, N for packages
    type: 'test' | 'package'
  }
}

export function AddToCartButton({ test }: AddToCartButtonProps) {
  const { addItem, removeItem, items } = useCart()
  const isItemInCart = items.some(item => item.id === test.id)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        if (isItemInCart) {
          removeItem(test.id)
        } else {
          addItem({
            id: test.id,
            name: test.name,
            price: test.price,
            mrp: test.mrp,
            category: test.categoryName,
            testCount: test.testCount,
          })
        }
      }}
      className={`w-full font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
        isItemInCart
          ? 'bg-rose-500 hover:bg-rose-600 text-white'
          : 'bg-teal-600 hover:bg-teal-700 text-white'
      }`}
    >
      {isItemInCart ? (
        <>
          <X size={20} /> Remove from Cart
        </>
      ) : (
        <>
          <Plus size={20} /> Add to Cart
        </>
      )}
    </button>
  )
}
