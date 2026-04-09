import { NextResponse, type NextRequest } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Acepta JWT admin (vía middleware) O webhook secret interno (para n8n)
  const internalSecret = req.headers.get('x-webhook-secret')
  const role = req.headers.get('x-user-role')
  const isInternal = internalSecret === process.env.WEBHOOK_SECRET_INTERNAL
  if (!isInternal && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cacheKey = 'admin:kpis'
  const cached = await cacheGet(cacheKey)
  if (cached) return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } })

  const [leads, demos, reservations, revenue, pipeline] = await Promise.all([
    // Leads today
    queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM reservations WHERE created_at >= CURRENT_DATE`
    ),
    // Active demos last 24h
    queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM demo_sessions WHERE created_at >= NOW() - INTERVAL '24 hours'`
    ),
    // Reservations by status
    query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) AS count FROM reservations GROUP BY status ORDER BY count DESC`
    ),
    // Revenue this month
    queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payments
       WHERE status = 'succeeded' AND created_at >= DATE_TRUNC('month', NOW())`
    ),
    // Pipeline last 30 days
    query<{ date: string; count: string }>(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM reservations
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    ),
  ])

  const reservationsByStatus = reservations.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = parseInt(r.count)
    return acc
  }, {})
  const reservationsToday = Object.values(reservationsByStatus).reduce((s, n) => s + n, 0)

  const kpis = {
    leads_today: parseInt(leads?.count ?? '0'),
    demos_today: parseInt(demos?.count ?? '0'),
    demos_24h: parseInt(demos?.count ?? '0'),
    reservations_today: reservationsToday,
    reservations_by_status: reservationsByStatus,
    total_leads: parseInt(leads?.count ?? '0'), // cumulative would need separate query
    total_demos: parseInt(demos?.count ?? '0'),
    revenue_month_usd: parseFloat(revenue?.total ?? '0'),
    pipeline_30d: pipeline.map((p) => ({ date: p.date, count: parseInt(p.count) })),
  }

  await cacheSet(cacheKey, kpis, 300) // 5 min cache

  return NextResponse.json(kpis)
}
