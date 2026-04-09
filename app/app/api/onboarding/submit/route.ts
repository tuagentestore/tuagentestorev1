import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { triggerN8n } from '@/lib/n8n'

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const tenantId = req.headers.get('x-tenant-id')
  if (!userId || !tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { industry, channels, lead_volume, main_problem, current_tools, urgency, phone, company } = body

  // Guardar onboarding data en DB
  await query(
    `INSERT INTO onboarding_submissions
       (tenant_id, user_id, industry, channels, lead_volume, main_problem, current_tools, urgency, phone, company, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     ON CONFLICT (tenant_id) DO UPDATE SET
       industry = EXCLUDED.industry,
       channels = EXCLUDED.channels,
       lead_volume = EXCLUDED.lead_volume,
       main_problem = EXCLUDED.main_problem,
       current_tools = EXCLUDED.current_tools,
       urgency = EXCLUDED.urgency,
       phone = EXCLUDED.phone,
       company = EXCLUDED.company,
       updated_at = NOW()`,
    [tenantId, userId, industry, JSON.stringify(channels), lead_volume, main_problem, current_tools, urgency, phone, company]
  ).catch(() => null) // tabla puede no existir en dev

  // Actualizar tenant con datos de onboarding
  await query(
    `UPDATE tenants SET industry = $1, metadata = metadata || $2 WHERE id = $3`,
    [industry, JSON.stringify({ channels, lead_volume, urgency, onboarding_done: true }), tenantId]
  ).catch(() => null)

  // Disparar n8n workflow (workflow 05 con status "onboarding_complete")
  await triggerN8n('reservation-updated', {
    tenant_id: tenantId,
    user_id: userId,
    new_status: 'onboarding_complete',
    data: { industry, channels, lead_volume, main_problem, urgency, phone, company },
  })

  return NextResponse.json({ status: 'ok' })
}
