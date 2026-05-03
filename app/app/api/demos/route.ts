import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { rateLimit } from '@/lib/redis'
import { triggerN8n } from '@/lib/n8n'

const CreateDemoSchema = z.object({
  agent_slug: z.string(),
  user_email: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  // Rate limit: 3 demos per IP per hour (falla abierta si Redis no responde)
  try {
    const { allowed } = await rateLimit(`demo:ratelimit:${ip}`, 3, 3600)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiadas demos. Intenta en 1 hora.' },
        { status: 429 }
      )
    }
  } catch (err) {
    console.warn('[demos] rateLimit error (skipping):', err)
    // Fail open — no bloqueamos la demo si Redis falla
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const parsed = CreateDemoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { agent_slug, user_email } = parsed.data

  let agent: { id: string; name: string; demo_max_messages: number; demo_model: string } | null
  try {
    agent = await queryOne(
      'SELECT id, name, demo_max_messages, demo_model FROM agents WHERE slug = $1 AND demo_available = true AND status = $2',
      [agent_slug, 'active']
    )
  } catch (err) {
    console.error('[demos] DB agent lookup error:', err)
    return NextResponse.json({ error: 'Error al iniciar la demo' }, { status: 500 })
  }

  if (!agent) {
    return NextResponse.json({ error: 'Demo no disponible para este agente' }, { status: 404 })
  }

  let session: { id: string } | null
  try {
    session = await queryOne<{ id: string }>(
      `INSERT INTO demo_sessions (agent_id, user_email, ip_address, messages_used, max_messages, status, conversation)
       VALUES ($1, $2, $3, 0, $4, 'active', '[]'::jsonb)
       RETURNING id`,
      [agent.id, user_email ?? null, ip, agent.demo_max_messages]
    )
  } catch (err) {
    console.error('[demos] DB session create error:', err)
    return NextResponse.json({ error: 'No se pudo crear la sesión de demo' }, { status: 500 })
  }

  if (!session) {
    return NextResponse.json({ error: 'No se pudo crear la sesión de demo' }, { status: 500 })
  }

  triggerN8n('demo-started', {
    session_id: session.id,
    agent_id: agent.id,
    agent_name: agent.name,
    user_email: user_email ?? null,
    ip,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json({
    session_id: session.id,
    max_messages: agent.demo_max_messages,
    messages_used: 0,
  }, { status: 201 })
}
