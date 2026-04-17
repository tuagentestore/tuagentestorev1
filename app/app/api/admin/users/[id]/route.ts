import { NextResponse, type NextRequest } from 'next/server'
import { queryOne } from '@/lib/db'

const ALLOWED_ROLES = ['admin', 'manager', 'community_manager', 'support', 'user']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const callerRole = req.headers.get('x-user-role')
  const callerId = req.headers.get('x-user-id')
  if (callerRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { role } = body

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  // Prevent self-demotion
  if (id === callerId && role !== 'admin') {
    return NextResponse.json({ error: 'No podés cambiar tu propio rol de admin' }, { status: 400 })
  }

  const updated = await queryOne(
    `UPDATE users SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, full_name, role`,
    [role, id]
  ).catch(() => null)

  if (!updated) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, user: updated })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  if (role !== 'admin' && role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const user = await queryOne(
    `SELECT u.id, u.email, u.full_name, u.role, u.created_at,
            COALESCE(s.plan_id, 'starter') AS plan,
            s.status AS subscription_status
     FROM users u
     LEFT JOIN subscriptions s ON s.tenant_id = u.tenant_id AND s.status = 'active'
     WHERE u.id = $1`,
    [id]
  ).catch(() => null)

  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json({ user })
}
