'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, Filter } from 'lucide-react'

interface Case {
  id: string
  title: string
  slug: string
  industry: string
  stack: string[]
  setup_time: string
  primary_metric_label: string
  primary_metric_value: string
  summary_bullets: string[]
  confidentiality: string
  featured: boolean
  is_beta: boolean
}

const INDUSTRIES = ['Todos', 'Inmobiliaria', 'Seguros', 'Legal', 'Tecnología', 'Salud', 'Retail']

const INDUSTRY_COLORS: Record<string, string> = {
  Inmobiliaria: 'from-blue-500 to-indigo-500',
  Seguros: 'from-violet-500 to-purple-500',
  Legal: 'from-slate-500 to-gray-600',
  Tecnología: 'from-cyan-500 to-blue-500',
  Salud: 'from-green-500 to-emerald-500',
  Retail: 'from-orange-500 to-amber-500',
}

const BEFORE_AFTER: Record<string, { before: string; after: string }> = {
  'inmobiliaria-gestion-leads': {
    before: 'Leads entrando sin filtro, respuestas tardías y equipo comercial saturado.',
    after: 'El agente responde en minutos, califica intención real y deriva al asesor con contexto.',
  },
  'aseguradora-consultas-automaticas': {
    before: 'Equipo de atención desbordado por consultas repetitivas fuera de horario.',
    after: '1.200+ consultas procesadas automáticamente en el primer mes sin intervención humana.',
  },
  'legal-clasificacion-documentos': {
    before: 'Clasificación manual de documentos ocupaba horas diarias del equipo legal.',
    after: '80% de la clasificación automatizada, equipo liberado para trabajo de mayor valor.',
  },
  'tecnologia-soporte-saas': {
    before: 'Tickets de soporte acumulados, respuestas lentas y equipo técnico distraído con preguntas básicas.',
    after: 'El 75% de tickets resueltos automáticamente. Soporte humano solo para casos complejos.',
  },
  'clinica-agenda-automatica': {
    before: 'Recepcionistas sobrepasadas, turnos sin confirmar y alto porcentaje de no-show.',
    after: 'Agenda llena, recordatorios automáticos y 60% menos ausencias en el primer mes.',
  },
  'retail-ecommerce-recuperacion': {
    before: 'Carritos abandonados sin seguimiento y clientes que compraban una sola vez.',
    after: '22% de carritos recuperados y 35% más de recompras en los primeros 60 días.',
  },
}

const STATIC_CASES: Case[] = [
  { id: '1', title: 'Inmobiliaria reduce 65% el tiempo de gestión comercial', slug: 'inmobiliaria-gestion-leads', industry: 'Inmobiliaria', stack: ['WhatsApp', 'HubSpot', 'Gmail', 'Sheets'], setup_time: '24h', primary_metric_value: '65%', primary_metric_label: 'Reducción de tiempo', summary_bullets: ['Leads calificados automáticamente', 'Respuesta en menos de 2 minutos', 'Equipo comercial con más foco'], confidentiality: 'public', featured: true, is_beta: false },
  { id: '2', title: 'Aseguradora procesa 1.200 consultas por mes sin intervención', slug: 'aseguradora-consultas-automaticas', industry: 'Seguros', stack: ['WhatsApp', 'Gmail', 'Zendesk'], setup_time: '24h', primary_metric_value: '1.200+', primary_metric_label: 'Consultas/mes automatizadas', summary_bullets: ['Atención 24/7 sin escalar al equipo', 'Respuestas consistentes y precisas', 'CSAT del 4.8/5 en consultas automáticas'], confidentiality: 'public', featured: true, is_beta: false },
  { id: '3', title: 'Estudio legal automatiza el 80% de clasificación documental', slug: 'legal-clasificacion-documentos', industry: 'Legal', stack: ['Gmail', 'Google Drive', 'Sheets'], setup_time: '48h', primary_metric_value: '80%', primary_metric_label: 'Clasificación automatizada', summary_bullets: ['Documentos clasificados en segundos', 'Equipo enfocado en análisis de alto valor', 'Cero errores en categorización estándar'], confidentiality: 'public', featured: true, is_beta: false },
  { id: '4', title: 'SaaS tecnológico resuelve el 75% de tickets sin intervención humana', slug: 'tecnologia-soporte-saas', industry: 'Tecnología', stack: ['Zendesk', 'Slack', 'Gmail', 'n8n'], setup_time: '48h', primary_metric_value: '75%', primary_metric_label: 'Tickets resueltos automáticamente', summary_bullets: ['Tiempo de respuesta reducido a menos de 1 minuto', 'Equipo técnico liberado para desarrollo', 'CSAT mejoró de 3.9 a 4.7/5'], confidentiality: 'public', featured: true, is_beta: false },
  { id: '5', title: 'Clínica llena su agenda y reduce no-show un 60%', slug: 'clinica-agenda-automatica', industry: 'Salud', stack: ['WhatsApp', 'Google Calendar', 'Gmail'], setup_time: '24h', primary_metric_value: '60%', primary_metric_label: 'Menos no-shows', summary_bullets: ['Turnos confirmados automáticamente', 'Recordatorios 24h y 2h antes', '40% más turnos ocupados por mes'], confidentiality: 'public', featured: true, is_beta: false },
  { id: '6', title: 'Tienda online recupera 22% de carritos y aumenta recompras', slug: 'retail-ecommerce-recuperacion', industry: 'Retail', stack: ['WhatsApp', 'Shopify', 'Gmail', 'Sheets'], setup_time: '24h', primary_metric_value: '22%', primary_metric_label: 'Carritos recuperados', summary_bullets: ['Mensajes personalizados en WhatsApp y email', '35% más recompras en 60 días', 'Sin intervención manual del equipo'], confidentiality: 'public', featured: true, is_beta: false },
]

function CaseCard({ c }: { c: Case }) {
  const color = INDUSTRY_COLORS[c.industry] ?? 'from-blue-500 to-indigo-500'
  const ba = BEFORE_AFTER[c.slug]
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-custom transition-all duration-300 group flex flex-col">
      {/* Metric banner */}
      <div className={`bg-gradient-to-r ${color} p-5`}>
        <div className="flex items-start justify-between">
          <span className="text-white/80 text-xs font-medium">{c.industry}</span>
          {c.is_beta && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Estimado</span>
          )}
        </div>
        <div className="mt-2">
          <div className="text-4xl font-black text-white">{c.primary_metric_value}</div>
          <div className="text-white/80 text-sm">{c.primary_metric_label}</div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-foreground text-base mb-3 leading-snug">{c.title}</h3>

        {/* Before/After or bullets */}
        {ba ? (
          <div className="space-y-2 mb-4 flex-1">
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
              <p className="text-xs font-semibold text-red-400 mb-1">Antes</p>
              <p className="text-sm text-muted-foreground">{ba.before}</p>
            </div>
            <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
              <p className="text-xs font-semibold text-green-400 mb-1">Después</p>
              <p className="text-sm text-foreground">{ba.after}</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1.5 mb-4 flex-1">
            {c.summary_bullets?.slice(0, 3).map((b: string) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {c.stack?.slice(0, 4).map((s: string) => (
            <span key={s} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{s}</span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Setup: {c.setup_time}</span>
          <div className="flex gap-2">
            {ba && (
              <Link
                href="/contact?type=demo"
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:shadow-glow transition-all"
              >
                Quiero este sistema
              </Link>
            )}
            <Link
              href={`/casos/${c.slug}`}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:gap-1.5 transition-all"
            >
              Ver caso <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CasosClient() {
  const [cases, setCases] = useState<Case[]>(STATIC_CASES)
  const [loading, setLoading] = useState(false)
  const [industry, setIndustry] = useState('Todos')

  useEffect(() => {
    const url = industry === 'Todos'
      ? '/api/cases'
      : `/api/cases?industry=${encodeURIComponent(industry)}`
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(d => setCases(d.cases ?? []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }, [industry])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Casos reales
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            Empresas que ya están recuperando tiempo y <span className="text-gradient">vendiendo mejor</span> con agentes IA
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No mostramos promesas abstractas. Mostramos qué se implementó, con qué stack y qué resultado produjo.
          </p>

          {/* Global stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { label: 'Horas ahorradas/mes', value: '500+' },
              { label: 'Empresas transformadas', value: '50+' },
              { label: 'Satisfacción promedio', value: '4.9/5' },
              { label: 'ROI promedio', value: '3x' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                industry === ind
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No hay casos para esta industria todavía.</p>
            <button onClick={() => setIndustry('Todos')} className="mt-4 text-primary hover:underline text-sm">
              Ver todos los casos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map(c => <CaseCard key={c.id} c={c} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Si querés un caso como este, no necesitás empezar desde cero</h2>
          <p className="text-muted-foreground mb-6">Elegimos el agente correcto, definimos el stack y te mostramos una ruta clara de activación.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact?type=diagnostico"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
            >
              Quiero mi diagnóstico
            </Link>
            <Link
              href="/agents"
              className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:border-primary/50 transition-all"
            >
              Ver agentes
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
