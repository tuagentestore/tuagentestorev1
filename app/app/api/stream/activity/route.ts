import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
})

const STREAM_KEY = 'stream:activity'
const POLL_MS = 3000
const HEARTBEAT_MS = 15000

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  let lastLen = 0
  const intervals: ReturnType<typeof setInterval>[] = []

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      lastLen = await redis.llen(STREAM_KEY).catch(() => 0)
      send({ type: 'connected', ts: Date.now() })

      const heartbeatId = setInterval(() => {
        try { controller.enqueue(encoder.encode(': ping\n\n')) } catch {}
      }, HEARTBEAT_MS)

      const pollId = setInterval(async () => {
        try {
          const newLen = await redis.llen(STREAM_KEY)

          if (newLen < lastLen) {
            // List trimmed/reset — re-sync cursor
            lastLen = newLen
            return
          }

          if (newLen > lastLen) {
            const count = newLen - lastLen
            const items = await redis.lrange<string>(STREAM_KEY, 0, count - 1)
            // LPUSH stores newest at index 0 — reverse to send oldest first
            items.reverse().forEach(item => {
              try { send(typeof item === 'string' ? JSON.parse(item) : item) } catch {}
            })
            lastLen = newLen
          }
        } catch {}
      }, POLL_MS)

      intervals.push(heartbeatId, pollId)

      req.signal.addEventListener('abort', () => {
        intervals.forEach(clearInterval)
        try { controller.close() } catch {}
      })
    },
    cancel() {
      intervals.forEach(clearInterval)
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
