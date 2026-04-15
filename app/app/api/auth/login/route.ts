import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})

interface UserRow {
  id: string
  email: string
  full_name: string
  password_hash: string
  role: string
  tenant_id: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { email, password } = parsed.data

    const user = await queryOne<UserRow>(
      'SELECT id, email, full_name, password_hash, role, tenant_id FROM users WHERE email = $1',
      [email]
    )

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const { accessToken, refreshToken } = await createSession(user.id, {
      sub: user.id,
      tenant: user.tenant_id,
      role: user.role,
      email: user.email,
    })

    // Update last_login
    await queryOne('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.full_name, role: user.role },
    })
    response.cookies.set('access_token', accessToken, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600,
    })
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth/refresh', maxAge: 30 * 24 * 3600,
    })
    return response
  } catch (err) {
    console.error('[Auth] Login error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
