import { NextResponse, type NextRequest } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

  const kpis = {
    leads_today: parseInt(leads?.count ?? '0'),
    demos_24h: parseInt(demos?.count ?? '0'),
    reservations_by_status: reservations.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = parseInt(r.count)
      return acc
    }, {}),
    revenue_month_usd: parseFloat(revenue?.total ?? '0'),
    pipeline_30d: pipeline.map((p) => ({ date: p.date, count: parseInt(p.count) })),
  }

  await cacheSet(cacheKey, kpis, 300) // 5 min cache

  return NextResponse.json(kpis)
}
