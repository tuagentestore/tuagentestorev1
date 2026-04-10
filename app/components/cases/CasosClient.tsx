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

function CaseCard({ c }: { c: Case }) {
  const color = INDUSTRY_COLORS[c.industry] ?? 'from-blue-500 to-indigo-500'
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

        {/* Bullets */}
        <ul className="space-y-1.5 mb-4 flex-1">
          {c.summary_bullets?.slice(0, 3).map((b: string) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {b}
            </li>
          ))}
        </ul>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {c.stack?.slice(0, 4).map((s: string) => (
            <span key={s} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">{s}</span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">Setup: {c.setup_time}</span>
          <Link
            href={`/casos/${c.slug}`}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
          >
            Ver caso <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CasosClient() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
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
            Casos de Implementación
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Resultados reales de empresas que automatizaron sus procesos con agentes IA.
            Métricas verificadas, stacks detallados, pasos replicables.
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
          <h2 className="text-2xl font-bold text-foreground mb-2">¿Querés un caso como este?</h2>
          <p className="text-muted-foreground mb-6">Hablemos de tu negocio y te mostramos qué es posible.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/wizard"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
            >
              Encontrá tu agente ideal
            </Link>
            <Link
              href="/agents"
              className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:border-primary/50 transition-all"
            >
              Ver catálogo de agentes
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
