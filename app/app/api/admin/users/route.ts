import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  if (role !== 'admin' && role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const params: unknown[] = [`%${search}%`, `%${search}%`, limit, offset]

  const users = await query(
    `SELECT
       u.id,
       u.email,
       u.full_name,
       u.role,
       u.created_at,
       COALESCE(s.plan_id, 'starter') AS plan,
       s.status AS subscription_status,
       COUNT(ua.id)::int AS agent_count
     FROM users u
     LEFT JOIN subscriptions s ON s.tenant_id = u.tenant_id AND s.status = 'active'
     LEFT JOIN user_agents ua ON ua.tenant_id = u.tenant_id
     WHERE (u.email ILIKE $1 OR u.full_name ILIKE $2)
     GROUP BY u.id, u.email, u.full_name, u.role, u.created_at, s.plan_id, s.status
     ORDER BY u.created_at DESC
     LIMIT $3 OFFSET $4`,
    params
  ).catch(() => [])

  const total = await query(
    `SELECT COUNT(*)::int AS count FROM users
     WHERE email ILIKE $1 OR full_name ILIKE $2`,
    [`%${search}%`, `%${search}%`]
  ).catch(() => [{ count: 0 }])

  return NextResponse.json({
    users,
    total: (total[0] as { count: number })?.count ?? 0,
  })
}
