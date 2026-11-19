'use client'

import React, { useState, useEffect } from 'react'
import { Phone } from 'lucide-react'

// WhatsApp Icon SVG
const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M17.472 14.382c-.301-.15-1.781-.878-2.057-.978-.277-.1-.478-.15-.678.15-.2.299-.775.978-.95 1.178-.175.199-.35.225-.65.075-.301-.15-1.267-.467-2.413-1.485-.892-.795-1.494-1.777-1.67-2.078-.175-.3-.02-.462.13-.61.135-.133.301-.35.451-.524.15-.174.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.678-1.631-.929-2.238-.244-.593-.492-.511-.678-.521-.174-.01-.373-.012-.573-.012-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.899 1.225 3.1.15.2 2.112 3.226 5.118 4.524.714.309 1.272.494 1.706.633.717.228 1.369.196 1.884.119.574-.086 1.781-.727 2.031-1.428.25-.701.25-1.301.175-1.428-.075-.127-.275-.203-.576-.353zM12 21.93c-1.725 0-3.419-.451-4.904-1.306l-.352-.204-3.647.956.973-3.558-.224-.356A8.917 8.917 0 013.111 12c0-4.93 4.02-8.948 8.95-8.948 4.929 0 8.949 4.019 8.949 8.948 0 4.93-4.02 8.949-8.95 8.949zm0-19.664C6.649 2.266 2.266 6.649 2.266 12c0 1.848.513 3.651 1.485 5.216L2.4 22.316l5.226-1.371A9.702 9.702 0 0012 21.734c5.351 0 9.734-4.383 9.734-9.734C21.734 6.649 17.351 2.266 12 2.266z" />
  </svg>
)

export function FloatingButtons() {
  const [showText, setShowText] = useState(false)
  
  const whatsappUrl = 'https://wa.me/918910260709?text=Hi, I want to upload my prescription for lab tests.'
  const callUrl = 'tel:+918910260709'

  useEffect(() => {
    const interval = setInterval(() => {
      setShowText((prev) => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 items-end sm:bottom-8 sm:right-8">
      {/* Call Button - Now on TOP */}
      <a
        href={callUrl}
        className="group flex items-center gap-3"
      >
        <span className="hidden sm:block overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500 ease-in-out">
          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-white/10 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-lg whitespace-nowrap">
            Call Now
          </span>
        </span>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-2xl active:scale-95">
          <Phone size={24} />
          {/* Subtle pulse for the call button */}
          <span className="absolute inset-0 rounded-full bg-teal-600 animate-ping opacity-10 pointer-events-none"></span>
        </div>
      </a>

      {/* Upload Prescription (WhatsApp) - Now on BOTTOM with dynamic animation */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <div 
          className={`relative flex h-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl active:scale-95 overflow-hidden ${
            showText ? 'w-[220px] px-5' : 'w-14 px-0'
          }`}
        >
          {/* Inner container for centering/aligning */}
          <div className="flex items-center justify-center w-full min-w-max px-2">
             {/* Icon wrapping for ultra-precise centering */}
            <div className={`flex items-center justify-center transition-all duration-500 ${showText ? 'mr-3' : 'mr-0'}`}>
              <WhatsAppIcon 
                size={26} 
                className={`transition-transform duration-500 ${!showText ? '-translate-x-[0.5px] -translate-y-[0.5px]' : ''}`} 
              />
            </div>
            
            {/* Text that spans out */}
            <span className={`text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-500 origin-left ${
              showText ? 'opacity-100 max-w-[180px] scale-100' : 'opacity-0 max-w-0 scale-0'
            }`}>
              Upload Prescription
            </span>
          </div>
          
          {/* Continuous pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping-slow opacity-20 pointer-events-none"></span>
        </div>
      </a>

      <style jsx global>{`
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}
