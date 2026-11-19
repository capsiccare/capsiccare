import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireAuth } from '@/lib/modules/auth/auth-service'
import { processPatientCsvImport } from '@/lib/modules/careflow/careflow-service'

export const dynamic = 'force-dynamic'

const importSchema = z.object({
  file_name: z.string().default('patients_import.csv'),
  rows: z.array(
    z.object({
      full_name: z.string().min(1),
      phone: z.string().min(10),
      email: z.string().email().optional().or(z.literal('')),
      gender: z.enum(['male', 'female', 'other']).optional(),
      age_years: z.number().int().optional(),
      tags: z.string().optional(),
      consent_granted: z.boolean().default(true),
    })
  ),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getOrCreateRequestId(req)

  try {
    const caller = await requireAuth()
    const { id: practiceId } = await params
    const body = await req.json()
    const validated = importSchema.parse(body)

    const mappedRows = validated.rows.map((r) => ({
      fullName: r.full_name,
      phone: r.phone,
      email: r.email || undefined,
      gender: r.gender,
      ageYears: r.age_years,
      tags: r.tags,
      consentGranted: r.consent_granted,
    }))

    const results = await processPatientCsvImport({
      practiceId,
      importedById: caller.id,
      fileName: validated.file_name,
      rows: mappedRows,
    })

    return successResponse(results, undefined, 201, requestId)
  } catch (error) {
    return handleApiError(error, req)
  }
}
