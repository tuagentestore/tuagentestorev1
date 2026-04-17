'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bot, Zap, TrendingUp, Clock, ArrowRight, Plus, AlertCircle,
  Activity, BarChart2, Settings, Pause, Play, ExternalLink,
  CheckCircle, Package, ChevronRight,
} from 'lucide-react'

interface UserAgent {
  id: string
  agent_name: string
  agent_slug?: string
  status: 'active' | 'paused' | 'inactive'
  activation_date: string
  actions_count: number
  last_activity: string | null
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  tenant_name: string
  plan: string
  subscription_status: string | null
}

const PLAN_LIMITS: Record<string, number> = {
  starter: 500,
  pro: 2000,
  enterprise: 999999,
}

const statusConfig = {
  active: {
    label: 'Activo',
    color: 'text-green-400',
    dot: 'bg-green-400',
    bg: 'bg-green-400/10 border-green-500/20',
    pulse: true,
  },
  paused: {
    label: 'Pausado',
    color: 'text-yellow-400',
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-500/20',
    pulse: false,
  },
  inactive: {
    label: 'Inactivo',
    color: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
    bg: 'bg-muted border-border',
    pulse: false,
  },
}

const agentGradients = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-sky-500 to-blue-600',
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-violet-600',
]

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [agents, setAgents] = useState<UserAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch('/api/user-agents').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([userData, agentsData]) => {
      setUser(userData?.user ?? null)
      setAgents(agentsData?.agents ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl" />)}
          </div>
          <div className="h-64 bg-card rounded-2xl" />
        </div>
      </div>
    )
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const totalActions = agents.reduce((sum, a) => sum + (a.actions_count ?? 0), 0)
  const planLimit = PLAN_LIMITS[user?.plan?.toLowerCase() ?? 'starter'] ?? 500
  const usagePct = Math.min(Math.round((totalActions / planLimit) * 100), 100)
  const planLabel = user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Starter'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── HEADER ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Hola, {user?.full_name?.split(' ')[0] ?? 'bienvenido'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.tenant_name} ·{' '}
              <span className="capitalize text-primary font-medium">{planLabel}</span>
            </p>
          </div>
          <Link
            href="/agents"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            Activar nuevo agente
          </Link>
        </div>

        {/* ── STATS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Agentes activos', value: activeCount, icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Acciones ejecutadas', value: totalActions.toLocaleString('es-AR'), icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Plan actual', value: planLabel, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── USAGE BAR ──────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Uso del plan {planLabel}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalActions.toLocaleString('es-AR')} / {planLimit === 999999 ? '∞' : planLimit.toLocaleString('es-AR')} acciones
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                usagePct >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : usagePct >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{usagePct}% utilizado</span>
            {usagePct >= 80 && (
              <Link href="/pricing" className="text-xs text-primary hover:underline flex items-center gap-1">
                Subir de plan <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* ── AGENT CARDS ────────────────────────────── */}
        {agents.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl py-16 text-center">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Todavía no tenés agentes activos</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Explorá el catálogo, probá demos y activá tu primer agente IA.
            </p>
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
            >
              Explorar agentes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Mis Agentes</h2>
              <span className="text-sm text-muted-foreground">{agents.length} agente{agents.length !== 1 ? 's' : ''}</span>
            </div>

            {agents.map((agent, i) => {
              const cfg = statusConfig[agent.status] ?? statusConfig.inactive
              const grad = agentGradients[i % agentGradients.length]
              const agentUsagePct = planLimit === 999999 ? 0 : Math.min(Math.round((agent.actions_count / planLimit) * 100), 100)
              const agentSlug = agent.agent_slug ?? agent.agent_name?.toLowerCase().replace(/\s+/g, '-')

              return (
                <div
                  key={agent.id}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                    {/* Icon + name */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shrink-0`}>
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground">{agent.agent_name}</h3>
                          <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {cfg.pulse && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />}
                            {!cfg.pulse && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            Activado {new Date(agent.activation_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {agent.last_activity && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Última actividad: {new Date(agent.last_activity).toLocaleDateString('es-AR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex gap-6 sm:gap-8 shrink-0">
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">{agent.actions_count?.toLocaleString('es-AR') ?? 0}</div>
                        <div className="text-xs text-muted-foreground">acciones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">{agentUsagePct > 0 ? `${agentUsagePct}%` : '—'}</div>
                        <div className="text-xs text-muted-foreground">del plan</div>
                      </div>
                    </div>
                  </div>

                  {/* Usage mini bar */}
                  {agentUsagePct > 0 && (
                    <div className="mt-4">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            agentUsagePct >= 90 ? 'bg-red-500'
                            : agentUsagePct >= 70 ? 'bg-yellow-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{ width: `${agentUsagePct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                    <Link
                      href={`/agents/${agentSlug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 rounded-lg text-xs font-medium text-foreground transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver agente
                    </Link>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
                      <Activity className="w-3.5 h-3.5" />
                      Actividad
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
                      <Settings className="w-3.5 h-3.5" />
                      Configurar
                    </button>
                    {agent.status === 'active' ? (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs font-medium text-yellow-400 hover:bg-yellow-500/20 transition-all ml-auto">
                        <Pause className="w-3.5 h-3.5" />
                        Pausar
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-medium text-green-400 hover:bg-green-500/20 transition-all ml-auto">
                        <Play className="w-3.5 h-3.5" />
                        Activar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── EXPLORE MORE ────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/marketplace"
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Explorar Marketplace</p>
              <p className="text-xs text-muted-foreground">Descubrí más agentes y packs por industria</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/pricing"
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl hover:border-violet-500/40 transition-all group"
          >
            <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Mejorar plan</p>
              <p className="text-xs text-muted-foreground">Más acciones, más canales, más agentes</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* ── SUBSCRIPTION NOTICE ─────────────────────── */}
        {user?.subscription_status !== 'active' && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Sin suscripción activa</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Reservá un agente para activar tu plan.{' '}
                <Link href="/agents" className="text-primary hover:underline">Ver catálogo →</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
