import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const CASOS = [
  {
    industry: 'Inmobiliaria',
    metric: '-65%',
    metricLabel: 'Reducción en tiempo de gestión de leads',
    setup: '36 horas',
    slug: 'inmobiliaria-gestion-leads',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    industry: 'Seguros',
    metric: '1.200+',
    metricLabel: 'Consultas procesadas automáticamente en primer mes',
    setup: '48 horas',
    slug: 'aseguradora-consultas-automaticas',
    color: 'from-violet-500 to-purple-500',
  },
  {
    industry: 'Legal',
    metric: '80%',
    metricLabel: 'Automatización en clasificación de documentos',
    setup: '42 horas',
    slug: 'legal-clasificacion-documentos',
    color: 'from-slate-500 to-gray-600',
  },
  {
    industry: 'Tecnología',
    metric: '75%',
    metricLabel: 'Tickets resueltos automáticamente',
    setup: '48 horas',
    slug: 'tecnologia-soporte-saas',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    industry: 'Salud',
    metric: '60%',
    metricLabel: 'Menos no-shows en el primer mes',
    setup: '24 horas',
    slug: 'clinica-agenda-automatica',
    color: 'from-green-500 to-emerald-500',
  },
  {
    industry: 'Retail',
    metric: '22%',
    metricLabel: 'Carritos recuperados en los primeros 60 días',
    setup: '24 horas',
    slug: 'retail-ecommerce-recuperacion',
    color: 'from-orange-500 to-amber-500',
  },
]

export default function CasosPreview() {
  const all = [...CASOS, ...CASOS]

  return (
    <section className="py-14 sm:py-24 bg-muted/10 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
              { v: '50+', l: 'Casos de estudio' },
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
      </div>

      {/* Infinite carousel — all 6 industries */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div className="flex animate-marquee-cases" style={{ width: 'max-content' }}>
          {all.map((c, i) => (
            <div key={`${c.slug}-${i}`} className="mx-3">
              <Link
                href={`/casos/${c.slug}`}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-custom transition-all flex flex-col shrink-0 group"
                style={{ width: 300, height: 190 }}
              >
                <div className={`bg-gradient-to-r ${c.color} p-5 flex-1`}>
                  <div className="text-white/70 text-xs font-medium mb-1">{c.industry}</div>
                  <div className="text-3xl font-black text-white">{c.metric}</div>
                  <div className="text-white/80 text-sm mt-1 line-clamp-2">{c.metricLabel}</div>
                </div>
                <div className="p-4 flex items-center justify-between border-t border-border">
                  <span className="text-xs text-muted-foreground">Setup: {c.setup}</span>
                  <span className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-1.5 transition-all">
                    Ver caso <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <Link
          href="/casos"
          className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:border-primary/50 hover:shadow-custom transition-all"
        >
          Ver todos los casos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
