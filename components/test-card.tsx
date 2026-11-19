'use client'

import { Test } from '@/lib/data/types'
import { Badge } from '@/components/ui/badge'
import { Home, Plus, X, Microscope, Activity, Syringe, TestTubes, HeartPulse, Stethoscope, Droplets, Bone, Bug, Baby, Dna, Brain } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { FormattedText } from '@/components/ui/formatted-text'

const ButterflyIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20"/>
    <path d="M12 12c-3-3-6-3-8 1 2 4 5 5 8 5"/>
    <path d="M12 12c3-3 6-3 8 1-2 4-5 5-8 5"/>
    <path d="M12 12c-3-3-6-3-8-4 2-3 5-3 8-1"/>
    <path d="M12 12c3-3 6-3 8-4-2-3-5-3-8-1"/>
  </svg>
)

const getTestIcon = (testName: string, categoryName: string = '') => {
  const nameLower = (testName || '').toLowerCase();
  const catLower = (categoryName || '').toLowerCase();
  
  const getIconWrapper = (bgClass: string, icon: React.ReactNode) => (
    <div className={`p-2 rounded-lg ${bgClass} shadow-sm mr-1 shrink-0 flex items-center justify-center`}>
      {icon}
    </div>
  );

  if (nameLower.includes('thyroid') || nameLower.includes('tsh') || nameLower.includes('t3') || nameLower.includes('t4')) return getIconWrapper('bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400', <ButterflyIcon size={24} />);
  if (nameLower.includes('blood') || nameLower.includes('cbc') || nameLower.includes('hemogram') || nameLower.includes('hba1c') || nameLower.includes('sugar') || nameLower.includes('glucose') || nameLower.includes('iron') || nameLower.includes('anemia') || nameLower.includes('diabetes')) return getIconWrapper('bg-red-100 dark:bg-red-900/50', <Droplets size={24} className="text-red-500 dark:text-red-400" />);
  if (nameLower.includes('urine') || nameLower.includes('kidney') || nameLower.includes('renal') || nameLower.includes('creatinine') || nameLower.includes('urea') || nameLower.includes('kft')) return getIconWrapper('bg-amber-100 dark:bg-amber-900/50', <TestTubes size={24} className="text-amber-600 dark:text-amber-400" />);
  if (nameLower.includes('heart') || nameLower.includes('cardio') || nameLower.includes('lipid') || nameLower.includes('cholesterol') || nameLower.includes('triglycerides')) return getIconWrapper('bg-rose-100 dark:bg-rose-900/50', <HeartPulse size={24} className="text-rose-500 dark:text-rose-400" />);
  if (nameLower.includes('liver') || nameLower.includes('hepatic') || nameLower.includes('sgot') || nameLower.includes('sgpt') || nameLower.includes('bilirubin') || nameLower.includes('lft')) return getIconWrapper('bg-orange-100 dark:bg-orange-900/50', <Activity size={24} className="text-orange-500 dark:text-orange-400" />);
  if (nameLower.includes('vitamin') || nameLower.includes('mineral') || nameLower.includes('bone') || nameLower.includes('calcium') || nameLower.includes('d3') || nameLower.includes('b12')) return getIconWrapper('bg-yellow-100 dark:bg-yellow-900/50', <Bone size={24} className="text-yellow-600 dark:text-yellow-400" />);
  if (nameLower.includes('fever') || nameLower.includes('infection') || nameLower.includes('culture') || nameLower.includes('typhoid') || nameLower.includes('dengue') || nameLower.includes('malaria') || nameLower.includes('allergy')) return getIconWrapper('bg-blue-100 dark:bg-blue-900/50', <Bug size={24} className="text-blue-600 dark:text-blue-400" />);
  if (nameLower.includes('pregnancy') || nameLower.includes('hcg') || nameLower.includes('hormone') || nameLower.includes('fsh') || nameLower.includes('lh') || nameLower.includes('prolactin')) return getIconWrapper('bg-pink-100 dark:bg-pink-900/50', <Baby size={24} className="text-pink-500 dark:text-pink-400" />);
  if (nameLower.includes('genetic') || nameLower.includes('dna') || nameLower.includes('karyo')) return getIconWrapper('bg-indigo-100 dark:bg-indigo-900/50', <Dna size={24} className="text-indigo-500 dark:text-indigo-400" />);
  if (nameLower.includes('brain') || nameLower.includes('neuro')) return getIconWrapper('bg-cyan-100 dark:bg-cyan-900/50', <Brain size={24} className="text-cyan-500 dark:text-cyan-400" />);

  if (catLower.includes('diabetes') || catLower.includes('blood')) return getIconWrapper('bg-red-100 dark:bg-red-900/50', <Droplets size={24} className="text-red-500 dark:text-red-400" />);
  if (catLower.includes('heart')) return getIconWrapper('bg-rose-100 dark:bg-rose-900/50', <HeartPulse size={24} className="text-rose-500 dark:text-rose-400" />);
  if (catLower.includes('kidney') || catLower.includes('urine')) return getIconWrapper('bg-amber-100 dark:bg-amber-900/50', <TestTubes size={24} className="text-amber-600 dark:text-amber-400" />);
  if (catLower.includes('liver')) return getIconWrapper('bg-orange-100 dark:bg-orange-900/50', <Activity size={24} className="text-orange-500 dark:text-orange-400" />);
  if (catLower.includes('thyroid')) return getIconWrapper('bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400', <ButterflyIcon size={24} />);
  if (catLower.includes('fever')) return getIconWrapper('bg-blue-100 dark:bg-blue-900/50', <Stethoscope size={24} className="text-blue-600 dark:text-blue-400" />);
  
  return getIconWrapper('bg-teal-100 dark:bg-teal-900/50', <Microscope size={24} className="text-teal-600 dark:text-teal-400" />);
};

interface TestCardProps {
  test: Test
  onClick?: () => void
}

export function TestCard({ test, onClick }: TestCardProps) {
  const router = useRouter()
  const { addItem, removeItem, items } = useCart()
  if (!test) return null;
  const isItemInCart = items.some(item => item.id === test.id)
  const price = test.price || 0
  const mrp = test.mrp || price
  const savings = mrp > price ? mrp - price : 0
  const discountPercent = mrp > 0 && savings > 0 ? Math.round((savings / mrp) * 100) : 0

  return (
    <div
      onClick={(e) => {
        if (onClick) onClick();
        else {
          router.push(`/tests/${test.slug}`);
        }
      }}
      className="card-hover bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer group h-full flex flex-col hover:border-teal-400 transition-all duration-300 shadow-sm"
    >
      {/* Header */}
      <div className="relative p-3 md:p-4 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-start gap-2">
          {getTestIcon(test.name, test.category?.name || '')}
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm md:text-base line-clamp-2 flex-1 group-hover:text-teal-700 transition-colors mt-0.5">
            {test.name}
          </h3>
          {discountPercent > 0 && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] md:text-xs flex-shrink-0">
              -{discountPercent}%
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 space-y-2 md:space-y-3 flex-1 flex flex-col">
        {/* Category & Tests */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-200">
          <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200 text-xs px-2 py-0.5 font-medium rounded-full dark:bg-[#0a0e14]">
            {test.category?.name || 'Test'}
          </Badge>
          <span className="font-medium text-xs">1 Test</span>
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-200 line-clamp-2">
          <FormattedText text={test.short_description || test.full_description || ''} />
        </p>

        {/* Features List */}
        {test.parameters && test.parameters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {test.parameters.slice(0, 2).map((feature) => (
              <span
                key={feature.id}
                className="text-xs px-2 py-1 bg-teal-50 dark:bg-slate-700 text-teal-700 dark:text-teal-300 rounded"
              >
                {feature.name}
              </span>
            ))}
            {test.parameters.length > 2 && (
              <span className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded">
                +{test.parameters.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Home Collection Badge */}
        {test.home_collection_available && (
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-200 mt-2">
            <Home size={14} className="text-green-600" />
            <span>Home Collection</span>
          </div>
        )}

        {/* Pricing - Sticky to bottom */}
        <div className="pt-2 md:pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg md:text-xl font-bold text-teal-600">₹{price}</span>
            {mrp > price && (
              <span className="text-sm md:text-sm text-slate-400 line-through decoration-2 decoration-red-400/50">
                ₹{mrp}
              </span>
            )}
          </div>
          {savings > 0 && (
             <p className="text-xs md:text-sm text-green-600 font-medium m-0 pb-1">
               Save ₹{savings}
             </p>
          )}
        </div>

        {/* CTA Button - Toggle Add/Remove */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (isItemInCart) {
              removeItem(test.id)
            } else {
              addItem({
                id: test.id,
                name: test.name,
                price: price,
                mrp: mrp,
                category: test.category?.name || 'Lab Test',
                testCount: 1,
              })
            }
          }}
          className={`w-full mt-3 px-3 py-2 text-white text-xs md:text-sm font-medium rounded-lg btn-hover text-center flex items-center justify-center gap-2 transition-all duration-300 ease-out ${
            isItemInCart
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
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
