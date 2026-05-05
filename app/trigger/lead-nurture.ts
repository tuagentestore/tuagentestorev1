import { task, wait, logger } from '@trigger.dev/sdk'

export type LeadNurturePayload = {
  leadId?: string
  name: string
  email: string
  company?: string
  industry?: string
  problem_area?: string
  custom_problem?: string
}

// Espera 3 días desde la captura del lead y envía un email de seguimiento
// Dispara el webhook lead-nurture-d3 en n8n (crear WF con email de reactivación)
export const leadNurture = task({
  id: 'lead-nurture',
  run: async (payload: LeadNurturePayload) => {
    logger.info('Lead nurture queued', { email: payload.email, leadId: payload.leadId })

    // Esperar 3 días exactos
    await wait.for({ days: 3 })

    const n8nBase = process.env.N8N_WEBHOOK_BASE ?? 'https://n8n.srv1565607.hstgr.cloud'

    const res = await fetch(`${n8nBase}/webhook/lead-nurture-d3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        triggered_at: new Date().toISOString(),
        days_since_lead: 3,
      }),
    })

    if (!res.ok) {
      throw new Error(`n8n lead-nurture-d3 webhook error: ${res.status}`)
    }

    logger.info('Nurture email dispatched', { email: payload.email })
    return { sent: true, email: payload.email }
  },
})
