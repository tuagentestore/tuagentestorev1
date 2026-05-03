import { NextResponse, type NextRequest } from 'next/server'
import { query, queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  const role   = req.headers.get('x-user-role')
  return secret === process.env.WEBHOOK_SECRET_INTERNAL || role === 'admin' || role === 'manager'
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const platform = searchParams.get('platform')
  const months   = parseInt(searchParams.get('months') ?? '3')

  const conditions: string[] = [`date >= CURRENT_DATE - ($1 * INTERVAL '1 month')`]
  const params: unknown[]    = [months]

  if (status) {
    params.push(status)
    conditions.push(`status = $${params.length}`)
  }
  if (platform) {
    params.push(platform)
    conditions.push(`platform = $${params.length}`)
  }

  const rows = await query<{
    id: string; date: string; platform: string; format: string
    agent_topic: string; hook: string; angle: string; status: string
    impressions: number; clicks: number; leads: number; engagement_rate: string; notes: string
  }>(
    `SELECT * FROM creative_assets WHERE ${conditions.join(' AND ')} ORDER BY date DESC LIMIT 200`,
    params
  )

  const byStatus = await query<{ status: string; count: number }>(
    `SELECT status, COUNT(*) AS count FROM creative_assets
     WHERE date >= CURRENT_DATE - ($1 * INTERVAL '1 month')
     GROUP BY status ORDER BY count DESC`,
    [months]
  )

  return NextResponse.json({ rows, byStatus })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { date, platform, format, agent_topic, hook, angle, status, ad_spend_id, notes } = body

  if (!date || !platform || !format) {
    return NextResponse.json({ error: 'date, platform y format son requeridos' }, { status: 400 })
  }

  const row = await queryOne<{ id: string }>(
    `INSERT INTO creative_assets (date, platform, format, agent_topic, hook, angle, status, ad_spend_id, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [date, platform, format, agent_topic ?? null, hook ?? null, angle ?? null,
     status ?? 'pending', ad_spend_id ?? null, notes ?? null]
  )

  return NextResponse.json({ ok: true, id: row?.id }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, status, impressions, clicks, leads, engagement_rate } = body

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  await queryOne(
    `UPDATE creative_assets
     SET status=$2, impressions=COALESCE($3,impressions), clicks=COALESCE($4,clicks),
         leads=COALESCE($5,leads), engagement_rate=COALESCE($6,engagement_rate)
     WHERE id=$1`,
    [id, status ?? null, impressions ?? null, clicks ?? null, leads ?? null, engagement_rate ?? null]
  )

  return NextResponse.json({ ok: true })
}
