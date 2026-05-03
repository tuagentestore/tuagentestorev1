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
    id: string; month: string; category: string; item: string
    amount_usd: string; recurring: boolean; notes: string
  }>(
    `SELECT * FROM operating_costs
     WHERE month >= date_trunc('month', CURRENT_DATE - ($1 * INTERVAL '1 month'))
     ORDER BY month DESC, category`,
    [months]
  )

  const byCategory = await query<{ category: string; total: string }>(
    `SELECT category, SUM(amount_usd) AS total
     FROM operating_costs
     WHERE month >= date_trunc('month', CURRENT_DATE - ($1 * INTERVAL '1 month'))
     GROUP BY category ORDER BY total DESC`,
    [months]
  )

  const totalCost = await queryOne<{ total: string }>(
    `SELECT COALESCE(SUM(amount_usd),0) AS total FROM operating_costs
     WHERE month >= date_trunc('month', CURRENT_DATE - ($1 * INTERVAL '1 month'))`,
    [months]
  )

  return NextResponse.json({ rows, byCategory, totalCost: totalCost?.total ?? '0' })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { month, category, item, amount_usd, recurring, notes } = body

  if (!month || !category || !item || amount_usd === undefined) {
    return NextResponse.json({ error: 'month, category, item y amount_usd son requeridos' }, { status: 400 })
  }

  const row = await queryOne<{ id: string }>(
    `INSERT INTO operating_costs (month, category, item, amount_usd, recurring, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [month, category, item, amount_usd, recurring ?? false, notes ?? null]
  )

  return NextResponse.json({ ok: true, id: row?.id }, { status: 201 })
}
