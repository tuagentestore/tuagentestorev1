'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Star } from 'lucide-react'

const FEATURED = [
  {
    slug: 'sales-ai-closer',
    name: 'Sales AI Closer',
    tagline: 'Cierra más ventas, automatiza el seguimiento de leads',
    category: 'Ventas',
    price: 397,
    color: 'from-blue-500 to-indigo-600',
    image: '/agents/sales-ai-closer.png',
    capabilities: ['Calificación de leads', 'Seguimiento automático', 'Integración CRM'],
  },
  {
    slug: 'ai-support-agent',
    name: 'AI Support Agent',
    tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde',
    category: 'Soporte',
    price: 397,
    color: 'from-violet-500 to-purple-600',
    image: '/agents/ai-support-agent.png',
    capabilities: ['Resolución autónoma 80%', 'Escalada inteligente', 'Multicanal'],
  },
  {
    slug: 'ai-lead-engine',
    name: 'AI Lead Engine',
    tagline: 'Genera y califica leads 24/7 en piloto automático',
    category: 'Ventas',
    price: 397,
    color: 'from-indigo-500 to-blue-600',
    image: '/agents/ai-lead-engine.png',
    capabilities: ['Captura multicanal', 'Scoring automático', 'Alertas en tiempo real'],
  },
  {
    slug: 'appointment-setting-agent',
    name: 'Appointment Setting',
    tagline: 'Agenda reuniones y demos completamente automático',
    category: 'Ventas',
    price: 397,
    color: 'from-sky-500 to-blue-600',
    image: '/agents/appointment-setting.png',
    capabilities: ['Agendamiento 24/7', 'Calificación previa', 'Recordatorios multicanal'],
  },
  {
    slug: 'marketing-ai-agent',
    name: 'Marketing AI Agent',
    tagline: 'Campañas inteligentes que optimizan su propio ROAS',
    category: 'Marketing',
    price: 397,
    color: 'from-violet-500 to-pink-600',
    image: '/agents/marketing-ai-agent.png',
    capabilities: ['Creación de campañas', 'Optimización ROAS', 'Calendario de contenido'],
  },
  {
    slug: 'ecommerce-agent',
    name: 'E-Commerce Agent',
    tagline: 'Recupera carritos y multiplica tus ventas online',
    category: 'E-Commerce',
    price: 397,
    color: 'from-emerald-500 to-teal-600',
    image: '/agents/ecommerce-agent.png',
    capabilities: ['Recuperación de carritos', 'Gestión de catálogo', 'Revenue automático'],
  },
]

const categoryColors: Record<string, string> = {
  Ventas:     'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  Soporte:    'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Marketing:  'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'E-Commerce': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
}

export default function FeaturedAgents() {
  return (
    <section className="py-24 bg-muted/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Agentes destacados
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Los más solicitados
            </h2>
            <p className="text-muted-foreground mt-2">
              Probados, configurables y listos para tu negocio
            </p>
          </div>
          <Link
            href="/agents"
            className="group flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all shrink-0"
          >
            Ver todos los agentes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Carousel — full width, infinite scroll */}
      <div
        className="relative w-full"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        }}
      >
        <div className="flex animate-marquee-cards hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {[...FEATURED, ...FEATURED].map((agent, i) => (
            <Link
              key={`${agent.slug}-${i}`}
              href={`/agents/${agent.slug}`}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-custom transition-all duration-300 hover:-translate-y-1 flex flex-col mx-3 shrink-0"
              style={{ width: 300 }}
            >
              {/* Agent image */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={agent.image}
                  alt={agent.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="300px"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${agent.color} opacity-20`} />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <span className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-medium border mb-3 ${categoryColors[agent.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                  {agent.category}
                </span>
                <h3 className="font-bold text-foreground mb-1">{agent.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{agent.tagline}</p>
                <ul className="space-y-1.5 mb-4">
                  {agent.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3 text-primary shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-lg font-bold text-foreground">${agent.price}</span>
                    <span className="text-xs text-muted-foreground">/mes</span>
                  </div>
                  <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Ver demo
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
