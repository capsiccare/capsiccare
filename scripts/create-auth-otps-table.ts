import { Client } from 'pg'

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log('Connected to PostgreSQL database.')

  const sql = `
    CREATE TABLE IF NOT EXISTS public.auth_otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      identifier VARCHAR(100) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
      attempts INT NOT NULL DEFAULT 0,
      max_attempts INT NOT NULL DEFAULT 5,
      is_verified BOOLEAN NOT NULL DEFAULT false,
      expires_at TIMESTAMPTZ NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_auth_otps_identifier ON public.auth_otps(identifier);
    CREATE INDEX IF NOT EXISTS idx_auth_otps_expires ON public.auth_otps(expires_at);
  `

  await client.query(sql)
  console.log('✅ Created auth_otps table successfully!')
  await client.end()
}

run().catch((err) => {
  console.error('Error creating auth_otps table:', err)
  process.exit(1)
})
