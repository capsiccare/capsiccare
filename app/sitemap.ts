import { MetadataRoute } from 'next'
import { blogArticles } from '@/lib/blog-content'
import { getDiagnosticData } from '@/lib/data/data-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://capsic.in"
  const data = getDiagnosticData()

  // 1. Static Routes
  const highPriorityRoutes = ['', '/our-clinics', '/doctors', '/lab-tests', '/health-packages']

  const staticRoutes = [
    '',
    '/our-clinics',
    '/doctors',
    '/health-packages',
    '/lab-tests',
    '/business-opportunity',
    '/health-camps',
    '/about',
    '/blog',
    '/contact',
    '/faqs',
    '/pricing',
    '/privacy',
    '/terms',
    '/partner',
    '/careers',
    '/join-as-pharmacy',
    '/join-as-doctor',
    '/join-as-hospital',
    '/join-as-lab',
    '/patient-success-stories',
    '/user-reviews',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' || route === '/our-clinics' || route === '/doctors' || route === '/lab-tests' || route === '/health-packages') ? ('daily' as const) : ('monthly' as const),
    priority: route === '' ? 1.0 : (highPriorityRoutes.includes(route) ? 0.9 : 0.7),
  }))

  // 2. Blog Routes (Dynamic)
  const blogRoutes = blogArticles.map((article) => ({
    url: `${baseUrl}/blog/${article.id}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // 3. Lab Test Routes (Dynamic)
  const testRoutes: { url: string; lastModified: Date; changeFrequency: "weekly" | "daily"; priority: number }[] = []
  
  // Category Routes
  data.categories.forEach((cat) => {
    testRoutes.push({
      url: `${baseUrl}/tests/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })
  })

  data.tests.forEach((test) => {
    // Base Route
    testRoutes.push({
      url: `${baseUrl}/tests/${test.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })

    // Area-specific Routes
    if (test.service_areas && test.service_areas.length > 0) {
      test.service_areas.forEach(area => {
        testRoutes.push({
          url: `${baseUrl}/tests/${test.slug}-in-${area.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.5, // Slightly lower priority than base route
        })
      })
    }
  })

  // 4. Package Routes (Dynamic)
  const packageRoutes: { url: string; lastModified: Date; changeFrequency: "weekly"; priority: number }[] = []
  
  data.packages.forEach((pkg) => {
    // Base Route
    packageRoutes.push({
      url: `${baseUrl}/packages/${pkg.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })

    // Area-specific Routes (assuming all packages available in all service areas via home collection)
    if (data.serviceAreas && data.serviceAreas.length > 0) {
      data.serviceAreas.forEach(area => {
        packageRoutes.push({
          url: `${baseUrl}/packages/${pkg.slug}-in-${area.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.5,
        })
      })
    }
  })

  // 5. Doctor Routes (Dynamic)
  const doctorRoutes: { url: string; lastModified: Date; changeFrequency: "weekly"; priority: number }[] = []
  const { doctorsData } = await import('@/data/doctors')
  const { priorityDoctorAreas } = await import('@/lib/doctor-seo-content')

  doctorsData.forEach((doc) => {
    // Base Doctor Route
    doctorRoutes.push({
      url: `${baseUrl}/doctors/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })

    // Area-specific Doctor Routes
    priorityDoctorAreas.forEach((area) => {
      doctorRoutes.push({
        url: `${baseUrl}/doctors/${doc.id}-in-${area.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    })
  })

  // 6. Disease & Symptom Routes (Dynamic)
  const diseaseSymptomsRoutes = [
    ...data.diseases.map(d => ({ slug: d.slug })),
    ...data.symptoms.map(s => ({ slug: s.slug }))
  ].map((item) => ({
    url: `${baseUrl}/tests-for-${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...testRoutes,
    ...packageRoutes,
    ...doctorRoutes,
    ...diseaseSymptomsRoutes,
  ]
}