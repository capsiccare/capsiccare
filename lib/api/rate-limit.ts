/**
 * Lightweight sliding-window in-memory rate limiter for Edge and Node runtimes.
 */
interface RateLimitBucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, RateLimitBucket>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

/**
 * Checks if the caller key (typically IP address or user ID) exceeds rate limits.
 * Returns true if allowed, false if limit exceeded.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 60, windowMs: 60_000 }
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  let bucket = buckets.get(key)

  if (!bucket || now - bucket.lastRefill > config.windowMs) {
    bucket = { tokens: config.maxRequests, lastRefill: now }
    buckets.set(key, bucket)
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetMs: config.windowMs - (now - bucket.lastRefill),
    }
  }

  return {
    allowed: false,
    remaining: 0,
    resetMs: config.windowMs - (now - bucket.lastRefill),
  }
}

/**
 * Helper to extract client IP address from standard headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return '127.0.0.1'
}
