import { NextResponse, type NextRequest } from 'next/server'
import { query } from '@/lib/db'

const STATIC_CASES = [
  {
    id: 'static-1', title: 'Inmobiliaria reduce 65% el tiempo de gestión comercial',
    slug: 'inmobiliaria-gestion-leads', industry: 'Inmobiliaria',
    stack: ['WhatsApp', 'HubSpot', 'Gmail', 'Google Sheets'], setup_time: '24h',
    primary_metric_label: 'Reducción de tiempo de gestión', primary_metric_value: '65%',
    summary_bullets: ['Leads calificados automáticamente', 'Respuesta en menos de 2 minutos', 'Equipo comercial con más foco'],
    confidentiality: 'anonymous', featured: true, is_beta: false,
    before_after: [
      { metric: 'Tiempo de primera respuesta', before: '4-6 horas', after: '< 2 minutos', period: 'Semana 1' },
      { metric: 'Leads calificados/semana', before: '12', after: '30+', period: 'Mes 1' },
    ],
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'static-2', title: 'Aseguradora procesa 1.200 consultas por mes sin intervención',
    slug: 'aseguradora-consultas-automaticas', industry: 'Seguros',
    stack: ['WhatsApp', 'Gmail', 'Zendesk', 'Google Sheets'], setup_time: '24h',
    primary_metric_label: 'Consultas/mes automatizadas', primary_metric_value: '1.200+',
    summary_bullets: ['Atención 24/7 sin escalar al equipo', 'Respuestas consistentes y precisas', 'CSAT del 4.8/5 en consultas automáticas'],
    confidentiality: 'anonymous', featured: true, is_beta: false,
    before_after: [
      { metric: 'Consultas resueltas sin humano', before: '20%', after: '80%', period: 'Mes 1' },
      { metric: 'Tiempo de respuesta promedio', before: '6h', after: '< 5 min', period: 'Semana 1' },
    ],
    created_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'static-3', title: 'Estudio legal automatiza el 80% de clasificación documental',
    slug: 'legal-clasificacion-documentos', industry: 'Legal',
    stack: ['Gmail', 'Google Drive', 'Google Sheets', 'OpenAI'], setup_time: '48h',
    primary_metric_label: 'Clasificación automatizada', primary_metric_value: '80%',
    summary_bullets: ['Documentos clasificados en segundos', 'Equipo enfocado en análisis de alto valor', 'Cero errores en categorización estándar'],
    confidentiality: 'anonymous', featured: true, is_beta: false,
    before_after: [
      { metric: 'Horas en clasificación/semana', before: '15h', after: '< 3h', period: 'Semana 2' },
      { metric: 'Errores de clasificación', before: '~8/mes', after: '0 en categorías estándar', period: 'Mes 1' },
    ],
    created_at: '2025-10-20T00:00:00Z',
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industry = searchParams.get('industry')
  const featured = searchParams.get('featured')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  const conditions: string[] = []
  const params: unknown[] = []

  if (industry) {
    params.push(industry)
    conditions.push(`industry = $${params.length}`)
  }
  if (featured === 'true') {
    conditions.push('featured = TRUE')
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.push(limit)

  const dbCases = await query(
    `SELECT id, title, slug, industry, stack, setup_time,
            primary_metric_label, primary_metric_value,
            summary_bullets, confidentiality, featured, is_beta,
            before_after, created_at
     FROM cases
     ${where}
     ORDER BY featured DESC, created_at DESC
     LIMIT $${params.length}`,
    params
  ).catch(() => null)

  // Use DB results if available, otherwise fall back to static data
  if (dbCases && (dbCases as unknown[]).length > 0) {
    return NextResponse.json({ cases: dbCases })
  }

  // Static fallback — apply same filters
  let filtered = STATIC_CASES
  if (industry) filtered = filtered.filter(c => c.industry === industry)
  if (featured === 'true') filtered = filtered.filter(c => c.featured)
  filtered = filtered.slice(0, limit)

  return NextResponse.json({ cases: filtered })
}
