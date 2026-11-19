'use client'

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
  ShieldCheck,
  Heart,
  Stethoscope,
  Building2,
  Users,
  AlertTriangle,
  Award,
  CheckCircle2,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 transition-colors duration-200">
      {/* Top Trust & Emergency Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-teal-400" />
              <span><strong>NABL</strong> Accredited Partner Labs</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span><strong>ABDM / ABHA</strong> Digital Health Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              <span><strong>DPDP Act 2023</strong> Data Privacy Protected</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-rose-400 font-bold flex items-center gap-1.5 bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-800/60">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>24x7 Ambulance: 108 / 102</span>
            </span>
            <span className="text-slate-500">|</span>
            <a
              href="tel:+918910260709"
              className="text-white font-bold hover:text-teal-400 transition-colors"
            >
              📞 8910260709
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Column 1: Brand & About */}
          <div className="sm:col-span-2 md:col-span-1.5">
            <div className="flex items-center space-x-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="Capsic Care Logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-xl"
              />
              <span className="font-black text-lg text-white tracking-tight">
                CAPSIC CARE <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated healthcare operating system and polyclinic network providing affordable doctor consultations, pathology tests, and free home sample collection in Howrah and Kolkata.
            </p>
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-teal-400">Home Sample Collection:</p>
              <p className="text-[11px] text-slate-400">
                Complimentary for lab test bookings above ₹2,000. Book online or via WhatsApp.
              </p>
            </div>
          </div>

          {/* Column 2: Digital Portals & Workspace */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-teal-400">
              Healthcare Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/patient" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-teal-400" />
                  <span>Patient Health Locker</span>
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-blue-400" />
                  <span>Doctor Chamber EMR</span>
                </Link>
              </li>
              <li>
                <Link href="/login?portal=staff" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Staff & Billing Desk</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-300" />
                  <span>Enterprise Admin MIS</span>
                </Link>
              </li>
              <li className="pt-1 border-t border-slate-800 mt-2">
                <Link href="/register?role=doctor" className="text-teal-400 font-bold hover:underline">
                  + Join as Doctor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Medical & Diagnostic Services */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-teal-400">
              Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/doctors" className="hover:text-white transition-colors">
                  OPD Doctor Consultation
                </Link>
              </li>
              <li>
                <Link href="/lab-tests" className="hover:text-white transition-colors">
                  Pathology & Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/health-packages" className="hover:text-white transition-colors">
                  Preventive Health Packages
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Home Blood Collection
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Assisted Telemedicine
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:text-white transition-colors">
                  Franchise & Partner With Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Clinic Addresses & Branches */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-teal-400">
              Clinic Hubs
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-white">Bankra Central Hub (HQ)</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Bankra Bazar, Dewan Para Road, Domjur, Howrah – 711403
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">Kolkata City Desk</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Salt Lake & Kolkata Central Collection Network
                </p>
              </div>
              <div className="pt-1">
                <p className="text-[11px] text-slate-500">
                  Daily OPD: 08:00 AM – 09:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Column 5: Contact & Help */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-teal-400">
              Contact Desk
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center space-x-2">
                <Phone size={14} className="text-teal-400 shrink-0" />
                <a href="tel:+918910260709" className="hover:text-white font-medium">
                  +91 8910260709
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-teal-400 shrink-0" />
                <a href="mailto:capsiccare@gmail.com" className="hover:text-white">
                  capsiccare@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={14} className="text-teal-400 shrink-0 mt-0.5" />
                <span>Howrah & Kolkata, West Bengal</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social, Legal & Accreditation Strip */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <span>© {new Date().getFullYear()} CAPSIC CARE Health Network. All rights reserved.</span>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Care</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-slate-300 transition-colors">Refund & Cancellation</Link>
            <span>•</span>
            <Link href="/portal/login" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">Staff &amp; Doctor Chamber</Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle variant="pill" />
            <a
              href="https://facebook.com/profile.php?id=61587413380650"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://instagram.com/capsiccare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://youtube.com/@capsiccare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={18} />
            </a>
            <a
              href="https://twitter.com/capsicCare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-teal-400 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
