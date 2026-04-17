'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Bot, CheckCircle, X, ArrowLeft, Play, ArrowRight, Plus, Clock, Zap, Users } from 'lucide-react'

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
  pricing_basic: number
  pricing_pro: number
  setup_time_hours: number
  demo_available: boolean
}

const ALL_AGENTS: Agent[] = [
  { id: '1', name: 'Sales AI Closer', slug: 'sales-ai-closer', tagline: 'Cierra más ventas, automatiza el seguimiento de leads', description: 'Agente especializado en ventas que califica leads y hace seguimiento automático.', category: 'Ventas', capabilities: ['Calificación de leads', 'Seguimiento automático', 'Respuesta < 1 min', 'Integración CRM', 'Análisis de conversación', 'Reportes de pipeline'], integrations: ['HubSpot', 'Salesforce', 'WhatsApp', 'Gmail', 'Slack', 'Calendly'], use_cases: ['E-commerce', 'Agencias digitales', 'SaaS B2B'], pricing_basic: 397, pricing_pro: 597, setup_time_hours: 24, demo_available: true },
  { id: '2', name: 'AI Support Agent', slug: 'ai-support-agent', tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde', description: 'Agente de soporte que resuelve el 80% de consultas sin intervención humana.', category: 'Soporte', capabilities: ['Resolución autónoma 80%', 'Escalada inteligente', 'Base de conocimiento', 'Multicanal', 'CSAT automático', 'Reportes de tickets'], integrations: ['Zendesk', 'Intercom', 'WhatsApp', 'Instagram DM', 'Gmail'], use_cases: ['SaaS', 'E-commerce', 'Apps móviles', 'Servicios financieros'], pricing_basic: 397, pricing_pro: 597, setup_time_hours: 24, demo_available: true },
  { id: '3', name: 'AI Lead Engine', slug: 'ai-lead-engine', tagline: 'Genera y califica leads 24/7 en piloto automático', description: 'Motor de generación y calificación de leads con scoring automático.', category: 'Ventas', capabilities: ['Captura multicanal', 'Scoring automático', 'Alertas tiempo real', 'Integración CRM', 'Reportes semanales', 'A/B testing'], integrations: ['Facebook Ads', 'LinkedIn', 'HubSpot', 'Google Forms', 'Zapier'], use_cases: ['Inmobiliarias', 'Educación', 'B2B servicios'], pricing_basic: 397, pricing_pro: 597, setup_time_hours: 24, demo_available: true },
  { id: '4', name: 'Marketing AI Agent', slug: 'marketing-ai-agent', tagline: 'Automatiza reportes, contenido y campañas de marketing', description: 'Automatización completa del ciclo de marketing: análisis, contenido y reportes.', category: 'Marketing', capabilities: ['Reportes automáticos', 'Generación de contenido', 'Análisis de campañas', 'Publicación multi-canal', 'Insights de audiencia', 'ROI tracking'], integrations: ['Google Analytics', 'Meta Ads', 'Mailchimp', 'LinkedIn', 'Google Ads'], use_cases: ['Agencias', 'E-commerce', 'Startups'], pricing_basic: 447, pricing_pro: 697, setup_time_hours: 48, demo_available: true },
  { id: '5', name: 'E-Commerce Agent', slug: 'ecommerce-agent', tagline: 'Recupera carritos, cross-sell y retención automatizada', description: 'Maximiza el revenue de tu tienda con recuperación de carritos y upsell automático.', category: 'E-commerce', capabilities: ['Recuperación de carritos', 'Cross-sell y upsell', 'Post-venta automática', 'Retención de clientes', 'Reseñas automáticas', 'Stock alerts'], integrations: ['Shopify', 'WooCommerce', 'MercadoLibre', 'Tiendanube', 'Gmail'], use_cases: ['Tiendas online', 'Dropshipping', 'Marketplaces'], pricing_basic: 447, pricing_pro: 697, setup_time_hours: 24, demo_available: true },
  { id: '6', name: 'Appointment Setting', slug: 'appointment-setting-agent', tagline: 'Agenda reuniones y demos de forma completamente automática', description: 'Agenta reuniones, califica prospectos y envía recordatorios sin intervención humana.', category: 'Ventas', capabilities: ['Agendamiento automático', 'Calificación previa', 'Recordatorios multicanal', 'Integración calendario', 'Reagendamiento', 'No-show follow-up'], integrations: ['Calendly', 'Google Calendar', 'WhatsApp', 'Gmail', 'Zoom'], use_cases: ['Clínicas', 'Consultoras', 'Inmobiliarias'], pricing_basic: 397, pricing_pro: 597, setup_time_hours: 12, demo_available: true },
]

const gradients: Record<string, string> = {
  Ventas: 'from-blue-500 to-indigo-600',
  Soporte: 'from-violet-500 to-purple-600',
  Marketing: 'from-violet-500 to-purple-500',
  'E-commerce': 'from-cyan-500 to-blue-600',
}

// All capabilities union for comparison matrix
const ALL_CAPABILITIES = [
  'Calificación de leads', 'Seguimiento automático', 'Integración CRM',
  'Reportes automáticos', 'Multicanal', 'Escalada inteligente',
  'Generación de contenido', 'Agendamiento automático', 'Recuperación de carritos',
  'Scoring automático', 'Resolución autónoma 80%', 'Recordatorios multicanal',
]

export default function CompareClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [addingSlot, setAddingSlot] = useState<number | null>(null)

  useEffect(() => {
    const slugs = ['a', 'b', 'c']
      .map(k => searchParams.get(k))
      .filter(Boolean) as string[]

    const selected = slugs
      .map(slug => ALL_AGENTS.find(a => a.slug === slug))
      .filter(Boolean) as Agent[]

    setAgents(selected)
  }, [searchParams])

  const removeAgent = (slug: string) => {
    const newAgents = agents.filter(a => a.slug !== slug)
    const params = newAgents.map((a, i) => `${'abc'[i]}=${a.slug}`).join('&')
    router.push(`/marketplace/comparar?${params}`)
  }

  const addAgent = (slug: string) => {
    const newAgents = [...agents]
    if (addingSlot !== null) newAgents[addingSlot] = ALL_AGENTS.find(a => a.slug === slug)!
    else newAgents.push(ALL_AGENTS.find(a => a.slug === slug)!)
    const params = newAgents.map((a, i) => `${'abc'[i]}=${a.slug}`).join('&')
    router.push(`/marketplace/comparar?${params}`)
    setAddingSlot(null)
  }

  const available = ALL_AGENTS.filter(a => !agents.find(ag => ag.slug === a.slug))

  if (agents.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Sin agentes para comparar</h1>
          <p className="text-muted-foreground mb-6">Seleccioná agentes desde el catálogo usando el botón "Comparar".</p>
          <Link href="/marketplace" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all">
            Ir al Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Marketplace
            </Link>
            <span className="text-border">/</span>
            <h1 className="text-xl font-bold text-foreground">Comparar agentes</h1>
          </div>
          <span className="text-sm text-muted-foreground">{agents.length} de 3 agentes</span>
        </div>

        {/* ── AGENT HEADERS ────────────────────────────────── */}
        <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: `200px repeat(${Math.min(agents.length + (agents.length < 3 ? 1 : 0), 3)}, 1fr)` }}>

          {/* Empty corner */}
          <div />

          {/* Agent columns */}
          {agents.map(agent => {
            const grad = gradients[agent.category] ?? 'from-blue-500 to-indigo-600'
            return (
              <div key={agent.slug} className="bg-card border border-border rounded-2xl p-5 relative">
                <button
                  onClick={() => removeAgent(agent.slug)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-muted-foreground transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-bold text-foreground text-sm mb-1 pr-6">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.tagline}</p>

                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-xl font-bold text-foreground">${agent.pricing_basic}</span>
                    <span className="text-xs text-muted-foreground">/mes</span>
                  </div>
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold text-center hover:shadow-glow transition-all flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Ver & Activar
                  </Link>
                </div>
              </div>
            )
          })}

          {/* Add slot */}
          {agents.length < 3 && (
            <div className="bg-card border border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[200px]">
              {addingSlot === -1 ? (
                <div className="w-full space-y-2">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Elegí un agente:</p>
                  {available.map(a => (
                    <button
                      key={a.slug}
                      onClick={() => addAgent(a.slug)}
                      className="w-full text-left px-3 py-2 bg-muted/50 hover:bg-primary/10 hover:border-primary/30 border border-transparent rounded-lg text-xs text-foreground transition-all"
                    >
                      {a.name}
                    </button>
                  ))}
                  <button onClick={() => setAddingSlot(null)} className="w-full text-xs text-muted-foreground hover:text-foreground mt-1">
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Agregar agente</p>
                  <button
                    onClick={() => setAddingSlot(-1)}
                    className="px-4 py-1.5 border border-border rounded-lg text-xs text-foreground hover:border-primary/40 transition-all"
                  >
                    Seleccionar
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── COMPARISON TABLE ──────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">

          {/* Section: Información general */}
          <div className="px-5 py-3 bg-muted/40 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Información general</span>
          </div>

          {[
            { label: 'Categoría', render: (a: Agent) => <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">{a.category}</span> },
            { label: 'Setup', render: (a: Agent) => <span className="flex items-center gap-1 text-sm text-foreground"><Clock className="w-3.5 h-3.5 text-muted-foreground" />{a.setup_time_hours}h</span> },
            { label: 'Plan Básico', render: (a: Agent) => <span className="font-bold text-foreground">${a.pricing_basic}<span className="text-xs text-muted-foreground font-normal">/mes</span></span> },
            { label: 'Plan Pro', render: (a: Agent) => <span className="font-bold text-primary">${a.pricing_pro}<span className="text-xs text-muted-foreground font-normal">/mes</span></span> },
            { label: 'Demo disponible', render: (a: Agent) => a.demo_available ? <CheckCircle className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-muted-foreground" /> },
          ].map(row => (
            <div
              key={row.label}
              className="grid border-b border-border last:border-0"
              style={{ gridTemplateColumns: `200px repeat(${agents.length}, 1fr)` }}
            >
              <div className="px-5 py-3.5 flex items-center text-sm text-muted-foreground border-r border-border font-medium">
                {row.label}
              </div>
              {agents.map(agent => (
                <div key={agent.slug} className="px-5 py-3.5 flex items-center border-r border-border last:border-0">
                  {row.render(agent)}
                </div>
              ))}
            </div>
          ))}

          {/* Section: Capacidades */}
          <div className="px-5 py-3 bg-muted/40 border-b border-border border-t border-t-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacidades</span>
          </div>

          {ALL_CAPABILITIES.filter(cap =>
            agents.some(a => a.capabilities.includes(cap))
          ).map(cap => (
            <div
              key={cap}
              className="grid border-b border-border last:border-0"
              style={{ gridTemplateColumns: `200px repeat(${agents.length}, 1fr)` }}
            >
              <div className="px-5 py-3 flex items-center text-sm text-muted-foreground border-r border-border">
                <Zap className="w-3.5 h-3.5 mr-2 text-primary/50 shrink-0" />
                {cap}
              </div>
              {agents.map(agent => (
                <div key={agent.slug} className="px-5 py-3 flex items-center border-r border-border last:border-0">
                  {agent.capabilities.includes(cap)
                    ? <CheckCircle className="w-4 h-4 text-green-400" />
                    : <span className="w-4 h-0.5 bg-border rounded-full" />
                  }
                </div>
              ))}
            </div>
          ))}

          {/* Section: Integraciones */}
          <div className="px-5 py-3 bg-muted/40 border-b border-border border-t border-t-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integraciones incluidas</span>
          </div>

          <div
            className="grid border-b border-border"
            style={{ gridTemplateColumns: `200px repeat(${agents.length}, 1fr)` }}
          >
            <div className="px-5 py-4 flex items-start text-sm text-muted-foreground border-r border-border">
              Plataformas
            </div>
            {agents.map(agent => (
              <div key={agent.slug} className="px-5 py-4 border-r border-border last:border-0">
                <div className="flex flex-wrap gap-1.5">
                  {agent.integrations.slice(0, 4).map(int => (
                    <span key={int} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                      {int}
                    </span>
                  ))}
                  {agent.integrations.length > 4 && (
                    <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                      +{agent.integrations.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section: Casos de uso */}
          <div className="px-5 py-3 bg-muted/40 border-b border-border border-t border-t-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ideal para</span>
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: `200px repeat(${agents.length}, 1fr)` }}
          >
            <div className="px-5 py-4 flex items-start text-sm text-muted-foreground border-r border-border">
              <Users className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              Industrias
            </div>
            {agents.map(agent => (
              <div key={agent.slug} className="px-5 py-4 border-r border-border last:border-0">
                <div className="space-y-1">
                  {agent.use_cases.map(uc => (
                    <div key={uc} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                      {uc}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA row */}
        <div
          className="grid gap-5 mt-6"
          style={{ gridTemplateColumns: `200px repeat(${agents.length}, 1fr)` }}
        >
          <div className="flex items-center text-sm text-muted-foreground">
            ¿Cuál elegís?
          </div>
          {agents.map(agent => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.slug}`}
              className="py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm text-center hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              Activar {agent.name.split(' ')[0]}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
