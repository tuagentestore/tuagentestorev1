import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'

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
