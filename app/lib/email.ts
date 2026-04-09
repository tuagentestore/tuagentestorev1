const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY ?? ''
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL ?? 'noreply@tuagentestore.com'
const POSTMARK_API = 'https://api.postmarkapp.com'

interface SendEmailOptions {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  tag?: string
  replyTo?: string
}

interface SendTemplateOptions {
  to: string
  templateAlias: string
  templateModel: Record<string, unknown>
  tag?: string
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  if (!POSTMARK_API_KEY) {
    console.warn('[Email] POSTMARK_API_KEY not set, skipping send')
    return false
  }
  try {
    const res = await fetch(`${POSTMARK_API}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_API_KEY,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: opts.to,
        Subject: opts.subject,
        HtmlBody: opts.htmlBody,
        TextBody: opts.textBody ?? opts.subject,
        MessageStream: 'outbound',
        Tag: opts.tag,
        ReplyTo: opts.replyTo,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[Email] Send error:', err instanceof Error ? err.message : err)
    return false
  }
}

export async function sendTemplate(opts: SendTemplateOptions): Promise<boolean> {
  if (!POSTMARK_API_KEY) {
    console.warn('[Email] POSTMARK_API_KEY not set, skipping template send')
    return false
  }
  try {
    const res = await fetch(`${POSTMARK_API}/email/withTemplate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_API_KEY,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: opts.to,
        TemplateAlias: opts.templateAlias,
        TemplateModel: opts.templateModel,
        MessageStream: 'outbound',
        Tag: opts.tag,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[Email] Template error:', err instanceof Error ? err.message : err)
    return false
  }
}
