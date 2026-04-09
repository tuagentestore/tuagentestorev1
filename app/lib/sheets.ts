/**
 * Google Sheets API — CRM backup via Google Workspace
 *
 * Sheets to create manually:
 * - "Leads Master"     → ID in GOOGLE_SHEET_LEADS_ID
 * - "Demo Sessions"    → ID in GOOGLE_SHEET_DEMOS_ID
 * - "Reservations"     → ID in GOOGLE_SHEET_RESERVATIONS_ID
 *
 * All sheets use the same GOOGLE_SPREADSHEET_ID, different tab names.
 * Set GOOGLE_SPREADSHEET_ID in env.
 */

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

let cachedToken: { access_token: string; expires_at: number } | null = null

async function getSheetsToken(): Promise<string | null> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) return null

  const now = Date.now()
  if (cachedToken && cachedToken.expires_at > now + 60_000) return cachedToken.access_token

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null
  const data = await res.json() as { access_token: string; expires_in: number }
  cachedToken = { access_token: data.access_token, expires_at: now + data.expires_in * 1000 }
  return data.access_token
}

async function appendRow(sheetTab: string, values: (string | number | null)[]): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  if (!spreadsheetId) {
    console.warn('[Sheets] GOOGLE_SPREADSHEET_ID not set, skipping row append')
    return false
  }

  const token = await getSheetsToken()
  if (!token) {
    console.warn('[Sheets] No token available')
    return false
  }

  try {
    const range = `${sheetTab}!A:Z`
    const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [values] }),
    })

    return res.ok
  } catch (err) {
    console.error('[Sheets] Append error:', err instanceof Error ? err.message : err)
    return false
  }
}

async function updateCell(sheetTab: string, range: string, value: string): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  if (!spreadsheetId) return false

  const token = await getSheetsToken()
  if (!token) return false

  try {
    const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(`${sheetTab}!${range}`)}?valueInputOption=USER_ENTERED`
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [[value]] }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function logLeadToSheets(lead: {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  industry?: string
  agentName?: string
  source?: string
  planInterest?: string
}): Promise<void> {
  const now = new Date().toISOString()
  await appendRow('Leads Master', [
    now,
    lead.id,
    lead.name,
    lead.email,
    lead.phone ?? '',
    lead.company ?? '',
    lead.industry ?? '',
    lead.agentName ?? '',
    lead.source ?? 'direct',
    lead.planInterest ?? 'starter',
    'new',  // status
  ])
}

export async function logDemoToSheets(demo: {
  sessionId: string
  agentId: string
  agentName: string
  userEmail?: string
  ip?: string
  messagesUsed?: number
  completed?: boolean
}): Promise<void> {
  const now = new Date().toISOString()
  await appendRow('Demo Sessions', [
    now,
    demo.sessionId,
    demo.agentName,
    demo.userEmail ?? '',
    demo.ip ?? '',
    demo.messagesUsed ?? 0,
    demo.completed ? 'completed' : 'started',
  ])
}

export async function logReservationToSheets(reservation: {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  agentName?: string
  planInterest?: string
  preferredDate?: string
}): Promise<void> {
  const now = new Date().toISOString()
  await appendRow('Reservations Pipeline', [
    now,
    reservation.id,
    reservation.name,
    reservation.email,
    reservation.phone ?? '',
    reservation.company ?? '',
    reservation.agentName ?? '',
    reservation.planInterest ?? 'starter',
    reservation.preferredDate ?? '',
    'new',  // status
  ])
}

export { appendRow, updateCell }
