import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, rotateRefreshToken, JwtPayload } from '@/lib/auth'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value
  const accessToken = req.cookies.get('access_token')?.value

  if (!refreshToken || !accessToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  // Try to get the payload — verifyAccessToken returns null if expired
  let payload: JwtPayload | null = verifyAccessToken(accessToken)

  // If expired, decode without verification to get sub/tenant/role
  if (!payload) {
    try {
      const parts = accessToken.split('.')
      if (parts.length === 3) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
        if (decoded.sub && decoded.tenant) {
          payload = decoded as JwtPayload
        }
      }
    } catch {
      // ignore
    }
  }

  if (!payload?.sub) {
    return NextResponse.json({ error: 'Cannot decode user from token' }, { status: 401 })
  }

  const rotated = await rotateRefreshToken(refreshToken, payload)

  if (!rotated) {
    const res = NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    res.cookies.delete('access_token')
    res.cookies.delete('refresh_token')
    return res
  }

  const res = NextResponse.json({ ok: true })

  res.cookies.set('access_token', rotated.accessToken, {
    ...COOKIE_OPTS,
    maxAge: 7 * 24 * 60 * 60,
  })

  res.cookies.set('refresh_token', rotated.refreshToken, {
    ...COOKIE_OPTS,
    maxAge: 30 * 24 * 60 * 60,
  })

  return res
}
