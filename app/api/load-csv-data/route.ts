import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

function parseCSV(content: string) {
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  
  const tests = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const values: any = {}
    let current = ''
    let inQuotes = false
    let colIdx = 0
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]
      if (char === '"') inQuotes = !inQuotes
      else if (char === ',' && !inQuotes) {
        values[headers[colIdx]] = current.trim().replace(/^"|"$/g, '')
        current = ''
        colIdx++
      } else {
        current += char
      }
    }
    values[headers[colIdx]] = current.trim().replace(/^"|"$/g, '')
    
    tests.push({
      id: values.test_id,
      name: values.test_name,
      categoryId: values.category_id,
      price: parseInt(values.price) || 0,
      sampleType: values.sample_type,
      preparation: values.preparation,
      turnaroundTime: values.turnaround_time,
      shortDescription: values.short_description,
      fullDescription: values.full_description,
      reportType: values.report_type,
      homeCollection: values.home_collection_available === 'Yes',
      status: values.status,
    })
  }
  
  return tests
}

export async function GET(request: Request) {
  try {
    const csvPath = join(process.cwd(), 'public/data/tests.csv')
    const content = readFileSync(csvPath, 'utf-8')
    const tests = parseCSV(content)
    
    return NextResponse.json({ 
      success: true, 
      count: tests.length,
      tests 
    })
  } catch (error) {
    console.error('[API] Error loading CSV:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
