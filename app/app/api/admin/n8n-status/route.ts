import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  const role   = req.headers.get('x-user-role')
  return secret === process.env.WEBHOOK_SECRET_INTERNAL || role === 'admin' || role === 'manager'
}

const N8N_BASE = process.env.N8N_BASE_URL ?? 'https://n8n.srv1565607.hstgr.cloud'
const N8N_KEY  = process.env.N8N_API_KEY ?? ''

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!N8N_KEY) {
    return NextResponse.json({ error: 'N8N_API_KEY no configurada', workflows: [], executions: [] }, { status: 200 })
  }

  try {
    const headers = { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' }

    const [wfRes, exRes] = await Promise.all([
      fetch(`${N8N_BASE}/api/v1/workflows?limit=50`, { headers }),
      fetch(`${N8N_BASE}/api/v1/executions?limit=30`, { headers }),
    ])

    const [wfData, exData] = await Promise.all([wfRes.json(), exRes.json()])

    return NextResponse.json({
      workflows:  wfData.data  ?? [],
      executions: exData.data  ?? [],
      total:      wfData.count ?? 0,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Error conectando a n8n', workflows: [], executions: [] }, { status: 200 })
  }
}
