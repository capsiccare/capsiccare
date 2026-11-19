'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/hooks/use-cart'
import { useState } from 'react'
import { CheckoutModal } from '@/components/checkout-modal'
import { TopBreadcrumbs, ExploreMore } from '@/components/global-navigation'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showCheckout, setShowCheckout] = useState(false)

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <div className="print:hidden">
          <Navbar onCartClick={() => setShowCheckout(true)} />
        </div>
        <main className="flex-1 w-full pt-0 md:pt-16 print:pt-0 print:m-0">
          <div className="print:hidden">
            <TopBreadcrumbs />
          </div>
          {children}
          <div className="print:hidden">
            <ExploreMore />
          </div>
        </main>
        <div className="print:hidden">
          <Footer />
        </div>
        <CheckoutModal isOpen={showCheckout} onCloseAction={() => setShowCheckout(false)} />
      </div>
    </CartProvider>
  )
}
