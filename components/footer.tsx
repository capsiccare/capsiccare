import Link from 'next/link'
import Image from 'next/image'
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 mt-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Capsic Care Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-bold text-base md:text-lg text-slate-900 dark:text-white">Capsic Care</span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Affordable healthcare diagnostics with Free Home Sample Collection on total test amount above ₹2,000 in Howrah &amp; Kolkata.
            </p>
            <div className="mt-3 p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-teal-600 dark:text-teal-300">Updated Price &amp; Info Helpline:</p>
              <p>Contact: <a href="tel:+918910260709" className="text-teal-700 dark:text-white hover:underline font-bold">8910260709</a> or <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20have%20an%20inquiry%20regarding%20updated%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">WhatsApp</a></p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link
                  href="/services"
                  className="hover:text-teal-400 transition-all duration-300 ease-out"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/doctors"
                  className="hover:text-teal-400 transition-all duration-300 ease-out"
                >
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="/health-camps" className="hover:text-teal-400 transition-all duration-300 ease-out">
                  Health Camps
                </Link>
              </li>
              <li>
                <Link
                  href="/business-opportunity"
                  className="text-teal-400 font-semibold hover:text-teal-300 transition-all duration-300 ease-out flex items-center gap-1"
                >
                  Business Opportunity
                </Link>
              </li>
              <li>
                <Link
                  href="/business-opportunity"
                  className="hover:text-teal-400 transition-all duration-300 ease-out"
                >
                  Become a Franchise Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/partner"
                  className="hover:text-teal-400 transition-all duration-300 ease-out"
                >
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-teal-400 transition-all duration-300 ease-out"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/sktaslimuddin"
                  className="hover:text-teal-400 transition-all duration-300 ease-out"
                >
                  Founder & CEO
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm md:text-base">Services</h4>
            <ul className="space-y-2 text-xs md:text-sm">
              <li>
                <Link href="/services" className="hover:text-teal-400 transition-all duration-300 ease-out">
                  Doctor Consultation
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-teal-400 transition-all duration-300 ease-out">
                  Assisted Telemedicine
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-teal-400 transition-all duration-300 ease-out">
                  Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/invoice" className="hover:text-teal-400 transition-all duration-300 ease-out">
                  Cash Memo / Bill Generator
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-teal-400 transition-all duration-300 ease-out">
                  Health Packages
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-teal-400 transition-all duration-300 ease-out">
                  Preventive Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm md:text-base">Clinic Address</h4>
            <div className="space-y-2 text-xs md:text-sm text-slate-400">
              <p className="font-medium text-slate-300">Capsic Care Centre</p>
              <p>Bankra Bazar</p>
              <p>Dewan Para Road</p>
              <p>Domjur</p>
              <p>Howrah – 711403</p>
            </div>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold text-white mb-3 text-sm md:text-base">Contact Us</h4>
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex items-start space-x-2">
                <Mail size={16} className="mt-0.5 flex-shrink-0 text-teal-400" />
                <a
                  href="mailto:capsiccare@gmail.com"
                  className="hover:text-teal-400 transition-all duration-300 ease-out break-all"
                >
                  capsiccare@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-teal-400" />
                <a
                  href="tel:+918910260709"
                  className="hover:text-teal-400 transition-all duration-300 ease-out"
                >
                  +91 8910260709
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-teal-400" />
                <span>Kolkata, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-xs md:text-sm text-slate-400">
                © 2024 Capsic Care. All rights reserved.
              </p>
              <ThemeToggle variant="pill" />
            </div>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/profile.php?id=61587413380650"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-teal-400 transition-all duration-300 ease-out"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com/capsiccare"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-teal-400 transition-all duration-300 ease-out"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://youtube.com/@capsiccare"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-teal-400 transition-all duration-300 ease-out"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://twitter.com/capsicCare"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-teal-400 transition-all duration-300 ease-out"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
