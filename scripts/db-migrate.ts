import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

/**
 * Loads .env.local into process.env if present
 */
function loadEnvLocal() {
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
}

async function run() {
  loadEnvLocal()

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl || dbUrl.includes('YOUR-PASSWORD') || dbUrl.includes('your_db_password')) {
    console.error('ERROR: DATABASE_URL is not configured in .env.local.')
    console.error('Please configure DATABASE_URL in .env.local with your Supabase database password.')
    process.exit(1)
  }

  // Masked URL for logs (no credentials printed)
  const maskedUrl = dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')
  console.log(`Connecting to PostgreSQL database at: ${maskedUrl}`)

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()
    console.log('✓ Successfully connected to PostgreSQL database!')

    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._capsic_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    // 2. Discover migrations
    const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    console.log(`\nFound ${files.length} migration files in supabase/migrations:`)

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM public._capsic_migrations WHERE migration_name = $1',
        [file]
      )

      if (rows.length > 0) {
        console.log(`  - [ALREADY APPLIED] ${file}`)
        continue
      }

      console.log(`  - [APPLYING] ${file}...`)
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8')

      await client.query('BEGIN')
      try {
        await client.query(sqlContent)
        await client.query(
          'INSERT INTO public._capsic_migrations (migration_name) VALUES ($1)',
          [file]
        )
        await client.query('COMMIT')
        console.log(`    ✓ Applied ${file} successfully`)
      } catch (err: any) {
        await client.query('ROLLBACK')
        console.error(`    ✗ Migration failed: ${file}`)
        console.error(`    Reason: ${err.message}`)
        throw err
      }
    }

    // 3. Apply seed data if requested or flag set
    const shouldSeed = process.argv.includes('--seed') || process.env.RUN_SEED === 'true'
    if (shouldSeed) {
      const seedFile = path.resolve(process.cwd(), 'supabase/seed.sql')
      if (fs.existsSync(seedFile)) {
        console.log('\n[SEEDING] Applying synthetic seed data from supabase/seed.sql...')
        const seedSql = fs.readFileSync(seedFile, 'utf8')
        await client.query(seedSql)
        console.log('  ✓ Synthetic development seed data applied successfully!')
      }
    }

    // 4. Verification queries
    console.log('\n--- VERIFICATION OF DATABASE ACTIVATION ---')
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `)
    console.log(`Total public tables: ${tablesRes.rows.length}`)

    const orgCount = await client.query('SELECT COUNT(*)::int as count FROM organizations;')
    const branchCount = await client.query('SELECT COUNT(*)::int as count FROM branches;')
    const docCount = await client.query('SELECT COUNT(*)::int as count FROM doctors;')
    const testCount = await client.query('SELECT COUNT(*)::int as count FROM diagnostic_tests;')
    const pkgCount = await client.query('SELECT COUNT(*)::int as count FROM diagnostic_packages;')
    const priceCount = await client.query('SELECT COUNT(*)::int as count FROM diagnostic_prices;')
    const patientCount = await client.query('SELECT COUNT(*)::int as count FROM patients;')
    const aptCount = await client.query('SELECT COUNT(*)::int as count FROM appointments;')
    const orderCount = await client.query('SELECT COUNT(*)::int as count FROM diagnostic_orders;')

    console.log(`  Organizations: ${orgCount.rows[0].count}`)
    console.log(`  Branches: ${branchCount.rows[0].count}`)
    console.log(`  Doctors: ${docCount.rows[0].count}`)
    console.log(`  Diagnostic Tests: ${testCount.rows[0].count}`)
    console.log(`  Diagnostic Packages: ${pkgCount.rows[0].count}`)
    console.log(`  Diagnostic Prices: ${priceCount.rows[0].count}`)
    console.log(`  Patients: ${patientCount.rows[0].count}`)
    console.log(`  Appointments: ${aptCount.rows[0].count}`)
    console.log(`  Diagnostic Orders: ${orderCount.rows[0].count}`)

    // Verify Overlap Trigger
    const triggerRes = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement 
      FROM information_schema.triggers 
      WHERE event_object_table = 'appointments';
    `)
    console.log(`  Appointment Triggers: ${triggerRes.rows.map(r => r.trigger_name).join(', ')}`)

    // Verify RLS enabled on all tables
    const rlsRes = await client.query(`
      SELECT relname as table_name, relrowsecurity as rls_enabled
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE pg_namespace.nspname = 'public' 
        AND relkind = 'r' 
        AND relname NOT LIKE '_capsic%'
      ORDER BY relname;
    `)
    const nonRlsTables = rlsRes.rows.filter(r => !r.rls_enabled)
    if (nonRlsTables.length > 0) {
      console.warn(`  [WARNING] Tables without RLS: ${nonRlsTables.map(r => r.table_name).join(', ')}`)
    } else {
      console.log(`  ✓ Row-Level Security (RLS) is ENABLED on all ${rlsRes.rows.length} public tables.`)
    }

    console.log('\n✓ Database activation verified successfully!')
  } catch (error: any) {
    console.error('Database migration error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
