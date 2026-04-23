import { NextResponse, type NextRequest } from 'next/server'
import { queryOne } from '@/lib/db'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  tenant_id: string
  tenant_name: string
  plan: string
  subscription_status: string | null
  avatar_url: string | null
}

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await queryOne<UserProfile>(
    `SELECT u.id, u.email, u.full_name, u.role, u.tenant_id, u.avatar_url,
            t.name AS tenant_name, t.plan,
            s.status AS subscription_status
     FROM users u
     JOIN tenants t ON t.id = u.tenant_id
     LEFT JOIN subscriptions s ON s.tenant_id = t.id AND s.status = 'active'
     WHERE u.id = $1`,
    [userId]
  )

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
