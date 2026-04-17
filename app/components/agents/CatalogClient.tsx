'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Bot, ArrowRight, Zap, SlidersHorizontal, X,
  GitCompare, ArrowUpDown, LayoutGrid, List, CheckCircle,
} from 'lucide-react'

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
  setup_time_hours?: number
}

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'setup_asc'

const CATEGORIES = ['Todos', 'Ventas', 'Soporte', 'Marketing', 'E-commerce', 'Operaciones']

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Destacados' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'setup_asc', label: 'Setup más rápido' },
]

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

const STATIC_AGENTS: Agent[] = [
  { id: '1', name: 'Sales AI Closer', slug: 'sales-ai-closer', tagline: 'Cierra más ventas, automatiza el seguimiento de leads', category: 'Ventas', capabilities: ['Calificación de leads', 'Seguimiento automático', 'Integración CRM'], integrations: ['HubSpot', 'WhatsApp', 'Gmail'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true, setup_time_hours: 24 },
  { id: '2', name: 'AI Support Agent', slug: 'ai-support-agent', tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde', category: 'Soporte', capabilities: ['Resolución autónoma 80%', 'Escalada inteligente', 'Multicanal'], integrations: ['Zendesk', 'WhatsApp', 'Gmail'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true, setup_time_hours: 24 },
  { id: '3', name: 'AI Lead Engine', slug: 'ai-lead-engine', tagline: 'Genera y califica leads 24/7 en piloto automático', category: 'Ventas', capabilities: ['Captura multicanal', 'Scoring automático', 'Alertas tiempo real'], integrations: ['Facebook Ads', 'LinkedIn', 'HubSpot'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true, setup_time_hours: 24 },
  { id: '4', name: 'Marketing AI Agent', slug: 'marketing-ai-agent', tagline: 'Automatiza reportes, contenido y campañas de marketing', category: 'Marketing', capabilities: ['Reportes automáticos', 'Generación de contenido', 'Análisis de campañas'], integrations: ['Google Analytics', 'Meta Ads', 'Mailchimp'], pricing_basic: 447, pricing_pro: 697, featured: false, demo_available: true, setup_time_hours: 48 },
  { id: '5', name: 'E-Commerce Agent', slug: 'ecommerce-agent', tagline: 'Recupera carritos, cross-sell y retención automatizada', category: 'E-commerce', capabilities: ['Recuperación de carritos', 'Cross-sell y upsell', 'Post-venta automática'], integrations: ['Shopify', 'WooCommerce', 'MercadoLibre'], pricing_basic: 447, pricing_pro: 697, featured: false, demo_available: true, setup_time_hours: 24 },
  { id: '6', name: 'Appointment Setting', slug: 'appointment-setting-agent', tagline: 'Agenda reuniones y demos de forma completamente automática', category: 'Ventas', capabilities: ['Agendamiento automático', 'Calificación previa', 'Recordatorios multicanal'], integrations: ['Calendly', 'Google Calendar', 'WhatsApp'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true, setup_time_hours: 12 },
]

export default function CatalogClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [agents, setAgents] = useState<Agent[]>(STATIC_AGENTS)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [compareList, setCompareList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showSort, setShowSort] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/agents')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.agents?.length) setAgents(data.agents) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleCompare = (slug: string) => {
    setCompareList(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug)
      if (prev.length >= 3) return prev
      return [...prev, slug]
    })
  }

  const goToCompare = () => {
    const params = compareList.map((s, i) => `${'abc'[i]}=${s}`).join('&')
    router.push(`/marketplace/comparar?${params}`)
  }

  const filtered = useMemo(() => {
    let list = agents.filter(a => {
      const matchCat = activeCategory === 'Todos' || a.category === activeCategory
      const matchQ = !query || [a.name, a.tagline, a.category].some(
        s => s?.toLowerCase().includes(query.toLowerCase())
      )
      return matchCat && matchQ
    })

    switch (sortKey) {
      case 'price_asc': list = [...list].sort((a, b) => a.pricing_basic - b.pricing_basic); break
      case 'price_desc': list = [...list].sort((a, b) => b.pricing_basic - a.pricing_basic); break
      case 'setup_asc': list = [...list].sort((a, b) => (a.setup_time_hours ?? 99) - (b.setup_time_hours ?? 99)); break
      default: list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }
    return list
  }, [agents, query, activeCategory, sortKey])

  return (
    <div>
      {/* ── TOOLBAR ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search row */}
        <div className="flex gap-3">
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

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(v => !v)}
              className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <ArrowUpDown className="w-4 h-4" />
              {SORT_OPTIONS.find(o => o.value === sortKey)?.label}
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-custom z-10 overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortKey(opt.value); setShowSort(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortKey === opt.value ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-muted'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category tabs */}
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

      {/* Results info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {filtered.length} agente{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
        </p>
        {compareList.length > 0 && (
          <span className="text-xs text-primary">
            {compareList.length} seleccionado{compareList.length > 1 ? 's' : ''} para comparar
          </span>
        )}
      </div>

      {/* ── GRID / LIST ──────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 h-64 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-xl mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((agent, i) => {
            const isComparing = compareList.includes(agent.slug)
            return (
              <div
                key={agent.id}
                className={`group bg-card border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                  isComparing
                    ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-custom'
                    : 'border-border hover:border-primary/40 hover:shadow-custom'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-custom`}>
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  {agent.demo_available && (
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Demo vivo
                    </span>
                  )}
                </div>

                <span className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-medium border mb-2 ${categoryColors[agent.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                  {agent.category}
                </span>

                <h3 className="font-bold text-foreground mb-1">{agent.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">{agent.tagline}</p>

                <ul className="space-y-1.5 mb-4">
                  {agent.capabilities?.slice(0, 3).map(cap => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-lg font-bold text-foreground">${agent.pricing_basic}</span>
                    <span className="text-xs text-muted-foreground">/mes</span>
                  </div>
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="group-hover:bg-primary group-hover:text-primary-foreground flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-all"
                  >
                    Ver agente
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Compare toggle */}
                <button
                  onClick={() => toggleCompare(agent.slug)}
                  className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isComparing
                      ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                      : 'bg-transparent border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  } ${compareList.length >= 3 && !isComparing ? 'opacity-40 cursor-not-allowed' : ''}`}
                  disabled={compareList.length >= 3 && !isComparing}
                >
                  {isComparing ? '✓ En comparación' : '+ Comparar'}
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-3">
          {filtered.map((agent, i) => {
            const isComparing = compareList.includes(agent.slug)
            return (
              <div
                key={agent.id}
                className={`flex items-center gap-5 p-5 bg-card border rounded-2xl transition-all ${
                  isComparing
                    ? 'border-indigo-500/50 ring-1 ring-indigo-500/20'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-custom shrink-0`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-foreground">{agent.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColors[agent.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                      {agent.category}
                    </span>
                    {agent.demo_available && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{agent.tagline}</p>
                  <div className="flex gap-3 mt-1.5">
                    {agent.capabilities?.slice(0, 3).map(cap => (
                      <span key={cap} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3 text-primary" />
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-base font-bold text-foreground">${agent.pricing_basic}<span className="text-xs text-muted-foreground font-normal">/mes</span></div>
                  {agent.setup_time_hours && (
                    <div className="text-xs text-muted-foreground">Setup {agent.setup_time_hours}h</div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:shadow-glow transition-all text-center"
                  >
                    Ver agente
                  </Link>
                  <button
                    onClick={() => toggleCompare(agent.slug)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isComparing
                        ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                        : 'border-border text-muted-foreground hover:border-primary/30'
                    }`}
                    disabled={compareList.length >= 3 && !isComparing}
                  >
                    {isComparing ? '✓ Comparar' : '+ Comparar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── COMPARE FLOAT BAR ────────────────────────────── */}
      {compareList.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 px-6 py-3.5 bg-card border border-primary/40 rounded-2xl shadow-glow backdrop-blur-xl">
            <GitCompare className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-foreground font-medium">
              {compareList.length} agentes para comparar
            </span>
            <button
              onClick={goToCompare}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:shadow-glow transition-all"
            >
              Comparar ahora
            </button>
            <button
              onClick={() => setCompareList([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
