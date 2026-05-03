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
  const months = parseInt(searchParams.get('months') ?? '3')

  const rows = await query<{
    id: string; date: string; channel: string; campaign_name: string
    impressions: number; clicks: number; leads: number
    spend_usd: string; revenue_attributed_usd: string; notes: string
  }>(
    `SELECT * FROM ad_spend
     WHERE date >= CURRENT_DATE - ($1 * INTERVAL '1 month')
     ORDER BY date DESC
     LIMIT 500`,
    [months]
  )

  const summary = await queryOne<{
    total_spend: string; total_revenue: string
    total_leads: number; total_clicks: number
  }>(
    `SELECT
       COALESCE(SUM(spend_usd),0)              AS total_spend,
       COALESCE(SUM(revenue_attributed_usd),0) AS total_revenue,
       COALESCE(SUM(leads),0)                  AS total_leads,
       COALESCE(SUM(clicks),0)                 AS total_clicks
     FROM ad_spend
     WHERE date >= CURRENT_DATE - ($1 * INTERVAL '1 month')`,
    [months]
  )

  return NextResponse.json({ rows, summary })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { date, channel, campaign_name, impressions, clicks, leads, spend_usd, revenue_attributed_usd, notes } = body

  if (!date || !channel || spend_usd === undefined) {
    return NextResponse.json({ error: 'date, channel y spend_usd son requeridos' }, { status: 400 })
  }

  const row = await queryOne<{ id: string }>(
    `INSERT INTO ad_spend (date, channel, campaign_name, impressions, clicks, leads, spend_usd, revenue_attributed_usd, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [date, channel, campaign_name ?? null, impressions ?? 0, clicks ?? 0, leads ?? 0,
     spend_usd, revenue_attributed_usd ?? 0, notes ?? null]
  )

  return NextResponse.json({ ok: true, id: row?.id }, { status: 201 })
}
