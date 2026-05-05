import { NextResponse, type NextRequest } from 'next/server'
import { queryOne } from '@/lib/db'

export const dynamic = 'force-dynamic'

const WEBHOOK_BASE = process.env.N8N_WEBHOOK_BASE ?? 'https://n8n.srv1565607.hstgr.cloud'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const {
    problem_area, custom_problem,
    name, email, whatsapp, company, industry, company_size, budget_range,
    channel_origin, wants_call,
  } = body as Record<string, string>

  if (!name || !email) {
    return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
  }

  let leadId: string | undefined
  try {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO reservations
         (user_name, user_email, phone, company, plan_interest, status, metadata)
       VALUES ($1, $2, $3, $4, 'lead', 'new', $5)
       RETURNING id`,
      [
        name, email, whatsapp ?? null, company ?? null,
        JSON.stringify({ problem_area, custom_problem, industry, company_size, budget_range, channel_origin, wants_call }),
      ]
    )
    leadId = row?.id
  } catch (err) {
    // DB unavailable — log and continue; n8n webhooks still capture the lead
    console.error('[leads] DB error (non-fatal):', err)
  }

  const payload = {
    lead_id: leadId, name, email, whatsapp, company, industry,
    problem_area, custom_problem, company_size, budget_range,
    channel_origin, wants_call,
  }

  // Fire-and-forget — no bloqueamos la respuesta
  Promise.all([
    fetch(`${WEBHOOK_BASE}/webhook/lead-created`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((e) => console.warn('[leads] WF01 webhook failed:', e)),
    fetch(`${WEBHOOK_BASE}/webhook/lead-intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((e) => console.warn('[leads] WF15 webhook failed:', e)),
  ])

  return NextResponse.json({
    ok: true,
    id: leadId,
    message: 'Te contactamos en menos de 2 horas',
  }, { status: 201 })
}
