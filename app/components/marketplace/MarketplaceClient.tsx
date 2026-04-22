'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Bot, Zap, ArrowRight, Clock, Flame,
  Building2, ShoppingCart, Briefcase, HeartPulse,
  TrendingUp, Users, Shield, CheckCircle, Package,
  SlidersHorizontal, GitCompare, Star, ChevronRight, Sparkles,
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  slug: string
  tagline: string
  category: string
  capabilities: string[]
  pricing_basic: number
  pricing_pro: number
  featured: boolean
  demo_available: boolean
}

const AGENTS: Agent[] = [
  { id: '1', name: 'Sales AI Closer', slug: 'sales-ai-closer', tagline: 'Cierra más ventas, automatiza el seguimiento de leads', category: 'Ventas', capabilities: ['Calificación de leads', 'Seguimiento automático', 'Integración CRM'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
  { id: '2', name: 'AI Support Agent', slug: 'ai-support-agent', tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde', category: 'Soporte', capabilities: ['Resolución autónoma 80%', 'Escalada inteligente', 'Multicanal'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
  { id: '3', name: 'AI Lead Engine', slug: 'ai-lead-engine', tagline: 'Genera y califica leads 24/7 en piloto automático', category: 'Ventas', capabilities: ['Captura multicanal', 'Scoring automático', 'Alertas tiempo real'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
  { id: '4', name: 'Marketing AI Agent', slug: 'marketing-ai-agent', tagline: 'Automatiza reportes, contenido y campañas de marketing', category: 'Marketing', capabilities: ['Reportes automáticos', 'Generación de contenido', 'Análisis de campañas'], pricing_basic: 447, pricing_pro: 697, featured: false, demo_available: true },
  { id: '5', name: 'E-Commerce Agent', slug: 'ecommerce-agent', tagline: 'Recupera carritos, cross-sell y retención automatizada', category: 'E-commerce', capabilities: ['Recuperación de carritos', 'Cross-sell y upsell', 'Post-venta automática'], pricing_basic: 447, pricing_pro: 697, featured: false, demo_available: true },
  { id: '6', name: 'Appointment Setting', slug: 'appointment-setting-agent', tagline: 'Agenda reuniones y demos de forma completamente automática', category: 'Ventas', capabilities: ['Agendamiento automático', 'Calificación previa', 'Recordatorios multicanal'], pricing_basic: 397, pricing_pro: 597, featured: true, demo_available: true },
]

const COLLECTIONS = [
  {
    id: 'inmobiliarias',
    name: 'Pack Inmobiliarias',
    description: 'Calificá compradores, agendá visitas y convertí leads en operaciones.',
    agents: ['Sales AI Closer', 'Appointment Setting', 'AI Support Agent'],
    icon: Building2,
    gradient: 'from-blue-600/20 to-indigo-600/20',
    border: 'border-blue-500/30 hover:border-blue-400/60',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    price: 897,
    savings: 294,
    industry: 'inmobiliarias',
  },
  {
    id: 'ecommerce',
    name: 'Pack E-Commerce',
    description: 'Recuperá carritos abandonados, upsell automático y soporte 24/7.',
    agents: ['E-Commerce Agent', 'AI Lead Engine', 'AI Support Agent'],
    icon: ShoppingCart,
    gradient: 'from-cyan-600/20 to-blue-600/20',
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    price: 897,
    savings: 294,
    industry: 'ecommerce',
  },
  {
    id: 'agencias',
    name: 'Pack Agencias',
    description: 'Generá leads, automatizá reportes y cerrá más campañas para clientes.',
    agents: ['Marketing AI Agent', 'Sales AI Closer', 'AI Lead Engine'],
    icon: Briefcase,
    gradient: 'from-violet-600/20 to-purple-600/20',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    price: 1047,
    savings: 294,
    industry: 'agencias',
  },
  {
    id: 'clinicas',
    name: 'Pack Salud & Clínicas',
    description: 'Agendá consultas, enviá recordatorios y calificá pacientes automáticamente.',
    agents: ['Appointment Setting', 'AI Support Agent', 'AI Lead Engine'],
    icon: HeartPulse,
    gradient: 'from-rose-600/20 to-pink-600/20',
    border: 'border-rose-500/30 hover:border-rose-400/60',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    price: 897,
    savings: 294,
    industry: 'clinicas',
  },
]

const CATEGORIES = ['Todos', 'Ventas', 'Soporte', 'Marketing', 'E-commerce']

const gradients: Record<string, string> = {
  Ventas: 'from-blue-500 to-indigo-600',
  Soporte: 'from-violet-500 to-purple-600',
  Marketing: 'from-violet-500 to-purple-500',
  'E-commerce': 'from-cyan-500 to-blue-600',
  Operaciones: 'from-sky-500 to-blue-600',
}

const categoryColors: Record<string, string> = {
  Ventas: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  Soporte: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Marketing: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'E-commerce': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
}

export default function MarketplaceClient() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [compareList, setCompareList] = useState<string[]>([])

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
    return AGENTS.filter(a => {
      const matchCat = activeCategory === 'Todos' || a.category === activeCategory
      const matchQ = !search || [a.name, a.tagline, a.category].some(
        s => s.toLowerCase().includes(search.toLowerCase())
      )
      return matchCat && matchQ
    })
  }, [search, activeCategory])

  const trending = AGENTS.filter(a => a.featured)

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Marketplace de Agentes IA
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground mb-5 leading-tight">
            Tu próximo agente IA<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              está a un clic
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Explorá, comparás y activás agentes especializados para cada área de tu empresa.
            Setup en 24 horas. Sin código. Sin complicaciones.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar agente por nombre, categoría o función..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && search) router.push(`/agents?q=${encodeURIComponent(search)}`) }}
              className="w-full pl-12 pr-36 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-base transition-all shadow-custom"
            />
            <button
              onClick={() => search && router.push(`/agents?q=${encodeURIComponent(search)}`)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-glow transition-all"
            >
              Buscar
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {[
              { icon: Bot, label: '6 agentes disponibles', color: 'text-blue-400' },
              { icon: TrendingUp, label: '4 categorías', color: 'text-indigo-400' },
              { icon: Clock, label: 'Setup en 24h', color: 'text-violet-400' },
              { icon: Shield, label: 'Soporte incluido', color: 'text-green-400' },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* ── TRENDING ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-2xl font-bold text-foreground">Tendencias esta semana</h2>
            </div>
            <Link href="/agents" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((agent, i) => {
              const isComparing = compareList.includes(agent.slug)
              const grad = gradients[agent.category] ?? 'from-blue-500 to-indigo-600'
              return (
                <div
                  key={agent.id}
                  className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-custom transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-custom shrink-0`}>
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                        #{i + 1} Trending
                      </span>
                      {agent.demo_available && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          Demo vivo
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`self-start px-2 py-0.5 rounded-full text-xs font-medium border mb-2 ${categoryColors[agent.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {agent.category}
                  </span>

                  <h3 className="font-bold text-foreground mb-1 text-sm">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4 line-clamp-2">
                    {agent.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <span className="text-base font-bold text-foreground">${agent.pricing_basic}</span>
                      <span className="text-xs text-muted-foreground">/mes</span>
                    </div>
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 text-primary rounded-lg text-xs font-medium transition-all"
                    >
                      Ver <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Compare toggle */}
                  <button
                    onClick={() => toggleCompare(agent.slug)}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isComparing
                        ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                        : 'bg-transparent border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {isComparing ? '✓ Agregado a comparar' : '+ Comparar'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── EXPLORAR POR CATEGORÍA ─────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Explorar por categoría</h2>
            </div>
            <Link href="/agents" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Catálogo completo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-7 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary shadow-custom'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {cat}
                <span className="ml-1.5 text-xs opacity-60">
                  {cat === 'Todos' ? AGENTS.length : AGENTS.filter(a => a.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* Agent grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((agent) => {
              const isComparing = compareList.includes(agent.slug)
              const grad = gradients[agent.category] ?? 'from-blue-500 to-indigo-600'
              return (
                <div
                  key={agent.id}
                  className={`group bg-card border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                    isComparing
                      ? 'border-indigo-500/50 shadow-custom ring-1 ring-indigo-500/20'
                      : 'border-border hover:border-primary/40 hover:shadow-custom'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-custom shrink-0`}>
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    {agent.demo_available && (
                      <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Demo vivo
                      </span>
                    )}
                  </div>

                  <span className={`self-start px-2.5 py-1 rounded-full text-xs font-medium border mb-2 ${categoryColors[agent.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {agent.category}
                  </span>

                  <h3 className="font-bold text-foreground mb-1">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4 line-clamp-2">{agent.tagline}</p>

                  <ul className="space-y-1.5 mb-4">
                    {agent.capabilities.slice(0, 3).map(cap => (
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
                      className="group-hover:bg-primary group-hover:text-white group-hover:border-primary flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground transition-all"
                    >
                      Ver agente <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  <button
                    onClick={() => toggleCompare(agent.slug)}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isComparing
                        ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                        : 'bg-transparent border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {isComparing ? '✓ En comparación' : '+ Agregar a comparar'}
                  </button>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No encontramos agentes para esa búsqueda</p>
              <button onClick={() => { setSearch(''); setActiveCategory('Todos') }} className="mt-3 text-primary text-sm hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </section>

        {/* ── COLECCIONES POR INDUSTRIA ─────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-400" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Packs por industria</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Combinaciones curadas con descuento para tu sector</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COLLECTIONS.map(col => {
              const Icon = col.icon
              return (
                <Link
                  key={col.id}
                  href={`/para/${col.industry}`}
                  className={`group bg-gradient-to-br ${col.gradient} border ${col.border} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-custom block`}
                >
                  <div className={`w-12 h-12 ${col.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${col.iconColor}`} />
                  </div>

                  <h3 className="font-bold text-foreground mb-1">{col.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{col.description}</p>

                  <div className="space-y-1 mb-4">
                    {col.agents.map(name => (
                      <div key={name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Bot className="w-3 h-3 shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <div className="text-base font-bold text-foreground">${col.price}<span className="text-xs text-muted-foreground">/mes</span></div>
                      <div className="text-xs text-green-400">Ahorrás ${col.savings}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${col.iconColor} group-hover:translate-x-0.5 transition-transform`} />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── WHY US ───────────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-3xl p-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">¿Por qué TuAgenteStore?</h2>
            <p className="text-muted-foreground">No vendemos promesas, entregamos resultados en 24 horas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: 'Setup en 24h', desc: 'Implementamos y configuramos todo. Vos solo aprobás y usás.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Shield, title: 'Sin riesgos', desc: 'Probá el demo antes de activar. Sin tarjeta de crédito inicial.', color: 'text-green-400', bg: 'bg-green-500/10' },
              { icon: Users, title: 'Soporte real', desc: 'Equipo disponible de lunes a viernes con respuesta en menos de 4h.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { icon: TrendingUp, title: 'ROI medible', desc: 'Dashboard con horas ahorradas, tickets deflectados y acciones.', color: 'text-orange-400', bg: 'bg-orange-500/10' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="text-center">
                  <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── CATÁLOGO N8N — teaser ────────────────────────────── */}
        <section className="bg-gradient-to-br from-violet-600/10 via-blue-600/5 to-indigo-600/10 border border-violet-500/20 rounded-3xl p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Exclusivo para miembros
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Catálogo completo de<br />
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  75+ Automatizaciones n8n
                </span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                WhatsApp, Email, Telegram, Redes Sociales, IA, RRHH, Google Workspace y más.
                Cada automatización viene con integraciones, casos de uso y setup en 24h.
              </p>
              <div className="flex flex-wrap gap-2">
                {['WhatsApp', 'Email', 'Telegram', 'IA & Modelos', 'Google Workspace', 'RRHH'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:shrink-0">
              <Link
                href="/marketplace/catalogo"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-semibold text-sm hover:shadow-glow transition-all whitespace-nowrap"
              >
                <Bot className="w-4 h-4" />
                Ver catálogo completo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                Requiere iniciar sesión
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA BOTTOM ───────────────────────────────────────── */}
        <section className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-5">
            <Sparkles className="w-4 h-4" />
            ¿No encontrás lo que necesitás?
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Pedimos un agente a medida
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Describinos tu proceso y te proponemos la solución exacta para tu negocio.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all"
            >
              Solicitar agente personalizado
            </Link>
            <Link
              href="/wizard"
              className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:border-primary/40 transition-all"
            >
              Usar el Wizard IA
            </Link>
          </div>
        </section>
      </div>

      {/* ── COMPARE FLOATING BAR ─────────────────────────────── */}
      {compareList.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 px-6 py-3.5 bg-card border border-primary/40 rounded-2xl shadow-glow backdrop-blur-xl">
            <GitCompare className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-foreground font-medium">
              {compareList.length} agentes seleccionados
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
