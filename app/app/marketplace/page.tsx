import type { Metadata } from 'next'
import { Suspense } from 'react'
import { query } from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/redis'
import MarketplaceClient, { type Agent } from '@/components/marketplace/MarketplaceClient'

export const metadata: Metadata = {
  title: 'Marketplace de Agentes IA',
  description: 'Explorá, comparás y activás agentes IA para tu empresa. Ventas, soporte, marketing y operaciones en 24 horas.',
}

const CATEGORY_DISPLAY: Record<string, string> = {
  ventas: 'Ventas',
  soporte: 'Soporte',
  marketing: 'Marketing',
  ecommerce: 'E-commerce',
  operaciones: 'Operaciones',
}

async function fetchAgents(): Promise<Agent[]> {
  const cacheKey = 'agents:list:all:all'
  const cached = await cacheGet<Agent[]>(cacheKey)
  if (cached) return cached

  const agents = await query<Agent>(
    `SELECT id, name, slug, tagline, category, capabilities, integrations,
            image_url, pricing_basic, pricing_pro, featured, demo_available
     FROM agents
     WHERE status = 'active'
     ORDER BY featured DESC, sort_order ASC NULLS LAST`,
    []
  )

  const normalized = agents.map(a => ({
    ...a,
    category: CATEGORY_DISPLAY[a.category?.toLowerCase()] ?? a.category,
  }))

  await cacheSet(cacheKey, normalized, 300)
  return normalized
}

export default async function MarketplacePage() {
  const agents = await fetchAgents().catch(() => [])

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MarketplaceClient initialAgents={agents} />
    </Suspense>
  )
}
