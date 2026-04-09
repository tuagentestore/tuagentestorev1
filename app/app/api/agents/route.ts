import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/redis'

export const dynamic = 'force-dynamic'

interface AgentRow {
  id: string
  name: string
  slug: string
  tagline: string
  category: string
  capabilities: string[]
  integrations: string[]
  image_url: string | null
  pricing_basic: number
  pricing_pro: number
  featured: boolean
  demo_available: boolean
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')

  const cacheKey = `agents:list:${category ?? 'all'}:${featured ?? 'all'}`
  const cached = await cacheGet<AgentRow[]>(cacheKey)
  if (cached) {
    return NextResponse.json({ agents: cached }, { headers: { 'X-Cache': 'HIT' } })
  }

  const conditions: string[] = ["status = 'active'"]
  const params: unknown[] = []

  if (category) {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }
  if (featured === 'true') {
    conditions.push('featured = true')
  }

  const whereClause = conditions.join(' AND ')

  const agents = await query<AgentRow>(
    `SELECT id, name, slug, tagline, category, capabilities, integrations,
            image_url, pricing_basic, pricing_pro, featured, demo_available
     FROM agents
     WHERE ${whereClause}
     ORDER BY featured DESC, sort_order ASC NULLS LAST`,
    params
  )

  await cacheSet(cacheKey, agents, 300) // 5 min cache

  return NextResponse.json({ agents })
}
