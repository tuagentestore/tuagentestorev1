import { NextResponse, type NextRequest } from 'next/server'
import { cacheGet, cacheSet } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'hub:metrics'
const CACHE_TTL = 3600 // 1 hour

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-webhook-secret')
  const role = req.headers.get('x-user-role')
  return (
    secret === process.env.WEBHOOK_SECRET_INTERNAL ||
    role === 'admin' ||
    role === 'manager'
  )
}

// POST — recibe métricas desde WF17 (n8n) y las guarda en Redis
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  await cacheSet(CACHE_KEY, body, CACHE_TTL)
  return NextResponse.json({ ok: true, cachedAt: new Date().toISOString() })
}

// GET — devuelve las métricas almacenadas (para el dashboard web)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const metrics = await cacheGet(CACHE_KEY)
  if (!metrics) {
    return NextResponse.json(
      { error: 'No metrics available yet. Trigger hub-sync from Apps Script.' },
      { status: 404 }
    )
  }

  return NextResponse.json(metrics, {
    headers: { 'X-Cache': 'HIT', 'Cache-Control': 'no-store' }
  })
}
