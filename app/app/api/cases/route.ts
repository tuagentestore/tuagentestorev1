import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry')
  const featured = searchParams.get('featured')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  const conditions: string[] = []
  const params: unknown[] = []

  if (industry) {
    params.push(industry)
    conditions.push(`industry = $${params.length}`)
  }
  if (featured === 'true') {
    conditions.push('featured = TRUE')
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.push(limit)

  const cases = await query(
    `SELECT id, title, slug, industry, stack, setup_time,
            primary_metric_label, primary_metric_value,
            summary_bullets, confidentiality, featured, is_beta,
            before_after, created_at
     FROM cases
     ${where}
     ORDER BY featured DESC, created_at DESC
     LIMIT $${params.length}`,
    params
  ).catch(() => [])

  return NextResponse.json({ cases })
}
