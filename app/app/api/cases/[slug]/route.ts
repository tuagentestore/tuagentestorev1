import { NextResponse, type NextRequest } from 'next/server'
import { queryOne } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const c = await queryOne(
    `SELECT c.*,
       COALESCE(
         (SELECT json_agg(json_build_object('id', a.id, 'name', a.name, 'slug', a.slug, 'tagline', a.tagline))
          FROM agents a WHERE a.id = ANY(c.agent_ids)),
         '[]'
       ) AS agents
     FROM cases c
     WHERE c.slug = $1`,
    [params.slug]
  ).catch(() => null)

  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ case: c })
}
