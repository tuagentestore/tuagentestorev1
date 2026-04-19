import { NextResponse, type NextRequest } from 'next/server'
import { queryOne, query } from '@/lib/db'
import { createSession } from '@/lib/auth'

interface GoogleTokens {
  access_token: string
  id_token: string
}

interface GoogleProfile {
  sub: string
  email: string
  email_verified: boolean
  name: string
  picture: string
}

interface UserRow {
  id: string
  email: string
  full_name: string
  role: string
  tenant_id: string
  status?: string
}

async function exchangeCode(code: string): Promise<GoogleTokens> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error('Token exchange failed')
  return res.json()
}

async function getProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Profile fetch failed')
  return res.json()
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tuagentestore.com'

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const storedState = req.cookies.get('oauth_state')?.value

    if (!code || !state || state !== storedState) {
      return NextResponse.redirect(`${appUrl}/login?error=invalid_state`)
    }

    const tokens = await exchangeCode(code)
    const profile = await getProfile(tokens.access_token)

    if (!profile.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?error=email_not_verified`)
    }

    // Find or create user
    let user = await queryOne<UserRow>(
      `SELECT id, email, full_name, role, tenant_id
       FROM users WHERE email = $1`,
      [profile.email]
    )

    if (!user) {
      // Create tenant first, then user (same as email registration)
      const tenant = await queryOne<{ id: string }>(
        `INSERT INTO tenants (name, slug, plan)
         VALUES ($1, $2, 'starter')
         RETURNING id`,
        [profile.name, profile.email.split('@')[0] + '-' + Date.now()]
      )
      if (!tenant) throw new Error('Tenant creation failed')

      user = await queryOne<UserRow>(
        `INSERT INTO users (email, full_name, avatar_url, role, tenant_id, email_verified, email_verified_at, metadata, password_hash)
         VALUES ($1, $2, $3, 'member', $4, true, NOW(), $5, '')
         RETURNING id, email, full_name, role, tenant_id`,
        [
          profile.email,
          profile.name,
          profile.picture,
          tenant.id,
          JSON.stringify({ google_id: profile.sub, provider: 'google' }),
        ]
      )
    } else {
      // Update avatar and google_id if not set
      await query(
        `UPDATE users SET avatar_url = COALESCE(NULLIF(avatar_url,''), $1),
         metadata = metadata || $2, last_login_at = NOW()
         WHERE id = $3`,
        [
          profile.picture,
          JSON.stringify({ google_id: profile.sub }),
          user.id,
        ]
      )
    }

    if (!user) throw new Error('User creation failed')

    const { accessToken, refreshToken } = await createSession(user.id, {
      sub: user.id,
      tenant: user.tenant_id,
      role: user.role,
      email: user.email,
    })

    const response = NextResponse.redirect(`${appUrl}/dashboard`)
    response.cookies.delete('oauth_state')
    response.cookies.set('access_token', accessToken, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600,
    })
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth/refresh', maxAge: 30 * 24 * 3600,
    })
    return response

  } catch (err) {
    console.error('[Google OAuth] Callback error:', err)
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`)
  }
}
