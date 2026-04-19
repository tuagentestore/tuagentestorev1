import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { chatWithRetry } from '@/lib/openai'

// Static fallback: used when DB is empty or unavailable
const STATIC_AGENTS = [
  { name: 'Sales AI Closer',           slug: 'sales-ai-closer',           category: 'Ventas',      tagline: 'Cierra más ventas, automatiza el seguimiento de leads',         integrations: ['HubSpot', 'WhatsApp', 'Gmail', 'Calendly'] },
  { name: 'AI Support Agent',          slug: 'ai-support-agent',          category: 'Soporte',     tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde',         integrations: ['Zendesk', 'WhatsApp', 'Intercom', 'Instagram DM'] },
  { name: 'AI Lead Engine',            slug: 'ai-lead-engine',            category: 'Ventas',      tagline: 'Genera y califica leads 24/7 en piloto automático',              integrations: ['Facebook Ads', 'Google Ads', 'HubSpot', 'Pipedrive'] },
  { name: 'Marketing AI Agent',        slug: 'marketing-ai-agent',        category: 'Marketing',   tagline: 'Automatiza reportes, contenido y campañas de marketing',          integrations: ['Google Analytics', 'Meta Ads', 'Mailchimp', 'Notion'] },
  { name: 'E-Commerce Agent',          slug: 'ecommerce-agent',           category: 'E-commerce',  tagline: 'Recupera carritos, cross-sell y retención automatizada',           integrations: ['Shopify', 'WooCommerce', 'MercadoLibre', 'WhatsApp'] },
  { name: 'Appointment Setting Agent', slug: 'appointment-setting-agent', category: 'Ventas',      tagline: 'Agenda reuniones y demos de forma completamente automática',       integrations: ['Calendly', 'Google Calendar', 'WhatsApp', 'Zoom'] },
  { name: 'Operations AI Agent',       slug: 'operations-ai-agent',       category: 'Operaciones', tagline: 'Automatiza procesos internos, reportes y flujos operativos',       integrations: ['Notion', 'Slack', 'Google Sheets', 'n8n'] },
] as const

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { goal, industry, channels, stack, volume } = body

  if (!goal || !industry) {
    return NextResponse.json({ error: 'goal e industry son requeridos' }, { status: 400 })
  }

  // Load active agents from DB; fall back to static list when DB is empty or unavailable
  const dbAgents = await query(
    `SELECT name, slug, category, tagline, integrations
     FROM agents WHERE status = 'active' ORDER BY featured DESC LIMIT 20`
  ).catch(() => []) as Array<{ name: string; slug: string; category: string; tagline: string; integrations: string[] }>

  const agents = dbAgents.length > 0 ? dbAgents : [...STATIC_AGENTS]

  const agentsList = agents.map(a =>
    `- ${a.name} (${a.category}): ${a.tagline} | Integra: ${a.integrations?.join(', ')}`
  ).join('\n')

  const prompt = `Analizá este perfil empresarial y recomendá la mejor combinación de agentes IA:
- Objetivo principal: ${goal}
- Industria: ${industry}
- Canales actuales: ${(channels ?? []).join(', ') || 'No especificado'}
- Stack tecnológico: ${(stack ?? []).join(', ') || 'No especificado'}
- Volumen de interacciones: ${volume || 'No especificado'}

Agentes disponibles en TuAgenteStore:
${agentsList}

Generá una respuesta en JSON con esta estructura exacta:
{
  "primary": {
    "name": "nombre del agente principal",
    "reason": "por qué es el ideal para este perfil",
    "roi_30d": "ROI estimado a 30 días",
    "roi_90d": "ROI estimado a 90 días"
  },
  "secondary": {
    "name": "nombre del agente complementario o null",
    "reason": "por qué complementa al principal"
  },
  "implementation_plan": [
    {"step": 1, "title": "...", "description": "..."},
    {"step": 2, "title": "...", "description": "..."},
    {"step": 3, "title": "...", "description": "..."}
  ],
  "recommended_stack": ["herramienta1", "herramienta2"],
  "summary": "resumen ejecutivo de 2 oraciones de por qué esta combinación es ideal"
}`

  try {
    const result = await chatWithRetry(
      [{ role: 'user', content: prompt }],
      'gpt-4o-mini',
      600,
    )

    const recommendation = JSON.parse(result.content)

    // Match primary slug — exact name first, then partial match
    const primaryName = (recommendation.primary?.name ?? '').toLowerCase().trim()
    const primaryAgent =
      agents.find(a => a.name.toLowerCase() === primaryName) ??
      agents.find(a =>
        a.name.toLowerCase().includes(primaryName) ||
        primaryName.includes(a.name.toLowerCase())
      )

    return NextResponse.json({
      recommendation,
      primary_slug: primaryAgent?.slug ?? null,
    })
  } catch (err) {
    console.error('[Wizard] Error:', err)
    return NextResponse.json({ error: 'Error al generar recomendación. Intentá de nuevo.' }, { status: 500 })
  }
}
