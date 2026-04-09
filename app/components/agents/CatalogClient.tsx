'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Bot, ArrowRight, Zap, SlidersHorizontal, X } from 'lucide-react'

interface Agent {
  id: string
  name: string
  slug: string
  tagline: string
  category: string
  capabilities: string[]
  integrations: string[]
  pricing_basic: number
  pricing_pro: number
  featured: boolean
  demo_available: boolean
}

const CATEGORIES = ['Todos', 'Ventas', 'Soporte', 'Marketing', 'E-commerce', 'Operaciones']

const categoryColors: Record<string, string> = {
  Ventas: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  Soporte: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Marketing: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'E-commerce': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  Operaciones: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
}

const gradients = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-cyan-500 to-blue-600',
]

// Static fallback if API isn't ready
const STATIC_AGENTS: Agent[] = [
  { id: '1', name: 'Sales AI Closer', slug: 'sales-ai-closer', tagline: 'Cierra más ventas, automatiza el seguimiento de leads', category: 'Ventas', capabilities: ['Calificación de leads', 'Seguimiento automático', 'Integración CRM'], integrations: ['HubSpot', 'WhatsApp', 'Gmail'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
  { id: '2', name: 'AI Support Agent', slug: 'ai-support-agent', tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde', category: 'Soporte', capabilities: ['Resolución autónoma 80%', 'Escalada inteligente', 'Multicanal'], integrations: ['Zendesk', 'WhatsApp', 'Gmail'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
  { id: '3', name: 'AI Lead Engine', slug: 'ai-lead-engine', tagline: 'Genera y califica leads 24/7 en piloto automático', category: 'Ventas', capabilities: ['Captura multicanal', 'Scoring automático', 'Alertas tiempo real'], integrations: ['Facebook Ads', 'LinkedIn', 'HubSpot'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
  { id: '4', name: 'Marketing AI Agent', slug: 'marketing-ai-agent', tagline: 'Automatiza reportes, contenido y campañas de marketing', category: 'Marketing', capabilities: ['Reportes automáticos', 'Generación de contenido', 'Análisis de campañas'], integrations: ['Google Analytics', 'Meta Ads', 'Mailchimp'], pricing_basic: 447, pricing_pro: 697, featured: false, demo_available: true },
  { id: '5', name: 'E-Commerce Agent', slug: 'ecommerce-agent', tagline: 'Recupera carritos, cross-sell y retención automatizada', category: 'E-commerce', capabilities: ['Recuperación de carritos', 'Cross-sell y upsell', 'Post-venta automática'], integrations: ['Shopify', 'WooCommerce', 'MercadoLibre'], pricing_basic: 447, pricing_pro: 697, featured: false, demo_available: true },
  { id: '6', name: 'Appointment Setting', slug: 'appointment-setting-agent', tagline: 'Agenda reuniones y demos de forma completamente automática', category: 'Ventas', capabilities: ['Agendamiento automático', 'Calificación previa', 'Recordatorios multicanal'], integrations: ['Calendly', 'Google Calendar', 'WhatsApp'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
]

export default function CatalogClient() {
  const [agents, setAgents] = useState<Agent[]>(STATIC_AGENTS)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/agents')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.agents?.length) setAgents(data.agents) })
      .catch(() => {}) // keep static fallback
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return agents.filter(a => {
      const matchCat = activeCategory === 'Todos' || a.category === activeCategory
      const matchQ = !query || [a.name, a.tagline, a.category].some(
        s => s?.toLowerCase().includes(query.toLowerCase())
      )
      return matchCat && matchQ
    })
  }, [agents, query, activeCategory])

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar agente..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-xl overflow-x-auto">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-custom'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-6">
        {filtered.length} agente{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 h-64 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-xl mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
              <div className="h-3 bg-muted rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">No encontramos agentes</p>
          <p className="text-muted-foreground text-sm">Probá con otra búsqueda o categoría</p>
          <button onClick={() => { setQuery(''); setActiveCategory('Todos') }} className="mt-4 text-primary text-sm hover:underline">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((agent, i) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.slug}`}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-custom transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-custom`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                {agent.demo_available && (
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium">
                    Demo vivo
                  </span>
                )}
              </div>

              {/* Category */}
              <span className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-medium border mb-2 ${categoryColors[agent.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                {agent.category}
              </span>

              {/* Name + tagline */}
              <h3 className="font-bold text-foreground mb-1">{agent.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                {agent.tagline}
              </p>

              {/* Capabilities */}
              <ul className="space-y-1.5 mb-4">
                {agent.capabilities?.slice(0, 3).map(cap => (
                  <li key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 text-primary shrink-0" />
                    {cap}
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-lg font-bold text-foreground">${agent.pricing_basic}</span>
                  <span className="text-xs text-muted-foreground">/mes</span>
                </div>
                <span className="group-hover:bg-primary group-hover:text-primary-foreground flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-all">
                  Ver agente
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
