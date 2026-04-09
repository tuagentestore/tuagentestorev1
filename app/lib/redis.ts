import { createClient, type RedisClientType } from 'redis'

let client: RedisClientType | undefined

export async function getRedis(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL }) as RedisClientType
    client.on('error', (err: Error) => console.error('[Redis] Client error:', err.message))
    await client.connect()
  }
  return client
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis()
  const value = await redis.get(key)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = await getRedis()
  await redis.setEx(key, ttlSeconds, JSON.stringify(value))
}

export async function cacheDel(key: string): Promise<void> {
  const redis = await getRedis()
  await redis.del(key)
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = await getRedis()
  const current = await redis.incr(key)
  if (current === 1) await redis.expire(key, windowSeconds)
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  }
}
