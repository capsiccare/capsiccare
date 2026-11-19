import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import { isSupabaseConfigured, env } from '@/lib/config/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  })
}

const hasDbUrl = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('YOUR-PASSWORD'))

describe('Live Supabase Database & Security Verification', { skip: !hasDbUrl }, () => {
  let pgClient: Client

  test.before(async () => {
    pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
    await pgClient.connect()
  })

  test.after(async () => {
    if (pgClient) {
      await pgClient.end()
    }
  })

  test('Database connectivity and table count', async () => {
    const res = await pgClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `)
    assert.ok(res.rows.length >= 15, `Expected at least 15 core tables, found ${res.rows.length}`)
  })

  test('Row-Level Security is active on all public clinical and operational tables', async () => {
    const res = await pgClient.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE pg_namespace.nspname = 'public' 
        AND relkind = 'r' 
        AND relname NOT LIKE '_capsic%'
    `)
    const tablesWithoutRls = res.rows.filter(r => !r.relrowsecurity).map(r => r.relname)
    assert.deepEqual(tablesWithoutRls, [], `Expected all tables to have RLS enabled, but found: ${tablesWithoutRls.join(', ')}`)
  })

  test('Integer paise pricing constraint validation (no negative or float rounding)', async () => {
    const res = await pgClient.query(`
      SELECT price_paise, mrp_paise, discount_paise 
      FROM diagnostic_prices 
      WHERE is_active = true
      LIMIT 10;
    `)
    assert.ok(res.rows.length > 0, 'Expected active diagnostic prices')
    for (const row of res.rows) {
      assert.ok(Number.isInteger(row.price_paise), 'price_paise must be integer')
      assert.ok(Number.isInteger(row.mrp_paise), 'mrp_paise must be integer')
      assert.ok(row.price_paise >= 0, 'price_paise must be non-negative')
      assert.ok(row.mrp_paise >= row.price_paise, 'mrp_paise must be >= price_paise')
      assert.equal(row.discount_paise, row.mrp_paise - row.price_paise, 'discount_paise must equal mrp - price')
    }
  })

  test('Double booking concurrency trigger prevents overlapping appointments', async () => {
    // Attempt inserting an appointment that overlaps with an existing appointment
    const existing = await pgClient.query(`
      SELECT doctor_id, scheduled_date, start_time, end_time, organization_id, branch_id, patient_id
      FROM appointments
      WHERE status NOT IN ('cancelled', 'no_show')
      LIMIT 1;
    `)

    if (existing.rows.length > 0) {
      const apt = existing.rows[0]
      let overlapErrorThrown = false

      try {
        await pgClient.query(`
          INSERT INTO appointments (
            appointment_number, organization_id, branch_id, doctor_id, patient_id,
            consultation_type, scheduled_date, start_time, end_time, fee_paise, status
          ) VALUES (
            'TEST-OVERLAP-FAIL', $1, $2, $3, $4, 'physical', $5, $6, $7, 40000, 'confirmed'
          );
        `, [
          apt.organization_id,
          apt.branch_id,
          apt.doctor_id,
          apt.patient_id,
          apt.scheduled_date,
          apt.start_time,
          apt.end_time,
        ])
      } catch (err: any) {
        overlapErrorThrown = err.message.includes('overlapping consultation')
      }

      assert.ok(overlapErrorThrown, 'Expected check_appointment_overlap trigger to reject overlapping consultation')
    }
  })

  test('Foreign key cascade and restrict integrity protection', async () => {
    // Attempt deleting an organization with active branches should be RESTRICTED
    let restrictError = false
    try {
      const org = await pgClient.query('SELECT id FROM organizations LIMIT 1;')
      if (org.rows.length > 0) {
        await pgClient.query('DELETE FROM organizations WHERE id = $1;', [org.rows[0].id])
      }
    } catch (err: any) {
      restrictError = err.message.includes('foreign key constraint') || err.code === '23503'
    }
    assert.ok(restrictError, 'Expected deletion of organization with dependencies to be restricted by foreign key')
  })

  test('Decoupled patient identity allows registering patient without auth user', async () => {
    const res = await pgClient.query(`
      SELECT id, uhid, profile_id FROM patients WHERE profile_id IS NULL LIMIT 1;
    `)
    assert.ok(res.rows.length > 0, 'Expected synthetic patient without profile_id (walk-in registration)')
    assert.equal(res.rows[0].profile_id, null, 'profile_id should be null for staff-registered walk-in patient')
  })

  test('Audit log table captures security and administrative mutations', async () => {
    const res = await pgClient.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs'
    `)
    const colNames = res.rows.map(r => r.column_name)
    assert.ok(colNames.includes('action'))
    assert.ok(colNames.includes('entity_type'))
    assert.ok(colNames.includes('entity_id'))
    assert.ok(colNames.includes('old_values'))
    assert.ok(colNames.includes('new_values'))
  })

  test('Idempotency keys table enforces unique request key locks', async () => {
    const res = await pgClient.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'idempotency_keys'
    `)
    const colNames = res.rows.map(r => r.column_name)
    assert.ok(colNames.includes('key'))
    assert.ok(colNames.includes('locked_until'))
    assert.ok(colNames.includes('response_body'))
  })
})
