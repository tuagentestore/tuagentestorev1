/**
 * Edge-compatible JWT verification using `jose`.
 * Only import this file from middleware.ts (Edge Runtime).
 * For Node.js API routes use lib/auth.ts instead.
 */
import { jwtVerify } from 'jose'
import type { JwtPayload } from './auth'

export async function verifyAccessTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '')
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}
