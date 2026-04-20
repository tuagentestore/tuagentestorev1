import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const CASOS = [
  {
    industry: 'Inmobiliaria',
    stack: 'HubSpot + Gmail + Zapier',
    setup: '36 horas',
    metric: '-65%',
    metricLabel: 'Reducción en tiempo de gestión de leads',
    slug: 'inmobiliaria-gestion-leads',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    industry: 'Seguros',
    stack: 'Zendesk + Notion + Sheets',
    setup: '48 horas',
    metric: '1.200+',
    metricLabel: 'Consultas procesadas automáticamente en primer mes',
    slug: 'aseguradora-consultas-automaticas',
    color: 'from-violet-500 to-purple-500',
  },
  {
    industry: 'Legal',
    stack: 'Gmail + Drive + n8n',
    setup: '42 horas',
    metric: '80%',
    metricLabel: 'Automatización en clasificación de documentos',
    slug: 'legal-clasificacion-documentos',
    color: 'from-slate-500 to-gray-600',
  },
]

export default function CasosPreview() {
  return (
    <section className="py-14 sm:py-24 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Resultados reales
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Casos de Implementación
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Resultados reales de automatización con IA en diferentes industrias.
          </p>

          {/* Global stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            {[
              { v: '500+', l: 'Horas ahorradas/mes' },
              { v: '50+', l: 'Empresas transformadas' },
              { v: '4.9/5', l: 'Satisfacción de clientes' },
              { v: '3x', l: 'ROI Promedio' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-black text-primary">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {CASOS.map((c) => (
            <Link
              key={c.slug}
              href={`/casos/${c.slug}`}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-custom transition-all group"
            >
              <div className={`bg-gradient-to-r ${c.color} p-5`}>
                <div className="text-white/70 text-xs font-medium mb-2">{c.industry}</div>
                <div className="text-4xl font-black text-white">{c.metric}</div>
                <div className="text-white/80 text-sm">{c.metricLabel}</div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Stack: {c.stack}</span>
                  <span>Setup: {c.setup}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Ver caso completo <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/casos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:border-primary/50 hover:shadow-custom transition-all"
          >
            Ver todos los casos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
