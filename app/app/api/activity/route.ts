import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  const activities = await query(
    `SELECT id, activity_type, page, agent_id, case_id, metadata, created_at
     FROM user_activity
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  ).catch(() => [])

  return NextResponse.json({ activities })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { activity_type, page, agent_id, case_id, metadata, session_id } = body

  if (!activity_type) {
    return NextResponse.json({ error: 'activity_type requerido' }, { status: 400 })
  }

  const userId = req.headers.get('x-user-id') ?? null
  const tenantId = req.headers.get('x-tenant-id') ?? null
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? null

  await query(
    `INSERT INTO user_activity
       (user_id, tenant_id, session_id, activity_type, page, agent_id, case_id, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [userId, tenantId, session_id, activity_type, page, agent_id ?? null, case_id ?? null, metadata ?? {}, ip]
  ).catch(() => null)

  return NextResponse.json({ ok: true })
}
