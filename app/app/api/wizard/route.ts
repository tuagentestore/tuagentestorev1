import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { goal, industry, channels, stack, volume } = body

  if (!goal || !industry) {
    return NextResponse.json({ error: 'goal e industry son requeridos' }, { status: 400 })
  }

  // Load active agents for the prompt
  const agents = await query(
    `SELECT name, category, tagline, integrations, pricing_basic, setup_time
     FROM agents WHERE status = 'active' ORDER BY featured DESC LIMIT 20`
  ).catch(() => [])

  const agentsList = agents.map((a: Record<string, unknown>) =>
    `- ${a.name} (${a.category}): ${a.tagline} | Integra: ${(a.integrations as string[])?.join(', ')}`
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const recommendation = JSON.parse(raw)

    // Find agent slugs for CTAs
    const primaryAgent = agents.find((a: Record<string, unknown>) =>
      String(a.name).toLowerCase().includes(recommendation.primary?.name?.toLowerCase() ?? '')
    ) as Record<string, unknown> | undefined

    return NextResponse.json({
      recommendation,
      primary_slug: primaryAgent?.slug ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Error al generar recomendación' }, { status: 500 })
  }
}
