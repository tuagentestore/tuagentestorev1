import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const tenantId = req.headers.get('x-tenant-id')

  if (!userId || !tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get active subscription to know which agents are accessible
    const subscription = await queryOne<{
      id: string
      plan: string
      status: string
    }>(`
      SELECT id, plan, status
      FROM subscriptions
      WHERE tenant_id = $1 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `, [tenantId])

    // Get agents linked to this tenant via user_agents table (if it exists)
    // Fall back to subscription-based access
    const agents = await query<{
      id: string
      agent_name: string
      status: string
      activation_date: string
      actions_count: number
      last_activity: string | null
    }>(`
      SELECT
        a.id,
        a.name AS agent_name,
        COALESCE(ua.status, 'inactive') AS status,
        COALESCE(ua.activated_at::text, NOW()::text) AS activation_date,
        COALESCE(ua.actions_count, 0) AS actions_count,
        ua.last_activity_at AS last_activity
      FROM agents a
      LEFT JOIN user_agents ua ON ua.agent_id = a.id AND ua.tenant_id = $1
      WHERE ua.tenant_id = $1
      ORDER BY ua.activated_at DESC
    `, [tenantId])

    return NextResponse.json({
      agents: agents ?? [],
      subscription: subscription ?? null,
    })
  } catch (error) {
    // Table user_agents may not exist yet — return empty gracefully
    console.error('[user-agents] DB error:', error)
    return NextResponse.json({ agents: [], subscription: null })
  }
}
