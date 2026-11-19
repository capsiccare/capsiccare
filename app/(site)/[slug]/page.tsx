import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDiagnosticData } from '@/lib/data/data-service'
import { TestCard } from '@/components/test-card'
import { Activity, ShieldAlert, HeartPulse, ShieldCheck, CheckCircle2, Award } from 'lucide-react'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = getDiagnosticData()
  const { slug } = await params
  
  // Strip "tests-for-" prefix if present
  const realSlug = slug.startsWith('tests-for-') ? slug.replace('tests-for-', '') : slug
  
  // Match Disease or Symptom
  const disease = data.diseases.find(d => d.slug === realSlug)
  if (disease) {
    const title = disease.seo_title || `Tests for ${disease.name} in Bankra & Howrah | Capsic Care`
    const description = disease.seo_description || `Find recommended diagnostic lab tests specifically targeting ${disease.name} with free home sample collection in Bankra, Kona, Domjur & Howrah.`
    return {
      title,
      description,
      keywords: disease.seo_keywords || [`${disease.name} tests`, `diagnostic tests for ${disease.name}`, `${disease.name} blood test Bankra`],
      alternates: {
        canonical: `https://capsic.in/${slug}`
      },
      openGraph: {
        title,
        description,
        url: `https://capsic.in/${slug}`,
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
        follow: true
      }
    }
  }

  const symptom = data.symptoms.find(s => s.slug === realSlug)
  if (symptom) {
    const title = `Tests for ${symptom.name} Symptoms in Bankra & Howrah | Capsic Care`
    const description = `Experiencing ${symptom.name}? Browse essential diagnostic lab tests with free home sample collection across Bankra, Kona, Domjur, Makardah & Santragachi.`
    return {
      title,
      description,
      keywords: [`${symptom.name} tests`, `tests for ${symptom.name}`, `blood test for ${symptom.name} Bankra`],
      alternates: {
        canonical: `https://capsic.in/${slug}`
      },
      openGraph: {
        title,
        description,
        url: `https://capsic.in/${slug}`,
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
        follow: true
      }
    }
  }

  return { title: 'Not Found' }
}

export async function generateStaticParams() {
  const data = getDiagnosticData()
  const paths: { slug: string }[] = []

  data.diseases.forEach(d => paths.push({ slug: `tests-for-${d.slug}` }))
  data.symptoms.forEach(s => paths.push({ slug: `tests-for-${s.slug}` }))

  return paths
}

export default async function DiseasesSymptomsSlugPage({ params }: { params: { slug: string } }) {
  const data = getDiagnosticData()
  const { slug } = await params

  // Strip "tests-for-" prefix if present
  const realSlug = slug.startsWith('tests-for-') ? slug.replace('tests-for-', '') : slug

  // Is it a Disease?
  const disease = data.diseases.find(d => d.slug === realSlug)
  if (disease) {
    const diseaseJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MedicalWebPage',
          '@id': `https://capsic.in/${slug}`,
          url: `https://capsic.in/${slug}`,
          name: `Tests for ${disease.name} | Capsic Care`,
          description: `Diagnostic lab tests and investigations for ${disease.name} in Bankra, Howrah.`,
          about: {
            '@type': 'MedicalCondition',
            name: disease.name
          }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://capsic.in' },
            { '@type': 'ListItem', position: 2, name: 'Diseases', item: 'https://capsic.in/lab-tests' },
            { '@type': 'ListItem', position: 3, name: `Tests for ${disease.name}`, item: `https://capsic.in/${slug}` }
          ]
        }
      ]
    }

    return (
      <div className="w-full bg-white dark:bg-[#0a0e14]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(diseaseJsonLd) }}
        />
        <section className="pt-32 pb-16 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-900/10 border-b border-rose-100 dark:border-rose-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mb-2">
              <HeartPulse size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Tests for {disease.name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {disease.content_body || `We have compiled the most effective diagnostic lab tests specifically designed to identify, monitor, and screen for ${disease.name}.`}
            </p>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-teal-500" /> Recommended Diagnostics
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {disease.recommended_tests && disease.recommended_tests.length > 0 ? (
                disease.recommended_tests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))
              ) : (
                <p className="col-span-full text-slate-500 py-10">No specific tests are currently linked to this profile.</p>
              )}
            </div>
          </div>

          {/* Trust Badges - Why Choose Us */}
          <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-b from-white to-rose-50/50 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="text-rose-500" size={20} />
              Capsic Care Diagnostics
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex gap-3 items-start">
                <Award className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">NABL Accredited Lab Partners</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">Safe Home Collection</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">Digital Smart Reports</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">Expert MD Review</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Is it a Symptom?
  const symptom = data.symptoms.find(s => s.slug === realSlug)
  if (symptom) {
    const symptomJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MedicalWebPage',
          '@id': `https://capsic.in/${slug}`,
          url: `https://capsic.in/${slug}`,
          name: `Tests for ${symptom.name} Symptoms | Capsic Care`,
          description: `Diagnostic blood tests recommended for ${symptom.name} symptoms in Bankra, Howrah.`,
          about: {
            '@type': 'MedicalSignOrSymptom',
            name: symptom.name
          }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://capsic.in' },
            { '@type': 'ListItem', position: 2, name: 'Symptoms', item: 'https://capsic.in/lab-tests' },
            { '@type': 'ListItem', position: 3, name: `Tests for ${symptom.name}`, item: `https://capsic.in/${slug}` }
          ]
        }
      ]
    }

    return (
      <div className="w-full bg-white dark:bg-[#0a0e14]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(symptomJsonLd) }}
        />
        <section className="pt-32 pb-16 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-900/10 border-b border-amber-100 dark:border-amber-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mb-2">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Experiencing {symptom.name}?
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              If you are suffering from {symptom.name.toLowerCase()}, accurate diagnosis is the first step to recovery. Consider these recommended lab tests.
            </p>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-amber-500" /> Suggested Tests
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {symptom.recommended_tests && symptom.recommended_tests.length > 0 ? (
                symptom.recommended_tests.map((test) => (
                  <TestCard key={test.id} test={test} />
                ))
              ) : (
                <p className="col-span-full text-slate-500 py-10">No specific tests are currently linked to this profile.</p>
              )}
            </div>
          </div>

          {/* Trust Badges - Why Choose Us */}
          <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-b from-white to-amber-50/50 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="text-amber-500" size={20} />
              Capsic Care Diagnostics
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex gap-3 items-start">
                <Award className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">NABL Accredited Lab Partners</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">Safe Home Collection</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">Digital Smart Reports</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-300">Expert MD Review</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return notFound()
}
