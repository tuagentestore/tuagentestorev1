import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'crypto'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
})

const JWT_SECRET = process.env.JWT_SECRET ?? ''
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d'
const REFRESH_EXPIRES_SECONDS = 30 * 24 * 60 * 60 // 30 days

export interface JwtPayload {
  sub: string       // user_id
  tenant: string    // tenant_id
  role: string      // 'admin' | 'member' | 'vendor'
  email: string
}

// ── Passwords ──────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ── JWT ────────────────────────────────────────────────────

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions)
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ── Sessions (Redis) ───────────────────────────────────────

export async function createSession(userId: string, payload: JwtPayload): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const accessToken = signAccessToken(payload)
  const refreshToken = randomBytes(40).toString('hex')

  const accessHash = hashToken(accessToken)
  const refreshHash = hashToken(refreshToken)

  // Redis writes are best-effort — JWT is the source of truth
  try {
    await redis.set(`session:${accessHash}`, userId, { ex: 7 * 24 * 3600 })
    await redis.set(`refresh:${refreshHash}`, userId, { ex: REFRESH_EXPIRES_SECONDS })
  } catch {
    // Redis unavailable or read-only — session still valid via JWT
  }

  return { accessToken, refreshToken }
}

export async function validateSession(accessToken: string): Promise<JwtPayload | null> {
  const payload = verifyAccessToken(accessToken)
  if (!payload) return null

  // Best-effort Redis check — fallback to JWT-only validation
  try {
    const hash = hashToken(accessToken)
    const exists = await redis.exists(`session:${hash}`)
    if (exists === 0) return null
  } catch {
    // Redis unavailable — trust JWT
  }

  return payload
}

export async function invalidateSession(accessToken: string, refreshToken?: string): Promise<void> {

  await redis.del(`session:${hashToken(accessToken)}`)
  if (refreshToken) {
    await redis.del(`refresh:${hashToken(refreshToken)}`)
  }
}

export async function rotateRefreshToken(refreshToken: string, newPayload: JwtPayload): Promise<{
  accessToken: string
  refreshToken: string
} | null> {

  const hash = hashToken(refreshToken)
  const userId = await redis.get<string>(`refresh:${hash}`)
  if (!userId) return null

  await redis.del(`refresh:${hash}`)
  return createSession(userId, newPayload)
}
