'use client'

import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import Image from 'next/image'

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Encode the message and redirect to WhatsApp
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/918910260709?text=${encodedMessage}`
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank')
    setMessage('')
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[320px] sm:w-[360px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#075E54] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                <Image src="/logo.png" alt="Capsic Care" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Capsic Care Support</h3>
                <p className="text-white/80 text-xs">Typically replies instantly</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="bg-[#E5DDD5] dark:bg-slate-800 h-[240px] p-4 overflow-y-auto" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde539c58cca6745483d4858c52.png")', opacity: 0.9 }}>
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-sm mb-2">
              <p>Hello! 👋</p>
            </div>
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-sm">
              <p>Welcome to Capsic Care. How can we help you today? Would you like to book an appointment or inquire about our services?</p>
              <p className="text-[10px] text-slate-400 mt-1 text-right">Just now</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all dark:text-white"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!message.trim()}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shrink-0 ${message.trim() ? 'bg-[#128C7E] text-white hover:bg-[#075E54] shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
          
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 relative z-50 group"
        aria-label="Chat with us on WhatsApp"
      >
        {isOpen ? (
          <X size={28} className="animate-in spin-in-90" />
        ) : (
          <MessageCircle size={28} className="group-hover:animate-pulse" />
        )}
        
        {/* Notification Badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>
      
    </div>
  )
}
