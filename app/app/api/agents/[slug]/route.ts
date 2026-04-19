import { NextResponse, type NextRequest } from 'next/server'
import { queryOne } from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cacheKey = `agent:detail:${slug}`

  const cached = await cacheGet(cacheKey)
  if (cached) {
    return NextResponse.json({ agent: cached }, { headers: { 'X-Cache': 'HIT' } })
  }

  const agent = await queryOne(
    `SELECT id, name, slug, tagline, description, category,
            capabilities, integrations, use_cases, faqs,
            image_url, pricing_basic, pricing_pro, pricing_enterprise,
            setup_time AS setup_time_hours, featured, demo_available,
            demo_max_messages, demo_model
     FROM agents
     WHERE slug = $1 AND status = 'active'`,
    [slug]
  )

  if (!agent) {
    return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
  }

  await cacheSet(cacheKey, agent, 600) // 10 min cache

  return NextResponse.json({ agent })
}
