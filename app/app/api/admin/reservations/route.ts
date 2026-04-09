import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const conditions: string[] = []
  const params: unknown[] = []

  if (status) {
    params.push(status)
    conditions.push(`r.status = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  params.push(limit, offset)

  const reservations = await query(
    `SELECT r.id, r.user_name, r.user_email, r.phone, r.company,
            r.status, r.plan_interest, r.preferred_date, r.scheduled_at,
            r.admin_notes, r.created_at, r.updated_at,
            a.name AS agent_name, a.slug AS agent_slug
     FROM reservations r
     LEFT JOIN agents a ON a.id = r.agent_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return NextResponse.json({ reservations })
}
