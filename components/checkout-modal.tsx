'use client'

import { useRouter } from 'next/navigation'
import { X, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

interface CheckoutModalProps {
  isOpen: boolean
  onCloseAction: () => void
}

export function CheckoutModal({ isOpen, onCloseAction }: CheckoutModalProps) {
  const router = useRouter()
  const { items } = useCart()

  if (!isOpen || items.length === 0) return null

  const handleProceedToCheckout = () => {
    onCloseAction()
    router.push('/checkout')
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-0">
      <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Checkout</h2>
          <button
            onClick={onCloseAction}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-300 ease-out"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Selected Tests Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">Your Cart</h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
              {items.map((item) => {
                const itemMrp = Math.max(item.mrp || item.price, item.price);
                const itemSavings = itemMrp - item.price;
                return (
                  <div key={item.id} className="py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <div className="flex justify-between items-start text-sm md:text-base mb-1">
                      <p className="font-medium text-slate-900 dark:text-white pr-4">{item.name}</p>
                      <div className="text-right shrink-0">
                        {itemSavings > 0 && (
                          <span className="text-xs text-slate-400 line-through mr-2">₹{itemMrp}</span>
                        )}
                        <span className="font-semibold text-teal-600 dark:text-teal-300">₹{item.price}</span>
                      </div>
                    </div>
                    {itemSavings > 0 && (
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                           Save ₹{itemSavings}
                         </span>
                       </div>
                    )}
                  </div>
                )
              })}
              <div className="border-t border-slate-200 dark:border-slate-600 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Subtotal:</span>
                  <span className="line-through">₹{items.reduce((sum, item) => sum + Math.max(item.mrp || item.price, item.price), 0)}</span>
                </div>
                {items.reduce((sum, item) => sum + (Math.max(item.mrp || item.price, item.price) - item.price), 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                    <span>Discount:</span>
                    <span>-₹{items.reduce((sum, item) => sum + (Math.max(item.mrp || item.price, item.price) - item.price), 0)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                  <span className="font-bold text-slate-900 dark:text-white">Final Amount:</span>
                  <span className="font-bold text-xl text-teal-600 dark:text-teal-300">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Free Home Sample Collection Notice */}
          {totalPrice >= 2000 ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3.5 flex items-start gap-2.5">
              <span className="text-emerald-600 dark:text-emerald-400 text-lg leading-none mt-0.5">🎉</span>
              <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                <p className="font-bold">You qualify for FREE Home Sample Collection!</p>
                <p className="text-emerald-700 dark:text-emerald-300 text-xs mt-0.5">
                  Available in Howrah &amp; Kolkata for total test amounts above ₹2,000.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                  🚚 Free Home Sample Collection Notice
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                Free home sample collection is available if total test amount is above <strong className="font-bold">₹2,000</strong> (in Howrah &amp; Kolkata). Add <strong className="font-bold text-teal-700 dark:text-teal-300">₹{2000 - totalPrice}</strong> more to qualify!
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                For updated prices or information, contact <a href="tel:+918910260709" className="font-bold underline">8910260709</a> or <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-700 dark:text-emerald-400">WhatsApp</a>.
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-3.5 text-xs text-teal-800 dark:text-teal-200">
            Proceed to checkout to enter your details and confirm booking. For any queries or updated price information, call or WhatsApp <a href="tel:+918910260709" className="font-bold underline">8910260709</a>.
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={onCloseAction}
              className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 ease-out text-sm md:text-base"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleProceedToCheckout}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg active:scale-95 transition-all duration-300 ease-out flex items-center justify-center gap-2 text-sm md:text-base"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
