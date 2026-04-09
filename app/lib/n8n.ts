const N8N_BASE = process.env.N8N_WEBHOOK_BASE ?? `https://auto.${process.env.DOMAIN}/`

export async function triggerN8n(
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const url = `${N8N_BASE.replace(/\/$/, '')}/webhook/${event}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET_INTERNAL ?? '',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    })
    if (!res.ok) {
      console.error(`[n8n] Webhook ${event} failed: ${res.status}`)
    }
  } catch (err) {
    // Non-blocking: n8n failures should not break the main flow
    console.error(`[n8n] Webhook ${event} error:`, err instanceof Error ? err.message : err)
  }
}
