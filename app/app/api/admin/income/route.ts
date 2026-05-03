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
    id: string; date: string; client_name: string; agent_sold: string
    plan: string; amount_usd: string; type: string; channel: string; notes: string
  }>(
    `SELECT * FROM income_records
     WHERE date >= CURRENT_DATE - ($1 * INTERVAL '1 month')
     ORDER BY date DESC
     LIMIT 500`,
    [months]
  )

  const summary = await queryOne<{
    total_income: string; avg_ticket: string; count: number
  }>(
    `SELECT
       COALESCE(SUM(amount_usd),0) AS total_income,
       COALESCE(AVG(amount_usd),0) AS avg_ticket,
       COUNT(*)                    AS count
     FROM income_records
     WHERE date >= CURRENT_DATE - ($1 * INTERVAL '1 month')
       AND type != 'refund'`,
    [months]
  )

  const byChannel = await query<{ channel: string; total: string; count: number }>(
    `SELECT channel, SUM(amount_usd) AS total, COUNT(*) AS count
     FROM income_records
     WHERE date >= CURRENT_DATE - ($1 * INTERVAL '1 month')
       AND type != 'refund'
     GROUP BY channel ORDER BY total DESC`,
    [months]
  )

  return NextResponse.json({ rows, summary, byChannel })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { date, client_name, agent_sold, plan, amount_usd, type, channel, reservation_id, notes } = body

  if (!date || amount_usd === undefined) {
    return NextResponse.json({ error: 'date y amount_usd son requeridos' }, { status: 400 })
  }

  const row = await queryOne<{ id: string }>(
    `INSERT INTO income_records (date, client_name, agent_sold, plan, amount_usd, type, channel, reservation_id, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [date, client_name ?? null, agent_sold ?? null, plan ?? null, amount_usd,
     type ?? 'implementation', channel ?? null, reservation_id ?? null, notes ?? null]
  )

  return NextResponse.json({ ok: true, id: row?.id }, { status: 201 })
}
