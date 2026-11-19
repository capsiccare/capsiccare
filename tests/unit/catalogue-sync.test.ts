import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { syncCatalogueData } from '../../lib/services/catalogue-sync'

describe('Catalogue Synchronization & CSV Ingestion Tests', () => {
  it('syncCatalogueData dry-run should parse and validate static CSV catalogue', async () => {
    const report = await syncCatalogueData(true)

    assert.ok(typeof report.timestamp === 'string')
    assert.ok(report.tests.total > 0, 'Expected non-empty tests in tests.csv')
    assert.ok(report.tests.valid > 0, 'Expected valid tests')
    assert.ok(report.categories.total > 0, 'Expected non-empty categories in categories.csv')
    assert.ok(report.packages.total > 0, 'Expected non-empty packages in packages.csv')
    assert.equal(report.databaseSyncApplied, false, 'Dry-run must not modify database')
  })
})
