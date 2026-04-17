import { NextResponse, type NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { queryOne } from '@/lib/db'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export async function POST(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  if (role !== 'admin' && role !== 'community_manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null // 'agent' | 'logo' | 'general'
  const slug = formData.get('slug') as string | null // optional: agent slug

  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Archivo mayor a 5MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'png'
  const subdir = type === 'agent' ? 'agents' : type === 'logo' ? 'logos' : 'uploads'
  const filename = slug
    ? `${slug}.${ext}`
    : `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '-')}`

  const uploadDir = join(process.cwd(), 'public', subdir)
  await mkdir(uploadDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(join(uploadDir, filename), buffer)

  const publicUrl = `/${subdir}/${filename}`

  // Update agent image_url in DB if slug provided
  if (slug && type === 'agent') {
    await queryOne(
      `UPDATE agents SET image_url = $1, updated_at = NOW() WHERE slug = $2`,
      [publicUrl, slug]
    ).catch(() => null)
  }

  return NextResponse.json({ ok: true, url: publicUrl })
}
