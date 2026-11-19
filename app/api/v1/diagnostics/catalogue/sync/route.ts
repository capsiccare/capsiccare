import { NextRequest } from 'next/server'
import { successResponse, handleApiError, getOrCreateRequestId } from '@/lib/api/response'
import { requireRole } from '@/lib/modules/auth/auth-service'
import { syncCatalogueData } from '@/lib/services/catalogue-sync'
import { recordAuditEvent } from '@/lib/api/audit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req)

  try {
    const user = await requireRole('branch_admin')
    const { searchParams } = new URL(req.url)
    const dryRun = searchParams.get('dryRun') === 'true'

    const report = await syncCatalogueData(dryRun)

    await recordAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: dryRun ? 'CATALOGUE_SYNC_DRY_RUN' : 'CATALOGUE_SYNC_APPLIED',
      entityType: 'diagnostic_catalogue',
      entityId: user.organizationId,
      newValues: {
        testsTotal: report.tests.total,
        testsValid: report.tests.valid,
        categoriesTotal: report.categories.total,
        packagesTotal: report.packages.total,
        applied: report.databaseSyncApplied,
      },
    })

    return successResponse(report, undefined, 200, requestId)
  } catch (err) {
    return handleApiError(err, req)
  }
}
