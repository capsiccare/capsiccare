import { NextResponse } from 'next/server'
import { getDiagnosticData } from '@/lib/data/data-service'
import { blogArticles } from '@/lib/blog-content'
import { doctorsData } from '@/data/doctors'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  if (!query) {
    return NextResponse.json([])
  }

  const data = getDiagnosticData()
  type SearchResult = { type: string; id: string; title: string; subtitle: string; href: string };
  const results: SearchResult[] = []

  // 1. Search Doctors (by name, specialty, or designation)
  const matchedDoctors = doctorsData.filter(d => 
    d.name.toLowerCase().includes(query) || 
    d.specialty.toLowerCase().includes(query) ||
    d.designation.toLowerCase().includes(query)
  )
  matchedDoctors.slice(0, 3).forEach(d => {
    results.push({
      type: 'doctor',
      id: d.id,
      title: d.name,
      subtitle: `${d.specialty} • ${d.designation}`,
      href: `/doctors/${d.id}`
    })
  })

  // 2. Search Tests (by name or short description)
  const matchedTests = data.tests.filter(t => 
    t.name.toLowerCase().includes(query) || 
    t.short_description?.toLowerCase().includes(query)
  )
  matchedTests.slice(0, 4).forEach(t => {
    results.push({
      type: 'test',
      id: t.id,
      title: t.name,
      subtitle: t.category.name,
      href: `/tests/${t.slug}`
    })
  })

  // 3. Search Packages
  const matchedPackages = data.packages.filter(p => 
    p.name.toLowerCase().includes(query)
  )
  matchedPackages.slice(0, 2).forEach(p => {
    results.push({
      type: 'package',
      id: p.id,
      title: p.name,
      subtitle: 'Health Package',
      href: `/packages/${p.slug}`
    })
  })

  // 4. Search Diseases & Symptoms
  const matchedDiseases = data.diseases.filter(d => 
    d.name.toLowerCase().includes(query)
  )
  matchedDiseases.slice(0, 2).forEach(d => {
    results.push({
      type: 'disease',
      id: d.id,
      title: `Tests for ${d.name}`,
      subtitle: 'Disease Profile',
      href: `/tests-for-${d.slug}`
    })
  })

  const matchedSymptoms = data.symptoms.filter(s => 
    s.name.toLowerCase().includes(query)
  )
  matchedSymptoms.slice(0, 2).forEach(s => {
    results.push({
      type: 'symptom',
      id: s.id,
      title: `Tests for ${s.name}`,
      subtitle: 'Symptom Profile',
      href: `/tests-for-${s.slug}`
    })
  })

  // 5. Search Parameters (e.g. "Hemoglobin" -> CBC Test)
  data.tests.forEach(t => {
    const hasParam = t.parameters?.some(p => p.name.toLowerCase().includes(query))
    if (hasParam && !matchedTests.includes(t)) {
      results.push({
        type: 'parameter_test',
        id: `param-${t.id}`,
        title: t.name,
        subtitle: `Includes ${query}`,
        href: `/tests/${t.slug}`
      })
    }
  })

  // 6. Search Service Areas
  const matchedAreas = data.serviceAreas.filter(a => a.name.toLowerCase().includes(query))
  matchedAreas.slice(0, 2).forEach(a => {
    results.push({
      type: 'area',
      id: a.id,
      title: `Home Collection in ${a.name}`,
      subtitle: 'Location Service',
      href: `/lab-tests`
    })
  })
  
  // 7. Blog Articles
  blogArticles.forEach((article) => {
    if (
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query)
    ) {
      results.push({
        type: 'article',
        id: article.id,
        title: article.title,
        subtitle: article.category,
        href: `/blog/${article.id}`,
      })
    }
  })

  // Take top 8 results overall to keep UI clean
  return NextResponse.json(results.slice(0, 8))
}

