'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, Zap, CheckCircle, ArrowLeft, Play, Clock, Star, ArrowRight, GitCompare } from 'lucide-react'
import DemoChat from './DemoChat'
import ReservationForm from './ReservationForm'

const ALL_AGENTS = [
  { id: '1', name: 'Sales AI Closer', slug: 'sales-ai-closer', tagline: 'Cierra más ventas, automatiza el seguimiento de leads', category: 'Ventas', pricing_basic: 397 },
  { id: '2', name: 'AI Support Agent', slug: 'ai-support-agent', tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde', category: 'Soporte', pricing_basic: 397 },
  { id: '3', name: 'AI Lead Engine', slug: 'ai-lead-engine', tagline: 'Genera y califica leads 24/7 en piloto automático', category: 'Ventas', pricing_basic: 397 },
  { id: '4', name: 'Marketing AI Agent', slug: 'marketing-ai-agent', tagline: 'Automatiza reportes, contenido y campañas de marketing', category: 'Marketing', pricing_basic: 447 },
  { id: '5', name: 'E-Commerce Agent', slug: 'ecommerce-agent', tagline: 'Recupera carritos, cross-sell y retención automatizada', category: 'E-commerce', pricing_basic: 447 },
  { id: '6', name: 'Appointment Setting', slug: 'appointment-setting-agent', tagline: 'Agenda reuniones y demos de forma completamente automática', category: 'Ventas', pricing_basic: 397 },
]

const relatedGradients: Record<string, string> = {
  Ventas: 'from-blue-500 to-indigo-600',
  Soporte: 'from-violet-500 to-purple-600',
  Marketing: 'from-violet-500 to-purple-500',
  'E-commerce': 'from-cyan-500 to-blue-600',
}

interface Agent {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  category: string
  capabilities: string[]
  integrations: string[]
  use_cases: string[]
  faqs: { question?: string; q?: string; answer?: string; a?: string }[]
  pricing_basic: number
  pricing_pro: number
  setup_time_hours: number
  demo_available: boolean
  demo_max_messages: number
}

// Static fallbacks by slug
const STATIC: Record<string, Partial<Agent>> = {
  'sales-ai-closer': { name: 'Sales AI Closer', tagline: 'Cierra más ventas, automatiza el seguimiento de leads', description: 'Agente IA especializado en ventas que califica leads, hace seguimiento automático y cierra oportunidades. Integra con tu CRM y mantiene conversaciones naturales con prospectos.', category: 'Ventas', capabilities: ['Calificación de leads', 'Seguimiento automático', 'Respuesta en < 1 min', 'Integración CRM', 'Análisis de conversación', 'Reportes de pipeline'], integrations: ['HubSpot', 'Salesforce', 'WhatsApp', 'Gmail', 'Slack', 'Calendly'], use_cases: ['E-commerce', 'Agencias digitales', 'SaaS B2B'], faqs: [{ q: '¿Puede cerrar ventas sin intervención humana?', a: 'Sí para tickets bajos. Para tickets altos califica y deriva al equipo.' }, { q: '¿Qué pasa con preguntas complejas?', a: 'Escala automáticamente con contexto completo.' }], pricing_basic: 397, pricing_pro: 597, setup_time_hours: 24, demo_available: true, demo_max_messages: 3 },
  'ai-support-agent': { name: 'AI Support Agent', tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde', description: 'Agente de soporte que resuelve el 80% de consultas sin intervención humana. Aprende de tu base de conocimiento y escala casos complejos.', category: 'Soporte', capabilities: ['Resolución autónoma', 'Escalada inteligente', 'Base de conocimiento', 'Multicanal', 'CSAT automático', 'Reportes de tickets'], integrations: ['Zendesk', 'Intercom', 'WhatsApp', 'Instagram DM', 'Gmail'], use_cases: ['SaaS', 'E-commerce', 'Apps móviles', 'Servicios financieros'], faqs: [{ q: '¿Cómo aprende de mis productos?', a: 'Se entrena con tu documentación y FAQs en 24-48h.' }], pricing_basic: 397, pricing_pro: 597, setup_time_hours: 24, demo_available: true, demo_max_messages: 3 },
}

const gradients: Record<string, string> = {
  'sales-ai-closer': 'from-blue-500 to-indigo-600',
  'ai-support-agent': 'from-violet-500 to-purple-600',
  'ai-lead-engine': 'from-indigo-500 to-blue-600',
  'marketing-ai-agent': 'from-violet-500 to-purple-500',
  'ecommerce-agent': 'from-cyan-500 to-blue-600',
  'appointment-setting-agent': 'from-sky-500 to-blue-600',
}

export default function AgentDetailClient({ slug }: { slug: string }) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'reserve'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agents/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.agent) {
          setAgent(data.agent)
        } else if (STATIC[slug]) {
          setAgent({ id: slug, slug, ...STATIC[slug] } as Agent)
        }
      })
      .catch(() => {
        if (STATIC[slug]) setAgent({ id: slug, slug, ...STATIC[slug] } as Agent)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-card rounded w-1/4" />
          <div className="h-64 bg-card rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Agente no encontrado</h1>
        <Link href="/agents" className="text-primary hover:underline">Volver al catálogo</Link>
      </div>
    )
  }

  const gradient = gradients[slug] ?? 'from-blue-500 to-indigo-600'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <Link href="/agents" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero card */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-start gap-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow shrink-0`}>
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                      {agent.category}
                    </span>
                    {agent.demo_available && (
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Demo en vivo
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">{agent.name}</h1>
                  <p className="text-muted-foreground">{agent.tagline}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  Setup en {agent.setup_time_hours ?? 24}h
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  5.0 valoración
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Activo 24/7
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-card border border-border rounded-xl">
              {(['overview', 'demo', 'reserve'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground shadow-custom'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab === 'overview' && 'Descripción'}
                  {tab === 'demo' && '▶ Probar Demo'}
                  {tab === 'reserve' && 'Reservar'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-bold text-foreground text-lg mb-3">¿Qué hace este agente?</h2>
                  <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
                </div>

                {/* Capabilities */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Capacidades
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {agent.capabilities?.map(cap => (
                      <div key={cap} className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use cases */}
                {agent.use_cases?.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="font-bold text-foreground text-lg mb-4">Casos de uso</h2>
                    <div className="flex flex-wrap gap-2">
                      {agent.use_cases.map(uc => (
                        <span key={uc} className="px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground">{uc}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQs */}
                {agent.faqs?.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="font-bold text-foreground text-lg mb-4">Preguntas frecuentes</h2>
                    <div className="space-y-4">
                      {agent.faqs.map((faq, i) => (
                        <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                          <p className="font-medium text-foreground mb-1.5 text-sm">{faq.question ?? faq.q}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer ?? faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'demo' && (
              <DemoChat agentSlug={slug} agentName={agent.name} maxMessages={agent.demo_max_messages ?? 3} onDemoComplete={() => setActiveTab('reserve')} />
            )}

            {activeTab === 'reserve' && (
              <ReservationForm agentId={agent.id} agentSlug={slug} agentName={agent.name} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Pricing card */}
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-foreground text-lg mb-5">Planes disponibles</h3>

              <div className="space-y-3">
                {/* Basic */}
                <div className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-foreground">Básico</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-foreground">${agent.pricing_basic}</span>
                      <span className="text-xs text-muted-foreground">/mes</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">500 acciones/mes · 1 canal</p>
                </div>

                {/* Pro */}
                <div className="p-4 border-2 border-primary/40 rounded-xl bg-primary/5 relative">
                  <div className="absolute -top-3 right-4">
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">Popular</span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-foreground">Pro</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">${agent.pricing_pro}</span>
                      <span className="text-xs text-muted-foreground">/mes</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">2000 acciones/mes · Multicanal</p>
                </div>

                {/* Enterprise */}
                <div className="p-4 border border-border rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-foreground">Enterprise</span>
                    <span className="text-sm font-medium text-foreground">A medida</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Acciones ilimitadas · SLA 4h</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('demo')}
                className="w-full mt-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Probar demo gratis
              </button>
              <button
                onClick={() => setActiveTab('reserve')}
                className="w-full mt-2 py-3 bg-card border border-border text-foreground rounded-xl font-medium text-sm hover:border-primary/40 hover:bg-muted transition-all"
              >
                Reservar activación
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Sin tarjeta de crédito · Respondemos en &lt;2h
              </p>
            </div>

            {/* Integrations */}
            {agent.integrations?.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Integraciones</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.integrations.map(int => (
                    <span key={int} className="px-2.5 py-1 bg-muted rounded-lg text-xs text-muted-foreground">
                      {int}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compare CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 rounded-2xl p-5 text-center">
              <GitCompare className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">¿Comparás con otros?</p>
              <p className="text-xs text-muted-foreground mb-3">Usá el comparador para decidir mejor.</p>
              <Link
                href={`/marketplace/comparar?a=${slug}`}
                className="w-full py-2 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all block text-center"
              >
                Abrir comparador
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── AGENTES RELACIONADOS ──────────────────────────── */}
      {(() => {
        const related = ALL_AGENTS.filter(a => a.slug !== slug && a.category === agent.category).slice(0, 3)
        if (related.length === 0) return null
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="border-t border-border pt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Agentes relacionados</h2>
                <Link href="/agents" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map(rel => {
                  const grad = relatedGradients[rel.category] ?? 'from-blue-500 to-indigo-600'
                  return (
                    <Link
                      key={rel.slug}
                      href={`/agents/${rel.slug}`}
                      className="group flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-custom transition-all"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm mb-0.5 truncate">{rel.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{rel.tagline}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-foreground">${rel.pricing_basic}<span className="text-xs text-muted-foreground font-normal">/mes</span></span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
