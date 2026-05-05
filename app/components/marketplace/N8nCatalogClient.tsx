'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Lock, Bot, CheckCircle, X, ChevronRight,
  Zap, Shield, Tag, Layers, ArrowRight, Sparkles,
  Mail, MessageCircle, Users, BarChart2, FileText,
  Database, Briefcase, Globe,
} from 'lucide-react'
import { N8N_CATALOG, N8N_CATEGORIES, type N8nAgent } from '@/lib/n8n-catalog'

/* ── helpers ─────────────────────────────────────────────────── */
const complexityColor: Record<string, string> = {
  'Básico':     'bg-green-500/10 text-green-400 border-green-500/20',
  'Intermedio': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Avanzado':   'bg-red-500/10 text-red-400 border-red-500/20',
}

const categoryIcons: Record<string, React.ElementType> = {
  'ventas-leads':      BarChart2,
  'whatsapp':          MessageCircle,
  'email':             Mail,
  'social-media':      Globe,
  'telegram':          Zap,
  'ia-modelos':        Sparkles,
  'documentos':        FileText,
  'google-workspace':  Database,
  'rrhh':              Users,
  'productividad':     Briefcase,
}

const categoryGradients: Record<string, string> = {
  'ventas-leads':      'from-blue-500 to-indigo-600',
  'whatsapp':          'from-green-500 to-emerald-600',
  'email':             'from-red-500 to-rose-600',
  'social-media':      'from-pink-500 to-purple-600',
  'telegram':          'from-sky-500 to-blue-600',
  'ia-modelos':        'from-violet-500 to-purple-600',
  'documentos':        'from-amber-500 to-orange-600',
  'google-workspace':  'from-cyan-500 to-blue-600',
  'rrhh':              'from-teal-500 to-green-600',
  'productividad':     'from-indigo-500 to-violet-600',
}

/* ── main component ──────────────────────────────────────────── */
export default function N8nCatalogClient() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('todos')
  const [selectedAgent, setSelectedAgent] = useState<N8nAgent | null>(null)
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return N8N_CATALOG.filter(a => {
      const matchCat = activeCategory === 'todos' || a.categorySlug === activeCategory
      const matchQ = !search || [a.name, a.description, a.category, ...a.tags].some(
        s => s.toLowerCase().includes(search.toLowerCase())
      )
      const matchPremium = !showPremiumOnly || a.isPremium
      return matchCat && matchQ && matchPremium
    })
  }, [search, activeCategory, showPremiumOnly])

  /* ── Auth gate (shown immediately while loading or when unauthenticated) ── */
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-lg">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              ← Volver al Marketplace
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
              Catálogo de <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Automatizaciones n8n</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {N8N_CATALOG.length} automatizaciones listas para activar en tu negocio
            </p>
          </div>
        </div>

        {/* Blurred preview grid */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 select-none">
            {N8N_CATALOG.slice(0, 9).map((agent) => {
              const Icon = categoryIcons[agent.categorySlug] ?? Bot
              const grad = categoryGradients[agent.categorySlug] ?? 'from-blue-500 to-indigo-600'
              return (
                <div key={agent.id} className="bg-card border border-border rounded-2xl p-6 blur-[2px] pointer-events-none">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">{agent.category}</p>
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{agent.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.integrations.slice(0, 3).map(i => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs">{i}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Lock overlay — only after auth confirms no user */}
          {!authLoading && !user && <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className="text-center max-w-md px-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Contenido exclusivo para miembros
              </h2>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Iniciá sesión para ver los {N8N_CATALOG.length} agentes y automatizaciones n8n disponibles,
                con detalles completos de integraciones y casos de uso.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all text-sm"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:border-primary/40 transition-all text-sm"
                >
                  Crear cuenta gratis
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                ¿Ya tenés acceso?{' '}
                <Link href="/login" className="text-primary hover:underline">Ingresá acá</Link>
              </p>
            </div>
          </div>}
        </div>
      </div>
    )
  }

  /* ── Authenticated catalog ── */
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-16 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Link href="/marketplace" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
                ← Marketplace
              </Link>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Catálogo de Automatizaciones n8n
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                  {N8N_CATALOG.length} disponibles
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar automatización..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {N8N_CATEGORIES.map(cat => {
              const Icon = categoryIcons[cat.id] ?? Layers
              const count = cat.id === 'todos'
                ? N8N_CATALOG.length
                : N8N_CATALOG.filter(a => a.categorySlug === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-custom'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {cat.id !== 'todos' && <Icon className="w-3.5 h-3.5" />}
                  {cat.label}
                  <span className="opacity-60 text-xs">{count}</span>
                </button>
              )
            })}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={e => setShowPremiumOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary"
              />
              Solo Premium (TuAgenteStore)
            </label>
            <span className="text-xs text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Agent grid */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Sin resultados para esa búsqueda</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('todos'); setShowPremiumOnly(false) }}
              className="mt-3 text-primary text-sm hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(agent => {
              const Icon = categoryIcons[agent.categorySlug] ?? Bot
              const grad = categoryGradients[agent.categorySlug] ?? 'from-blue-500 to-indigo-600'
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="group bg-card border border-border rounded-2xl p-5 text-left hover:border-primary/40 hover:shadow-custom transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {agent.isPremium && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
                          <Sparkles className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${complexityColor[agent.complexity]}`}>
                        {agent.complexity}
                      </span>
                    </div>
                  </div>

                  {/* Category label */}
                  <p className="text-xs text-muted-foreground mb-1">{agent.category}</p>

                  {/* Name */}
                  <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                    {agent.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3 line-clamp-3">
                    {agent.description}
                  </p>

                  {/* Integrations */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.integrations.slice(0, 3).map(i => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                        {i}
                      </span>
                    ))}
                    {agent.integrations.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                        +{agent.integrations.length - 3}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-1">
                      {agent.useCases.slice(0, 1).map(uc => (
                        <span key={uc} className="text-xs text-muted-foreground truncate max-w-[160px]">
                          ✓ {uc}
                        </span>
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ─────────────────────────────────────────── */}
      {selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedAgent(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryGradients[selectedAgent.categorySlug] ?? 'from-blue-500 to-indigo-600'} flex items-center justify-center shrink-0 shadow-custom`}>
                  {(() => {
                    const Icon = categoryIcons[selectedAgent.categorySlug] ?? Bot
                    return <Icon className="w-7 h-7 text-white" />
                  })()}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">{selectedAgent.category}</span>
                    {selectedAgent.isPremium && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        Premium TuAgenteStore
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {selectedAgent.name}
                  </h2>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${complexityColor[selectedAgent.complexity]}`}>
                  Complejidad: {selectedAgent.complexity}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                  n8n Workflow
                </span>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Descripción</h3>
                <p className="text-sm text-foreground leading-relaxed">{selectedAgent.description}</p>
              </div>

              {/* Use Cases */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Casos de uso</h3>
                <ul className="space-y-2">
                  {selectedAgent.useCases.map(uc => (
                    <li key={uc} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Integrations */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Integraciones incluidas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.integrations.map(i => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground font-medium">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-border">
                <a
                  href={`https://wa.me/5493437527193?text=Hola%2C+me+interesa+la+automatización+${encodeURIComponent(selectedAgent.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-glow transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Solicitar esta automatización
                </a>
                <Link
                  href="/wizard"
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-card border border-border text-foreground rounded-xl font-medium text-sm hover:border-primary/40 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Wizard IA
                </Link>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center mt-3">
                <Shield className="w-3 h-3 inline mr-1" />
                Setup en 24h · Sin código · Soporte incluido
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
