import { schedules, logger } from '@trigger.dev/sdk'

// Cron: 11:00 UTC = 08:00 ART (UTC-3)
// Reporta KPIs del día anterior por email vía n8n WF Daily Report
export const dailyReport = schedules.task({
  id: 'daily-report',
  cron: '0 11 * * *',
  run: async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tuagentestore.com'
    const webhookSecret = process.env.WEBHOOK_SECRET_INTERNAL ?? ''
    const n8nBase = process.env.N8N_WEBHOOK_BASE ?? 'https://n8n.srv1565607.hstgr.cloud'

    // Fetch KPIs from admin dashboard (authenticated via internal secret)
    const kpisRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { 'x-webhook-secret': webhookSecret },
    })

    if (!kpisRes.ok) {
      throw new Error(`Dashboard API error: ${kpisRes.status} ${await kpisRes.text()}`)
    }

    const kpis = await kpisRes.json()
    logger.info('KPIs fetched', kpis)

    // Fire n8n daily-report webhook (create WF in n8n to send the email)
    const reportPayload = {
      date: new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
      leads_today: kpis.leads_today ?? 0,
      demos_today: kpis.demos_today ?? 0,
      reservations_today: kpis.reservations_today ?? 0,
      revenue_month_usd: kpis.revenue_month_usd ?? 0,
      reservations_by_status: kpis.reservations_by_status ?? {},
    }

    const n8nRes = await fetch(`${n8nBase}/webhook/daily-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportPayload),
    })

    if (!n8nRes.ok) {
      throw new Error(`n8n daily-report webhook error: ${n8nRes.status}`)
    }

    logger.info('Daily report sent', reportPayload)
    return reportPayload
  },
})
