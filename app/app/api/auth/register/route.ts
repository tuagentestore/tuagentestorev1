import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { query, queryOne, transaction } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'
import { triggerN8n } from '@/lib/n8n'

const RegisterSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  company: z.string().optional(),
  role: z.enum(['buyer', 'vendor']).default('buyer'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password, company, role } = parsed.data

    // Check if email already exists
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const result = await transaction(async (q) => {
      // Create tenant
      const [tenant] = await q<{ id: string }>(
        `INSERT INTO tenants (name, slug, plan)
         VALUES ($1, $2, 'starter')
         RETURNING id`,
        [company ?? name, email.split('@')[0] + '-' + Date.now()]
      )

      // Create user
      const [user] = await q<{ id: string; email: string }>(
        `INSERT INTO users (email, password_hash, full_name, role, tenant_id, email_verified)
         VALUES ($1, $2, $3, $4, $5, false)
         RETURNING id, email`,
        [email, passwordHash, name, role === 'vendor' ? 'vendor' : 'member', tenant.id]
      )

      return { userId: user.id, tenantId: tenant.id, email: user.email }
    })

    const { accessToken, refreshToken } = await createSession(result.userId, {
      sub: result.userId,
      tenant: result.tenantId,
      role: role === 'vendor' ? 'vendor' : 'member',
      email,
    })

    // Trigger n8n (non-blocking)
    triggerN8n('user-created', {
      user_id: result.userId,
      email,
      name,
      tenant_id: result.tenantId,
      role,
      source: 'registration',
    })

    const response = NextResponse.json(
      { success: true, user: { id: result.userId, email, name } },
      { status: 201 }
    )
    response.cookies.set('access_token', accessToken, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600,
    })
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth/refresh', maxAge: 30 * 24 * 3600,
    })
    return response
  } catch (err) {
    console.error('[Auth] Register error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
