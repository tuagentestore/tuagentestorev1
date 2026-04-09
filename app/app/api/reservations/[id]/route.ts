import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { triggerN8n } from '@/lib/n8n'

const UpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'validated', 'paid', 'cancelled', 'no_show']),
  admin_notes: z.string().optional(),
  scheduled_at: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reservation = await queryOne(
    `SELECT r.*, a.name AS agent_name, a.slug AS agent_slug
     FROM reservations r
     LEFT JOIN agents a ON a.id = r.agent_id
     WHERE r.id = $1`,
    [id]
  )

  if (!reservation) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json({ reservation })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const role = req.headers.get('x-user-role')
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { status, admin_notes, scheduled_at } = parsed.data

  const reservation = await queryOne<{ id: string; status: string; user_email: string }>(
    `UPDATE reservations
     SET status = $1,
         admin_notes = COALESCE($2, admin_notes),
         scheduled_at = COALESCE($3::timestamptz, scheduled_at),
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, status, user_email`,
    [status, admin_notes ?? null, scheduled_at ?? null, id]
  )

  if (!reservation) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  // Trigger n8n workflow 5: reservation status change
  triggerN8n('reservation-updated', {
    reservation_id: id,
    new_status: status,
    admin_notes: admin_notes ?? null,
  })

  return NextResponse.json({ success: true, reservation })
}
