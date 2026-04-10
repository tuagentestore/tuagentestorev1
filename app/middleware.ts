import { NextResponse, type NextRequest } from 'next/server'
import { verifyAccessTokenEdge } from './lib/auth-edge'

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/api/auth/me', '/api/auth/logout', '/api/auth/refresh']
const ADMIN_PREFIXES = ['/admin', '/api/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p))

  if (!isProtected && !isAdmin) return NextResponse.next()

  const token =
    request.cookies.get('access_token')?.value ??
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyAccessTokenEdge(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAdmin && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const response = NextResponse.next()
  // Pass user context to API routes via headers
  response.headers.set('x-user-id', payload.sub)
  response.headers.set('x-tenant-id', payload.tenant)
  response.headers.set('x-user-role', payload.role)
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/api/auth/me',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/admin/:path*',
  ],
}
