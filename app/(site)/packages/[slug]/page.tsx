import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, FlaskConical, Clock, Droplets, ShieldCheck, Award, Phone, Calendar, ArrowRight, Sparkles, UserCheck, HelpCircle, Check } from 'lucide-react'
import { getDiagnosticData } from '@/lib/data/data-service'
import { TestCard } from '@/components/test-card'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { packagesMarketingData } from '@/lib/package-marketing'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = getDiagnosticData()
  const { slug } = await params

  let pkg = data.packages.find(p => p.slug === slug)
  let matchedArea = null

  if (!pkg) {
    const parts = slug.split('-in-')
    if (parts.length === 2) {
      pkg = data.packages.find(p => p.slug === parts[0])
      matchedArea = data.serviceAreas.find(a => a.slug === parts[1])
    }
  }

  if (pkg) {
    const areaText = matchedArea ? ` in ${matchedArea.name}` : ' in Bankra & Nearby Areas'
    const marketing = packagesMarketingData[pkg.slug]
    const price = pkg.discount_price || pkg.price
    const titleText = `${pkg.name}${areaText} (₹${price}) - Full Body Health Package | Capsic Care`
    const descText = `Book ${pkg.name}${areaText} at transparent price ₹${price} (${pkg.tests_included_count} tests included). Free home sample collection on orders above ₹2000 in Howrah & Kolkata (Bankra, Kona, Domjur, Makardah, Santragachi). NABL certified labs & 24h reports on WhatsApp. Call/WhatsApp +91 8910260709.`
    const packageImage = marketing?.posterImage || `/images/packages/${pkg.slug}.jpg`
    return {
      title: titleText,
      description: descText,
      keywords: [
        `${pkg.name} in Bankra`,
        `${pkg.name} price Howrah`,
        `Affordable Health Package Bankra`,
        `Full body checkup near Bankra`,
        `Blood test package ${matchedArea ? matchedArea.name : 'Howrah'}`,
        `Free home collection Bankra`,
        `Health checkup package Kona`,
        `Master health checkup Domjur`,
        `Preventive health package Santragachi`,
        `Capsic Care health package`,
        `${pkg.name} home collection`
      ],
      alternates: {
        canonical: `https://capsic.in/packages/${slug}`
      },
      openGraph: {
        title: titleText,
        description: descText,
        url: `https://capsic.in/packages/${slug}`,
        siteName: 'Capsic Care Diagnostics',
        images: [packageImage],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: titleText,
        description: descText,
        images: [packageImage]
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

  return { title: 'Health Package Not Found | Capsic Care' }
}

export async function generateStaticParams() {
  const data = getDiagnosticData()
  const paths: { slug: string }[] = []

  data.packages.forEach(pkg => {
    paths.push({ slug: pkg.slug })
    if (data.serviceAreas && data.serviceAreas.length > 0) {
      data.serviceAreas.forEach(area => {
        paths.push({ slug: `${pkg.slug}-in-${area.slug}` })
      })
    }
  })

  return paths
}

export default async function PackageSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = getDiagnosticData()
  const { slug } = await params

  let pkg = data.packages.find(p => p.slug === slug)
  let matchedArea = null

  if (!pkg) {
    const parts = slug.split('-in-')
    if (parts.length === 2) {
      pkg = data.packages.find(p => p.slug === parts[0])
      matchedArea = data.serviceAreas.find(a => a.slug === parts[1])
    }
  }

  if (!pkg) return notFound()

  const mrp = pkg.price > (pkg.discount_price || 0) ? pkg.price : (pkg.discount_price || pkg.price);
  const salePrice = pkg.discount_price ? Math.min(pkg.price, pkg.discount_price) : pkg.price;
  const discountPercentage = mrp > 0 ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
  const marketing = packagesMarketingData[pkg.slug]
  const posterSrc = marketing?.posterImage || `/images/packages/${pkg.slug}.jpg`

  const whatsappMsg = `Hello Capsic Care, I want to book the *${pkg.name}* (Offer Price: ₹${salePrice}) with Free Home Sample Collection.`

  const packageJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `https://capsic.in/packages/${slug}`,
        name: pkg.name,
        description: marketing?.tagline || `${pkg.name} with ${pkg.tests_included_count} tests included. Affordable full-body health checkup with free home sample collection across Howrah and Kolkata.`,
        image: `https://capsic.in${posterSrc}`,
        brand: {
          '@type': 'Brand',
          name: 'Capsic Care Diagnostics'
        },
        offers: {
          '@type': 'Offer',
          price: salePrice,
          priceCurrency: 'INR',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          url: `https://capsic.in/packages/${slug}`,
          seller: {
            '@type': 'MedicalBusiness',
            name: 'Capsic Care Diagnostics',
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
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '138',
          bestRating: '5',
          worstRating: '1'
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
            name: 'Health Packages',
            item: 'https://capsic.in/health-packages'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: pkg.name,
            item: `https://capsic.in/packages/${slug}`
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How many tests are included in the ${pkg.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `The ${pkg.name} includes ${pkg.tests_included_count} clinical laboratory parameters designed to screen vital organs and metabolic markers.`
            }
          },
          {
            '@type': 'Question',
            name: `Is fasting required for ${pkg.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: '10 to 12 hours of overnight fasting is generally required for accurate fasting blood sugar and lipid profile readings. Plain water is permitted.'
            }
          },
          {
            '@type': 'Question',
            name: `How can I book home sample collection for ${pkg.name} in Bankra?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can book easily online or by sending a WhatsApp message to +91 8910260709. A certified phlebotomist visits your doorstep at your chosen morning time slot.'
            }
          },
          {
            '@type': 'Question',
            name: `When will I get my ${pkg.name} test reports?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Verified smart digital reports are delivered directly to your WhatsApp and email within 24 hours of sample collection.'
            }
          }
        ]
      }
    ]
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0e14]">
      {/* Inject JSON-LD Schema for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(packageJsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-cyan-950 text-white border-b border-teal-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.18),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb & Slogan Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Link href="/health-packages" className="text-teal-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
              Health Packages
            </Link>
            <span className="text-slate-500 text-xs">/</span>
            <span className="text-slate-300 text-xs font-bold truncate">{pkg.name}</span>
            {marketing?.validUntil && (
              <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Calendar size={12} /> {marketing.validUntil}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Title, Multilingual Banner, Quick Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-500/30">
                  <Sparkles size={14} className="text-teal-400" /> Exclusive Verified Package
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                  {pkg.name}
                  {matchedArea && <span className="text-teal-400 font-normal"> in {matchedArea.name}</span>}
                </h1>

                {marketing?.tagline && (
                  <p className="text-lg text-teal-100 font-medium leading-relaxed">
                    {marketing.tagline}
                  </p>
                )}
              </div>

              {/* Multilingual Callouts from Posters */}
              {(marketing?.bengaliSlogan || marketing?.hindiSlogan) && (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                  {marketing.bengaliSlogan && (
                    <p className="text-sm md:text-base font-bold text-amber-200 flex items-center gap-2">
                      <span className="text-lg">📢</span> {marketing.bengaliSlogan}
                    </p>
                  )}
                  {marketing.hindiSlogan && (
                    <p className="text-xs md:text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <span className="text-base">📌</span> {marketing.hindiSlogan}
                    </p>
                  )}
                </div>
              )}

              {/* Spec Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                  <FlaskConical className="text-teal-400 mx-auto mb-1" size={20} />
                  <p className="text-[11px] text-slate-400">Total Tests</p>
                  <p className="font-bold text-white text-sm">{pkg.tests_included_count} Parameters</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                  <Droplets className="text-blue-400 mx-auto mb-1" size={20} />
                  <p className="text-[11px] text-slate-400">Fasting</p>
                  <p className="font-bold text-white text-sm">{pkg.fasting_required ? '10-12 Hrs' : 'Not Required'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                  <Clock className="text-purple-400 mx-auto mb-1" size={20} />
                  <p className="text-[11px] text-slate-400">Report In</p>
                  <p className="font-bold text-white text-sm">{pkg.turnaround_time || '24 Hours'}</p>
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

            {/* Right Column: Poster Image Preview & Sticky Booking Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Poster Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="relative aspect-[859/1024] w-full bg-slate-950 overflow-hidden group">
                  <Image
                    src={posterSrc}
                    alt={pkg.name}
                    fill
                    className="object-contain sm:object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full shadow-lg">
                    {discountPercentage}% OFF
                  </div>
                </div>

                {/* Price & Booking Actions */}
                <div className="p-6 space-y-5">
                  <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offer Price</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-4xl font-black text-teal-600 dark:text-teal-400">₹{salePrice}</span>
                        {mrp > salePrice && (
                          <span className="text-lg text-slate-400 line-through">₹{mrp}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        Save ₹{mrp - salePrice}
                      </span>
                    </div>
                  </div>

                  <AddToCartButton
                    test={{
                      id: pkg.id,
                      name: pkg.name,
                      price: salePrice,
                      mrp: mrp,
                      categoryName: 'Health Package',
                      testCount: pkg.tests_included_count,
                      type: 'package'
                    }}
                  />

                  {/* Direct WhatsApp Callout */}
                  <a
                    href={`https://wa.me/918910260709?text=${encodeURIComponent(whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Phone size={14} /> Quick WhatsApp Booking (8910260709)
                  </a>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                    🔒 Zero upfront payment required. Pay safely at home after sample collection.
                  </p>

                  {/* Free Home Collection & Contact Notice */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      🚚 Free Home Sample Collection is available if total test amount is above ₹3,000 (in Howrah &amp; Kolkata).
                    </p>
                    <p>
                      For updated prices, home collection charges, or information, contact <a href="tel:+918910260709" className="font-bold underline text-teal-600 dark:text-teal-400">8910260709</a> or <a href="https://wa.me/918910260709?text=Hello%20Capsic%20Care%2C%20I%20would%20like%20to%20inquire%20about%20updated%20prices%20and%20home%20sample%20collection." target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-600 dark:text-emerald-400">WhatsApp</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Clinical Benefits */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Why Choose & Key Benefits */}
        {marketing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Clinical Benefits */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why This Package is Crucial</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Key medical screening advantages</p>
                </div>
              </div>

              <div className="space-y-4">
                {marketing.keyBenefits.map((benefit, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who Should Book & Preparation */}
            <div className="space-y-8">
              {/* Who Should Book */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Who Should Take This Test?</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Target health groups & symptoms</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {marketing.idealFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <Check className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample Requirements & Preparation */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Test Preparation & Logistics</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Simple steps before sample collection</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-semibold text-slate-500 block">Sample Type</span>
                    <span className="font-bold text-slate-900 dark:text-white">{marketing.sampleDetails.sampleType}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-semibold text-slate-500 block">Fasting Requirement</span>
                    <span className="font-bold text-slate-900 dark:text-white">{marketing.sampleDetails.fasting}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-semibold text-slate-500 block">Turnaround Time</span>
                    <span className="font-bold text-slate-900 dark:text-white">{marketing.sampleDetails.reportTime}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-semibold text-slate-500 block">Collection Facility</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{marketing.sampleDetails.collectionType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Included Tests Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Tests Included in this Package ({pkg.tests?.length || pkg.tests_included_count})
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Each test is processed individually in high-precision NABL automated laboratories.
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-xl border border-teal-200 dark:border-teal-800 shrink-0">
              100% Parameter Guarantee
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pkg.tests && pkg.tests.length > 0 ? (
              pkg.tests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))
            ) : (
              <p className="col-span-full text-slate-500 py-10">Details about specific tests are currently being loaded.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

