import { NextResponse } from 'next/server'
import { getDiagnosticData } from '@/lib/data/data-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = getDiagnosticData()
    
    const tests = data.tests.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      mrp: t.mrp || t.price,
      category: t.category?.name || 'General Lab Tests',
      sampleType: t.sample_type,
      type: 'test',
    }))

    const packages = data.packages.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.discount_price || p.price,
      mrp: p.price,
      category: 'Health Package',
      sampleType: 'Blood / Urine',
      type: 'package',
    }))

    return NextResponse.json({
      tests,
      packages,
      all: [...tests, ...packages],
      total: tests.length + packages.length,
    })
  } catch (error) {
    console.error('Error fetching all tests:', error)
    return NextResponse.json({ error: 'Failed to load test data' }, { status: 500 })
  }
}
