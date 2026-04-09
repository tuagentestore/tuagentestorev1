/**
 * Gmail OAuth2 — Transactional email via Google Workspace
 *
 * Setup:
 * 1. Google Cloud Console → Create OAuth2 credentials (type: Web)
 * 2. Authorize scope: https://www.googleapis.com/auth/gmail.send
 * 3. Get refresh token using OAuth Playground or script
 * 4. Set env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GMAIL_FROM
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'

let cachedToken: { access_token: string; expires_at: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expires_at > now + 60_000) {
    return cachedToken.access_token
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? '',
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gmail OAuth token error: ${err}`)
  }

  const data = await res.json() as { access_token: string; expires_in: number }
  cachedToken = {
    access_token: data.access_token,
    expires_at: now + data.expires_in * 1000,
  }
  return data.access_token
}

function encodeEmailToBase64(raw: string): string {
  return Buffer.from(raw).toString('base64url')
}

function buildRawEmail(opts: {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  from?: string
  replyTo?: string
}): string {
  const from = opts.from ?? process.env.GMAIL_FROM ?? 'TuAgente Store <hola@tuagentestore.com>'
  const boundary = 'boundary_' + Date.now()

  const lines = [
    `From: ${from}`,
    `To: ${opts.to}`,
    `Subject: =?utf-8?B?${Buffer.from(opts.subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    opts.replyTo ? `Reply-To: ${opts.replyTo}` : '',
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    opts.textBody ?? opts.subject,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    opts.htmlBody,
    '',
    `--${boundary}--`,
  ].filter(line => line !== undefined)

  return lines.join('\r\n')
}

export interface EmailOptions {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  replyTo?: string
}

export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
    console.warn('[Gmail] Missing OAuth credentials, skipping email send')
    console.info('[Gmail] Would send to:', opts.to, '|', opts.subject)
    return false
  }

  try {
    const accessToken = await getAccessToken()
    const rawEmail = buildRawEmail(opts)
    const encodedEmail = encodeEmailToBase64(rawEmail)

    const res = await fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Gmail] Send failed:', err)
      return false
    }
    return true
  } catch (err) {
    console.error('[Gmail] Error:', err instanceof Error ? err.message : err)
    return false
  }
}

// ── Pre-built email templates ─────────────────────────────────────────────────

export async function sendLeadWelcome(opts: {
  name: string
  email: string
  agentName?: string
}): Promise<boolean> {
  return sendEmail({
    to: opts.email,
    subject: `Hola ${opts.name}, recibimos tu consulta sobre ${opts.agentName ?? 'TuAgente Store'}`,
    htmlBody: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #070A12; color: #E6EAF2; padding: 40px 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: #2563EB; padding: 10px 20px; border-radius: 8px;">
            <span style="font-size: 20px; font-weight: 700; color: #fff;">TuAgente Store</span>
          </div>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; color: #E6EAF2; margin-bottom: 16px;">
          ¡Hola ${opts.name}!
        </h1>
        <p style="color: #9AA7C0; line-height: 1.6; margin-bottom: 16px;">
          Recibimos tu consulta sobre <strong style="color: #60A5FA;">${opts.agentName ?? 'nuestros agentes IA'}</strong>.
          Un miembro de nuestro equipo se pondrá en contacto contigo en las próximas horas.
        </p>
        <p style="color: #9AA7C0; line-height: 1.6; margin-bottom: 32px;">
          Mientras tanto, podés explorar más agentes en nuestro catálogo.
        </p>
        <a href="https://tuagentestore.com/agents" style="display: inline-block; background: linear-gradient(135deg, #2563EB, #4F46E5); color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Ver Catálogo de Agentes
        </a>
        <hr style="border: none; border-top: 1px solid #1F2A44; margin: 32px 0;">
        <p style="font-size: 12px; color: #9AA7C0;">
          © 2025 TuAgente Store · <a href="https://tuagentestore.com" style="color: #60A5FA;">tuagentestore.com</a>
        </p>
      </div>
    `,
    textBody: `Hola ${opts.name}, recibimos tu consulta. Te contactaremos pronto. Visita https://tuagentestore.com`,
  })
}

export async function sendReservationConfirmation(opts: {
  name: string
  email: string
  agentName: string
  preferredDate?: string
}): Promise<boolean> {
  return sendEmail({
    to: opts.email,
    subject: `Confirmación de reserva — ${opts.agentName}`,
    htmlBody: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #070A12; color: #E6EAF2; padding: 40px 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="background: #2563EB; display: inline-block; padding: 10px 20px; border-radius: 8px;">
            <span style="font-size: 20px; font-weight: 700; color: #fff;">TuAgente Store</span>
          </div>
        </div>
        <div style="background: rgba(37,99,235,0.1); border: 1px solid #1F2A44; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #60A5FA; margin: 0 0 8px;">Reserva confirmada</h2>
          <p style="color: #9AA7C0; margin: 0;">Agente: <strong style="color: #E6EAF2;">${opts.agentName}</strong></p>
          ${opts.preferredDate ? `<p style="color: #9AA7C0; margin: 4px 0 0;">Fecha preferida: <strong style="color: #E6EAF2;">${opts.preferredDate}</strong></p>` : ''}
        </div>
        <p style="color: #9AA7C0; line-height: 1.6;">
          Hola <strong style="color: #E6EAF2;">${opts.name}</strong>, tu reserva fue registrada exitosamente.
          Nuestro equipo revisará tu solicitud y te contactará para coordinar los próximos pasos.
        </p>
        <p style="color: #9AA7C0; line-height: 1.6; margin-top: 16px;">
          <strong>¿Qué sigue?</strong><br>
          1. Revisión de tu solicitud (24-48h)<br>
          2. Llamada de 30min para entender tu negocio<br>
          3. Propuesta personalizada y acceso al agente
        </p>
        <hr style="border: none; border-top: 1px solid #1F2A44; margin: 32px 0;">
        <p style="font-size: 12px; color: #9AA7C0;">© 2025 TuAgente Store · hola@tuagentestore.com</p>
      </div>
    `,
    textBody: `Hola ${opts.name}, tu reserva para ${opts.agentName} fue confirmada. Te contactaremos pronto.`,
  })
}

export async function sendAdminLeadAlert(opts: {
  name: string
  email: string
  phone?: string
  company?: string
  agentName?: string
  reservationId: string
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'operaciones@tuagentestore.com'
  return sendEmail({
    to: adminEmail,
    subject: `[LEAD] ${opts.name} — ${opts.agentName ?? 'Sin agente específico'}`,
    htmlBody: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0B1220; color: #E6EAF2; padding: 24px; border-radius: 8px; border: 1px solid #1F2A44;">
        <h2 style="color: #60A5FA; margin: 0 0 16px;">Nuevo Lead — TuAgente Store</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #9AA7C0; padding: 4px 0;">Nombre:</td><td style="color: #E6EAF2; padding: 4px 0;">${opts.name}</td></tr>
          <tr><td style="color: #9AA7C0; padding: 4px 0;">Email:</td><td style="color: #60A5FA; padding: 4px 0;">${opts.email}</td></tr>
          <tr><td style="color: #9AA7C0; padding: 4px 0;">Teléfono:</td><td style="color: #E6EAF2; padding: 4px 0;">${opts.phone ?? '—'}</td></tr>
          <tr><td style="color: #9AA7C0; padding: 4px 0;">Empresa:</td><td style="color: #E6EAF2; padding: 4px 0;">${opts.company ?? '—'}</td></tr>
          <tr><td style="color: #9AA7C0; padding: 4px 0;">Agente:</td><td style="color: #A78BFA; padding: 4px 0;">${opts.agentName ?? '—'}</td></tr>
          <tr><td style="color: #9AA7C0; padding: 4px 0;">ID:</td><td style="color: #E6EAF2; padding: 4px 0; font-size: 12px;">${opts.reservationId}</td></tr>
        </table>
        <div style="margin-top: 20px;">
          <a href="https://tuagentestore.com/admin/reservations" style="background: #2563EB; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Ver en Admin →
          </a>
        </div>
      </div>
    `,
    textBody: `Nuevo lead: ${opts.name} (${opts.email}) - ${opts.agentName ?? 'General'} - ID: ${opts.reservationId}`,
  })
}

export async function sendDemoFollowup(opts: {
  email: string
  agentName: string
}): Promise<boolean> {
  return sendEmail({
    to: opts.email,
    subject: `¿Qué te pareció la demo de ${opts.agentName}?`,
    htmlBody: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #070A12; color: #E6EAF2; padding: 40px 24px; border-radius: 12px;">
        <h2 style="color: #E6EAF2;">Probaste <span style="color: #60A5FA;">${opts.agentName}</span></h2>
        <p style="color: #9AA7C0; line-height: 1.6;">
          ¿Qué te pareció? Si querés ver cómo funciona en tu negocio real, podemos agendar una demo personalizada de 30 minutos sin costo.
        </p>
        <a href="https://tuagentestore.com/agents" style="display: inline-block; background: linear-gradient(135deg, #2563EB, #4F46E5); color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          Reservar demo personalizada
        </a>
        <hr style="border: none; border-top: 1px solid #1F2A44; margin: 32px 0;">
        <p style="font-size: 12px; color: #9AA7C0;">© 2025 TuAgente Store</p>
      </div>
    `,
    textBody: `¿Qué te pareció la demo de ${opts.agentName}? Reservá una demo personalizada en https://tuagentestore.com/agents`,
  })
}
