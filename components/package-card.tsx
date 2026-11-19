'use client'

import { Package } from '@/lib/data/types'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Check, Plus, X, Accessibility, HeartPulse, Stethoscope, BriefcaseMedical, Droplets, TestTubes, Activity, Bone, Bug, Baby, Dna, Brain, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ButterflyIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20"/>
    <path d="M12 12c-3-3-6-3-8 1 2 4 5 5 8 5"/>
    <path d="M12 12c3-3 6-3 8 1-2 4-5 5-8 5"/>
    <path d="M12 12c-3-3-6-3-8-4 2-3 5-3 8-1"/>
    <path d="M12 12c3-3 6-3 8-4-2-3-5-3-8-1"/>
  </svg>
)

const getPackageIcon = (packageName: string) => {
  const lower = (packageName || '').toLowerCase();
  
  const getIconWrapper = (bgClass: string, icon: React.ReactNode) => (
    <div className={`p-2 rounded-lg ${bgClass} shadow-sm group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
      {icon}
    </div>
  );

  if (lower.includes('thyroid') || lower.includes('tsh')) return getIconWrapper('bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400', <ButterflyIcon size={24} />);
  if (lower.includes('diabetes') || lower.includes('sugar') || lower.includes('blood') || lower.includes('anemia')) return getIconWrapper('bg-red-100 dark:bg-red-900/50', <Droplets size={24} className="text-red-500 dark:text-red-400" />);
  if (lower.includes('heart') || lower.includes('cardio') || lower.includes('lipid')) return getIconWrapper('bg-rose-100 dark:bg-rose-900/50', <HeartPulse size={24} className="text-rose-500 dark:text-rose-400" />);
  if (lower.includes('urine') || lower.includes('kidney') || lower.includes('renal')) return getIconWrapper('bg-amber-100 dark:bg-amber-900/50', <TestTubes size={24} className="text-amber-600 dark:text-amber-400" />);
  if (lower.includes('liver') || lower.includes('hepatic')) return getIconWrapper('bg-orange-100 dark:bg-orange-900/50', <Activity size={24} className="text-orange-500 dark:text-orange-400" />);
  if (lower.includes('vitamin') || lower.includes('mineral') || lower.includes('bone') || lower.includes('calcium')) return getIconWrapper('bg-yellow-100 dark:bg-yellow-900/50', <Bone size={24} className="text-yellow-600 dark:text-yellow-400" />);
  if (lower.includes('fever') || lower.includes('infection') || lower.includes('allergy')) return getIconWrapper('bg-blue-100 dark:bg-blue-900/50', <Bug size={24} className="text-blue-600 dark:text-blue-400" />);
  if (lower.includes('pregnancy') || lower.includes('women') || lower.includes('pcos')) return getIconWrapper('bg-pink-100 dark:bg-pink-900/50', <Baby size={24} className="text-pink-500 dark:text-pink-400" />);
  if (lower.includes('genetic') || lower.includes('dna')) return getIconWrapper('bg-indigo-100 dark:bg-indigo-900/50', <Dna size={24} className="text-indigo-500 dark:text-indigo-400" />);
  if (lower.includes('brain') || lower.includes('neuro')) return getIconWrapper('bg-cyan-100 dark:bg-cyan-900/50', <Brain size={24} className="text-cyan-500 dark:text-cyan-400" />);
  if (lower.includes('full') || lower.includes('comprehensive') || lower.includes('master') || lower.includes('whole')) return getIconWrapper('bg-teal-100 dark:bg-teal-900/50', <Accessibility size={24} className="text-teal-600 dark:text-teal-400" />);

  return getIconWrapper('bg-teal-100 dark:bg-teal-900/50', <BriefcaseMedical size={24} className="text-teal-600 dark:text-teal-400" />);
};

interface PackageCardProps {
  pkg: Package
  featured?: boolean
}

export function PackageCard({ pkg, featured }: PackageCardProps) {
  const router = useRouter()
  const { addItem, removeItem, items } = useCart()
  if (!pkg) return null;
  const isItemInCart = items.some(item => item.id === pkg.id)
  const mrp = pkg.discount_price ? Math.max(pkg.price, pkg.discount_price) : pkg.price;
  const salePrice = pkg.discount_price ? Math.min(pkg.price, pkg.discount_price) : pkg.price;
  const savings = mrp > salePrice ? mrp - salePrice : 0;
  const discountPercent = mrp > 0 && savings > 0 ? Math.round((savings / mrp) * 100) : 0;
  const posterUrl = `/images/packages/${pkg.slug}.jpg`

  return (
    <div
      onClick={(e) => {
        router.push(`/packages/${pkg.slug}`);
      }}
      className={`card-hover rounded-3xl border overflow-hidden transition-all duration-300 ease-out h-full flex flex-col cursor-pointer group ${
        featured
          ? 'border-teal-500 bg-gradient-to-br from-teal-50/30 to-white dark:from-slate-800 dark:to-slate-700 ring-1 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900 md:scale-[1.02] shadow-md hover:shadow-xl'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 shadow-sm hover:shadow-xl'
      }`}
    >
      {/* Poster Image Header */}
      <div className="relative aspect-[859/1024] w-full bg-slate-950 overflow-hidden shrink-0">
        <Image
          src={posterUrl}
          alt={pkg.name}
          fill
          className="object-contain sm:object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-full shadow-md">
            {discountPercent}% OFF
          </div>
        )}
        {featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-teal-500 text-white font-bold text-xs rounded-full shadow-md">
            ⭐ MOST POPULAR
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold pointer-events-none">
          <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md">
            {pkg.tests_included_count} Vital Tests
          </span>
          <span className="px-2 py-0.5 bg-teal-600/90 backdrop-blur-md rounded-md">
            24h Reports
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-3 md:space-y-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 group-hover:text-teal-700 transition-colors">
              {getPackageIcon(pkg.name)}
              {pkg.name}
            </h3>
            {discountPercent > 0 && (
              <Badge className="bg-orange-500 text-white text-xs flex-shrink-0">
                -{discountPercent}%
              </Badge>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-200">
            {pkg.description}
          </p>
        </div>

        {/* Test Count */}
        <div className="flex items-center justify-between text-xs md:text-sm gap-2">
          <span className="text-slate-600 dark:text-slate-200">
            {pkg.tests_included_count} Tests
          </span>
          <Badge variant="outline" className="text-teal-600 border-teal-200 text-xs">
            Health Package
          </Badge>
        </div>

        {/* Pricing */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 md:p-4 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-teal-600">₹{salePrice}</span>
            {mrp > salePrice && (
              <span className="text-sm md:text-lg text-slate-400 line-through decoration-2 decoration-red-400/50">
                ₹{mrp}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs md:text-sm text-green-600 font-medium">
              Save ₹{savings}
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-2 md:space-y-3 flex-1">
          <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
            Includes:
          </p>
          <ul className="space-y-1 md:space-y-2">
            {pkg.tests && pkg.tests.slice(0, 3).map((test, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs md:text-sm text-slate-700 dark:text-slate-200"
              >
                <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>{test.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button - Toggle Add/Remove */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (isItemInCart) {
              removeItem(pkg.id)
            } else {
              addItem({
                id: pkg.id,
                name: pkg.name,
                price: salePrice,
                mrp: mrp,
                category: 'Health Package',
                testCount: pkg.tests_included_count,
              })
            }
          }}
          className={`w-full px-4 py-2 md:py-3 rounded-lg font-medium text-center btn-hover flex items-center justify-center gap-2 transition-all duration-300 ease-out text-sm md:text-base ${
            isItemInCart
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:from-red-600 hover:to-red-700'
              : featured
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-xl hover:from-teal-600 hover:to-teal-700'
              : 'border-2 border-teal-500 text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10'
          }`}
        >
          {isItemInCart ? (
            <>
              <X size={16} />
              Remove from Cart
            </>
          ) : (
            <>
              <Plus size={16} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}
