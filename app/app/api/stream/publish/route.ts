import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
})

const STREAM_KEY = 'stream:activity'
const MAX_EVENTS = 50

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (!process.env.WEBHOOK_SECRET_INTERNAL || secret !== process.env.WEBHOOK_SECRET_INTERNAL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.type) {
    return NextResponse.json({ error: 'type required' }, { status: 400 })
  }

  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: body.type as string,
    payload: (body.payload as Record<string, unknown>) ?? {},
    ts: Date.now(),
  }

  await redis.lpush(STREAM_KEY, JSON.stringify(event))
  await redis.ltrim(STREAM_KEY, 0, MAX_EVENTS - 1)

  return NextResponse.json({ ok: true, id: event.id })
}
