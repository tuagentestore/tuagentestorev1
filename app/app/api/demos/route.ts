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

  // Rate limit: 3 demos per IP per hour
  const { allowed } = await rateLimit(`demo:ratelimit:${ip}`, 3, 3600)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas demos. Intenta en 1 hora.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const parsed = CreateDemoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { agent_slug, user_email } = parsed.data

  const agent = await queryOne<{ id: string; name: string; demo_max_messages: number; demo_model: string }>(
    'SELECT id, name, demo_max_messages, demo_model FROM agents WHERE slug = $1 AND demo_available = true AND status = $2',
    [agent_slug, 'active']
  )

  if (!agent) {
    return NextResponse.json({ error: 'Demo no disponible para este agente' }, { status: 404 })
  }

  const session = await queryOne<{ id: string }>(
    `INSERT INTO demo_sessions (agent_id, user_email, ip_address, messages_used, max_messages, status, conversation)
     VALUES ($1, $2, $3, 0, $4, 'active', '[]'::jsonb)
     RETURNING id`,
    [agent.id, user_email ?? null, ip, agent.demo_max_messages]
  )

  // Trigger n8n demo.started (non-blocking)
  triggerN8n('demo-started', {
    session_id: session!.id,
    agent_id: agent.id,
    agent_name: agent.name,
    user_email: user_email ?? null,
    ip,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json({
    session_id: session!.id,
    max_messages: agent.demo_max_messages,
    messages_used: 0,
  }, { status: 201 })
}
