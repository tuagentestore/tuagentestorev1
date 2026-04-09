import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { triggerN8n } from '@/lib/n8n'

const ReservationSchema = z.object({
  agent_id: z.string().uuid().optional(),
  agent_slug: z.string().optional(),
  user_name: z.string().min(2).max(255),
  user_email: z.string().email().toLowerCase(),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  use_case: z.string().optional(),
  plan_interest: z.enum(['starter', 'pro', 'enterprise']).default('starter'),
  preferred_date: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  demo_session_id: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ReservationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const d = parsed.data

    // Resolve agent_id from slug if provided
    let agentId = d.agent_id
    let agentName = 'General'
    if (!agentId && d.agent_slug) {
      const agent = await queryOne<{ id: string; name: string }>(
        'SELECT id, name FROM agents WHERE slug = $1',
        [d.agent_slug]
      )
      if (agent) {
        agentId = agent.id
        agentName = agent.name
      }
    }

    const reservation = await queryOne<{ id: string }>(
      `INSERT INTO reservations
         (agent_id, user_name, user_email, phone, company, industry, use_case,
          plan_interest, preferred_date, utm_source, utm_medium, utm_campaign,
          demo_session_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'new')
       RETURNING id`,
      [
        agentId ?? null,
        d.user_name,
        d.user_email,
        d.phone ?? null,
        d.company ?? null,
        d.industry ?? null,
        d.use_case ?? null,
        d.plan_interest,
        d.preferred_date ?? null,
        d.utm_source ?? null,
        d.utm_medium ?? null,
        d.utm_campaign ?? null,
        d.demo_session_id ?? null,
      ]
    )

    // Trigger n8n workflows (non-blocking)
    triggerN8n('lead-created', {
      name: d.user_name,
      email: d.user_email,
      phone: d.phone,
      company: d.company,
      industry: d.industry,
      source: d.utm_source ?? 'direct',
      agent_interest: agentName,
    })

    triggerN8n('reservation-created', {
      reservation_id: reservation!.id,
      name: d.user_name,
      email: d.user_email,
      phone: d.phone,
      company: d.company,
      agent_id: agentId,
      agent_name: agentName,
      preferred_date: d.preferred_date,
      plan_interest: d.plan_interest,
    })

    return NextResponse.json({ success: true, reservation_id: reservation!.id }, { status: 201 })
  } catch (err) {
    console.error('[Reservations] Error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
