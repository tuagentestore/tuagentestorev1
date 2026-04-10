import { NextResponse, type NextRequest } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await query(
    `SELECT id, type, title, message, action_url, read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [userId]
  ).catch(() => [])

  const unread = notifications.filter((n: Record<string, unknown>) => !n.read).length

  return NextResponse.json({ notifications, unread })
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))

  if (id) {
    // Mark single notification as read
    await queryOne(
      `UPDATE notifications SET read = TRUE, read_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    ).catch(() => null)
  } else {
    // Mark all as read
    await query(
      `UPDATE notifications SET read = TRUE, read_at = NOW()
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    ).catch(() => null)
  }

  return NextResponse.json({ ok: true })
}
