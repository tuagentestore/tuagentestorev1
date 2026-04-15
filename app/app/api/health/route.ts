import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  const health: Record<string, string> = {
    status: 'ok',
    db: 'unknown',
    redis: 'unknown',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
  }

  // Check PostgreSQL
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
    const result = await pool.query('SELECT 1 as ok')
    health.db = result.rows[0]?.ok === 1 ? 'ok' : 'error'
    await pool.end()
  } catch (err) {
    health.db = 'error'
    health.db_error = err instanceof Error ? err.message : 'unknown'
  }

  // Check Redis
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
    })
    const pong = await redis.ping()
    health.redis = pong === 'PONG' ? 'ok' : 'error'
  } catch (err) {
    health.redis = 'error'
    health.redis_error = err instanceof Error ? err.message : 'unknown'
  }

  // Redis is optional (cache layer) — only DB is required for healthy status
  const allOk = health.db === 'ok'
  health.status = allOk ? (health.redis === 'ok' ? 'ok' : 'degraded') : 'error'

  return NextResponse.json(health, {
    status: allOk ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
