import { z } from 'zod'

/**
 * Environment configuration schema for CAPSIC CARE OS.
 * Validates server and client environment variables at runtime.
 */
const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default('918910260709'),
})

// Support interchangeable publishable/anon key
const resolvedAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const rawEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: resolvedAnonKey,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: resolvedAnonKey,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
}

const parsedEnv = envSchema.safeParse(rawEnv)

if (!parsedEnv.success) {
  console.error('Invalid environment variables detected:', parsedEnv.error.format())
}

export const env = parsedEnv.success ? parsedEnv.data : envSchema.parse({
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'development',
  NEXT_PUBLIC_WHATSAPP_NUMBER: '918910260709',
})

/**
 * Checks if Supabase credentials are validly configured for the environment.
 */
export function isSupabaseConfigured(): boolean {
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
    key &&
    !env.NEXT_PUBLIC_SUPABASE_URL.includes('your-dev-project')
  )
}
