import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'crypto'
import { getRedis } from './redis'

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

  const redis = await getRedis()
  const accessHash = hashToken(accessToken)
  const refreshHash = hashToken(refreshToken)

  await redis.setEx(`session:${accessHash}`, 7 * 24 * 3600, userId)
  await redis.setEx(`refresh:${refreshHash}`, REFRESH_EXPIRES_SECONDS, userId)

  return { accessToken, refreshToken }
}

export async function validateSession(accessToken: string): Promise<JwtPayload | null> {
  const payload = verifyAccessToken(accessToken)
  if (!payload) return null

  const redis = await getRedis()
  const hash = hashToken(accessToken)
  const exists = await redis.exists(`session:${hash}`)
  return exists ? payload : null
}

export async function invalidateSession(accessToken: string, refreshToken?: string): Promise<void> {
  const redis = await getRedis()
  await redis.del(`session:${hashToken(accessToken)}`)
  if (refreshToken) {
    await redis.del(`refresh:${hashToken(refreshToken)}`)
  }
}

export async function rotateRefreshToken(refreshToken: string, newPayload: JwtPayload): Promise<{
  accessToken: string
  refreshToken: string
} | null> {
  const redis = await getRedis()
  const hash = hashToken(refreshToken)
  const userId = await redis.get(`refresh:${hash}`)
  if (!userId) return null

  await redis.del(`refresh:${hash}`)
  return createSession(userId, newPayload)
}
