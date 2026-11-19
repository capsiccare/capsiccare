import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { 
  Clock, 
  Droplets, 
  Info, 
  MapPin, 
  CheckCircle2, 
  FlaskConical, 
  ShieldCheck, 
  Award, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  BadgeCheck, 
  Phone, 
  Activity, 
  HeartHandshake, 
  UserCheck, 
  Coins 
} from 'lucide-react'
import Link from 'next/link'
import { getDiagnosticData } from '@/lib/data/data-service'
import { TestCard } from '@/components/test-card'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { FormattedText } from '@/components/ui/formatted-text'
import { getTestClinicalInfo } from '@/lib/test-seo-content'
import { ServiceArea } from '@/lib/data/types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const data = getDiagnosticData()
  const resolvedParams = await params
  const slug = resolvedParams.slug

  // 1. Is it a Category?
  const category = data.categories.find(c => c.slug === slug)
  if (category) {
    const title = `${category.name} Tests in Bankra & Howrah (Affordable Rates) | Capsic Care`
    const description = `Browse all affordable ${category.name} diagnostic lab tests with free doorstep home sample collection in Bankra, Bankra Bazar, Kona, Makardah, Domjur, Santragachi & Howrah. NABL certified quality & 24h reports on WhatsApp. Call/WhatsApp +91 8910260709.`
    return {
      title,
      description,
      keywords: [
        `${category.name} tests in Bankra`,
        `Affordable ${category.name} test Howrah`,
        `Blood test near Bankra`,
        `Home sample collection Bankra`,
        `Low cost diagnostic centre Bankra`,
        `${category.name} pathology lab Domjur`,
        `Diagnostic test Kona`,
        `Blood test Makardah`,
        `Blood test Santragachi`
      ],
      alternates: {
        canonical: `https://capsic.in/tests/${slug}`
      },
      openGraph: {
        title,
        description,
        url: `https://capsic.in/tests/${slug}`,
        siteName: 'Capsic Care Diagnostics',
        images: ['/logo.png'],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/logo.png']
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large'
        }
      }
    }
  }

  // 2. Is it an Area Test?
  let matchedTest = data.tests.find(t => t.slug === slug)
  let matchedArea: ServiceArea | null = null

  if (!matchedTest) {
    const parts = slug.split('-in-')
    if (parts.length === 2) {
      matchedTest = data.tests.find(t => t.slug === parts[0])
      matchedArea = data.serviceAreas.find(a => a.slug === parts[1]) || null
    }
  }

  if (matchedTest) {
    const clinicalInfo = getTestClinicalInfo(matchedTest, matchedArea)
    return {
      title: clinicalInfo.seoTitle,
      description: clinicalInfo.seoDescription,
      keywords: clinicalInfo.seoKeywords,
      alternates: {
        canonical: `https://capsic.in/tests/${slug}`
      },
      openGraph: {
        title: clinicalInfo.seoTitle,
        description: clinicalInfo.seoDescription,
        url: `https://capsic.in/tests/${slug}`,
        siteName: 'Capsic Care Diagnostics',
        images: ['/logo.png'],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: clinicalInfo.seoTitle,
        description: clinicalInfo.seoDescription,
        images: ['/logo.png']
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        }
      }
    }
  }

  return { title: 'Test Not Found | Capsic Care' }
}

export async function generateStaticParams() {
  const data = getDiagnosticData()
  const paths: { slug: string }[] = []

  // Add all category slugs
  data.categories.forEach(c => {
    paths.push({ slug: c.slug })
  })

  // Add all base test slugs and their location permutations
  data.tests.forEach(t => {  
    paths.push({ slug: t.slug })
    if (t.service_areas && t.service_areas.length > 0) {
      t.service_areas.forEach(area => {
        paths.push({ slug: `${t.slug}-in-${area.slug}` })
      })
    }
  })

  return paths
}

export default async function DynamicTestsRoute({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const data = getDiagnosticData()
  const resolvedParams = await params
  const slug = resolvedParams.slug

  // 1. Is it a Category?
  const category = data.categories.find(c => c.slug === slug)
  if (category) {
    const categoryTests = data.tests.filter(t => t.category_id === category.id)
    const categoryJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `https://capsic.in/tests/${category.slug}`,
          url: `https://capsic.in/tests/${category.slug}`,
          name: `${category.name} Tests in Bankra | Capsic Care Diagnostics`,
          description: `Affordable diagnostic ${category.name} lab tests with free doorstep home sample collection across Bankra, Kona, Domjur, Makardah, Santragachi, and Howrah.`,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: categoryTests.slice(0, 30).map((t, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: t.name,
              url: `https://capsic.in/tests/${t.slug}`
            }))
          }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://capsic.in'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Lab Tests',
              item: 'https://capsic.in/lab-tests'
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: category.name,
              item: `https://capsic.in/tests/${category.slug}`
            }
          ]
        },
        {
          '@type': 'MedicalBusiness',
          name: 'Capsic Care Diagnostics & Healthcare',
          url: 'https://capsic.in',
          telephone: '+918910260709',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Bankra Bazar, Dewan Para Road',
            addressLocality: 'Domjur, Howrah',
            postalCode: '711403',
            addressRegion: 'West Bengal',
            addressCountry: 'IN'
          }
        }
      ]
    }

    return (
      <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
        />
        <section className="pt-32 pb-16 bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 text-white border-b border-teal-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              <FlaskConical size={14} /> Diagnostic Category
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Affordable {category.name} Tests in Bankra
            </h1>
            <p className="text-base sm:text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
              {category.description || `Browse our comprehensive collection of ${category.name} lab tests with transparent low-cost pricing and free home sample collection in Bankra, Kona, Makardah, Domjur, Santragachi, and surrounding Howrah regions.`}
            </p>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTests.length > 0 ? (
              categoryTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))
            ) : (
              <p className="col-span-full text-center text-slate-500 py-10">No tests found for this category.</p>
            )}
          </div>
        </section>
      </div>
    )
  }

  // 2. Is it a Test / Hyperlocal Test?
  let matchedTest = data.tests.find(t => t.slug === slug)
  let matchedArea: ServiceArea | null = null

  if (!matchedTest) {
    const parts = slug.split('-in-')
    if (parts.length === 2) {
      matchedTest = data.tests.find(t => t.slug === parts[0])
      matchedArea = data.serviceAreas.find(a => a.slug === parts[1]) || null
    }
  }

  if (matchedTest) {
    const clinicalInfo = getTestClinicalInfo(matchedTest, matchedArea)
    const mrp = matchedTest.mrp && matchedTest.mrp > matchedTest.price ? matchedTest.mrp : Math.round(matchedTest.price * 1.5)
    const price = matchedTest.price
    const savings = Math.max(0, mrp - price)
    const discountPercent = mrp > 0 ? Math.round((savings / mrp) * 100) : 0
    const primaryLocation = matchedArea ? matchedArea.name : 'Bankra'

    const whatsappMsg = `Hello Capsic Care, I would like to book the *${matchedTest.name}* (Offer Price: ₹${price}) with Free Home Collection in ${primaryLocation}.`

    return (
      <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
        {/* Inject JSON-LD Structured Data Schema for Local SEO & Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicalInfo.jsonLd) }}
        />

        {/* Hero Section */}
        <section className="relative pt-28 pb-16 overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 text-white border-b border-teal-800/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.18),transparent_50%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
              <Link href="/" className="text-teal-300 hover:text-white transition-colors">Home</Link>
              <span className="text-slate-500">/</span>
              <Link href="/lab-tests" className="text-teal-300 hover:text-white transition-colors">Lab Tests</Link>
              <span className="text-slate-500">/</span>
              <Link href={`/tests/${matchedTest.category.slug}`} className="text-teal-300 hover:text-white transition-colors">{matchedTest.category.name}</Link>
              <span className="text-slate-500">/</span>
              <span className="text-slate-300 font-bold truncate">{matchedTest.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Title, Primary Positioning, Specs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-500/30">
                    <Sparkles size={14} className="text-teal-400" /> Affordable Diagnostic Care • Bankra & Nearby
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                    {matchedTest.name}
                    {matchedArea && <span className="text-teal-400 font-normal block sm:inline"> in {matchedArea.name}</span>}
                  </h1>
                  
                  <p className="text-base sm:text-lg text-teal-100 font-medium leading-relaxed">
                    {clinicalInfo.whyThisTest}
                  </p>
                </div>

                {/* Local Area & Pricing Highlights Badge Strip */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                    <MapPin size={16} className="shrink-0 text-amber-400" />
                    <span>Serving {matchedArea ? matchedArea.name : 'Bankra, Bankra Bazar, Kabar Para, Kona, Makardah, Domjur, Santragachi, Salap & Howrah'}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Zero upfront payment. Free doorstep sample collection is available if total test amount is above ₹2,000 across Howrah &amp; Kolkata. For updated price or information, contact 8910260709 or WhatsApp.
                  </p>
                </div>

                {/* Quick Spec Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <Droplets className="text-blue-400 mx-auto mb-1" size={20} />
                    <p className="text-[11px] text-slate-400">Sample Type</p>
                    <p className="font-bold text-white text-xs sm:text-sm truncate">{matchedTest.sample_type || 'Blood / Serum'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <Clock className="text-purple-400 mx-auto mb-1" size={20} />
                    <p className="text-[11px] text-slate-400">Report In</p>
                    <p className="font-bold text-white text-xs sm:text-sm">{matchedTest.turnaround_time || '24 Hours'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                    <BadgeCheck className="text-emerald-400 mx-auto mb-1" size={20} />
                    <p className="text-[11px] text-slate-400">Collection</p>
                    <p className="font-bold text-white text-xs sm:text-sm">Free &gt; ₹2000</p>
                  </div>
                </div>

                {/* Trust Features Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {['NABL Lab Partner', 'Free Home Collection (>₹2000)', 'Digital Reports (24h)', 'Doctor Review'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-teal-200 font-medium">
                      <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Sticky Booking & Transparent Pricing Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6 text-slate-900 dark:text-white">
                  
                  {/* Transparent Pricing Header */}
                  <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transparent Offer Price</p>
                      <div className="flex items-baseline gap-2.5 mt-0.5">
                        <span className="text-4xl font-black text-teal-600 dark:text-teal-400">₹{price}</span>
                        {mrp > price && (
                          <span className="text-lg text-slate-400 line-through">₹{mrp}</span>
                        )}
                      </div>
                    </div>
                    {savings > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 inline-block">
                          Save ₹{savings} ({discountPercent}% OFF)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add To Cart Button */}
                  <AddToCartButton 
                    test={{
                      id: matchedTest.id,
                      name: matchedTest.name,
                      price: price,
                      mrp: mrp,
                      categoryName: matchedTest.category.name,
                      testCount: 1,
                      type: 'test'
                    }} 
                  />

                  {/* WhatsApp Quick Booking */}
                  <a
                    href={`https://wa.me/918910260709?text=${encodeURIComponent(whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Phone size={15} /> Quick WhatsApp Booking (8910260709)
                  </a>

                  {/* Value Highlights */}
                  <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                      <span><strong>Free Home Collection:</strong> Available if total test amount is above ₹2,000 (in Howrah &amp; Kolkata).</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                      <span><strong>Zero Upfront Payment:</strong> Pay safely at home after the sample is collected.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                      <span><strong>Smart Digital Reports:</strong> Delivered directly on WhatsApp within {matchedTest.turnaround_time || '24 hours'}.</span>
                    </div>
                  </div>

                  {/* Free Home Sample Collection & Contact Notice */}
                  <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 rounded-xl border border-teal-200 dark:border-teal-800 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    <p className="font-bold text-teal-900 dark:text-teal-200">
                      🚚 Free Home Sample Collection is available if total test amount or price is above ₹2,000 (in Howrah &amp; Kolkata).
                    </p>
                    <p>
                      For updated prices, information, or booking queries, contact <a href="tel:+918910260709" className="font-bold underline text-teal-700 dark:text-teal-300">8910260709</a> or connect on <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20updated%20test%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-600 dark:text-emerald-400">WhatsApp</a>.
                    </p>
                  </div>

                  {/* Center Address Note */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                    📍 <strong>Walk-in Center:</strong> Bankra Bazar, Dewan Para Rd, Domjur, Howrah – 711403
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical & SEO Content Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left 8 Cols: Clinical Details & FAQs */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* 1. Why this test is done */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Why is the {matchedTest.name} Done?
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Clinical Purpose & Overview</p>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-3">
                  <p>{clinicalInfo.whyThisTest}</p>
                  {matchedTest.full_description && (
                    <p><FormattedText text={matchedTest.full_description} /></p>
                  )}
                </div>
              </div>

              {/* 2. Clinical Importance & What It Detects */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Clinical Importance & Key Diagnostic Benefits
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">How this test protects your health</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {clinicalInfo.clinicalImportance.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. When Should You Get Tested & Who Should Take It */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* When to get tested */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="text-amber-500" size={18} /> When to Get Tested
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {clinicalInfo.whenToTake.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Who Should Take This Test */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="text-purple-500" size={18} /> Who is this For?
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {clinicalInfo.whoShouldTake.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 4. Test Preparation Protocol */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-3xl p-6 sm:p-7 border border-amber-200 dark:border-amber-900/50 space-y-3">
                <h3 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Info className="text-amber-600 dark:text-amber-400" size={18} /> Test Preparation & Sample Guidelines
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                  {matchedTest.preparation || 'No special dietary restriction or overnight fasting is required unless advised otherwise by your doctor. You may drink plain water and continue standard prescription medications.'}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 text-xs text-amber-900 dark:text-amber-300 font-semibold">
                  <span>🩸 Sample: <strong>{matchedTest.sample_type || 'Blood'}</strong></span>
                  <span>⏱️ Turnaround: <strong>{matchedTest.turnaround_time || '24 Hours'}</strong></span>
                </div>
              </div>

              {/* 5. Parameters Included Table */}
              {matchedTest.parameters && matchedTest.parameters.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Parameters Included ({matchedTest.parameters.length})
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive biomarker coverage</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-5 py-3">Parameter Name</th>
                          <th className="px-5 py-3">Reference Range</th>
                          <th className="px-5 py-3">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                        {matchedTest.parameters.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                            <td className="px-5 py-3 text-slate-500">{p.reference_range || 'Normal Range'}</td>
                            <td className="px-5 py-3 text-slate-500">{p.unit || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. Primary Positioning & Transparent Pricing Spotlight */}
              <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/50 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Affordable Diagnostic Tests in Bankra & Nearby Areas
                    </h3>
                    <p className="text-xs text-teal-200">100% Price Transparency & Reliable Results</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
                  {clinicalInfo.transparentPricingHighlight.statement}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
                    <p className="text-[11px] text-teal-200">Offer Price</p>
                    <p className="text-lg font-black text-white">₹{price}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center">
                    <p className="text-[11px] text-teal-200">Standard MRP</p>
                    <p className="text-lg font-black text-slate-300 line-through">₹{mrp}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-center">
                    <p className="text-[11px] text-emerald-300">Your Savings</p>
                    <p className="text-lg font-black text-emerald-300">₹{savings}</p>
                  </div>
                </div>
              </div>

              {/* 7. Frequently Asked Questions Accordion */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Frequently Asked Questions ({matchedTest.name})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to know before booking</p>
                  </div>
                </div>

                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {clinicalInfo.faqs.map((faq, idx) => (
                    <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-start gap-2">
                        <span className="text-teal-600 dark:text-teal-400 font-black">Q:</span>
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 pl-5 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Service Area Navigator & Trust Cards */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Category Link Card */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-700 space-y-3 shadow-sm">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 dark:text-teal-300">Explore Category</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">More {matchedTest.category.name} Tests</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">View related diagnostic evaluations with low-cost transparent rates.</p>
                <Link href={`/tests/${matchedTest.category.slug}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:gap-2.5 transition-all pt-1">
                  Browse All {matchedTest.category.name} <ChevronRight size={14} />
                </Link>
              </div>

              {/* Hyperlocal Service Areas Navigator */}
              {matchedTest.service_areas && matchedTest.service_areas.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="text-teal-500" size={18} />
                    Available Service Areas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Book {matchedTest.name} with free doorstep sample collection in:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
                    {matchedTest.service_areas.map(area => (
                      <Link 
                        key={area.id}
                        href={`/tests/${matchedTest!.slug}-in-${area.slug}`}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          matchedArea?.id === area.id
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400'
                        }`}
                      >
                        {area.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Why Choose Capsic Care */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="text-teal-500" size={18} />
                  Why Choose Capsic Care?
                </h3>
                <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex gap-2.5 items-start">
                    <Award className="text-teal-500 shrink-0 mt-0.5" size={16} />
                    <span><strong>NABL & ICMR Labs:</strong> Highest standard of clinical laboratory accuracy.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={16} />
                    <span><strong>Free Home Collection:</strong> Timely doorstep sample pickup across Bankra & Howrah.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={16} />
                    <span><strong>Fast Digital Reports:</strong> High-precision reports delivered to WhatsApp in 24h.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <HeartHandshake className="text-teal-500 shrink-0 mt-0.5" size={16} />
                    <span><strong>Transparent Pricing:</strong> Low-cost test rates with zero hidden charges.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>
      </div>
    )
  }

  // Fallback if nothing matched
  return notFound()
}
