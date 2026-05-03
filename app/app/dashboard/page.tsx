'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bot, Zap, TrendingUp, Clock, ArrowRight, Plus, AlertCircle,
  Activity, BarChart2, Settings, Pause, Play, ExternalLink,
  CheckCircle, Package, ChevronRight, RefreshCw, Cpu, Wifi,
  Shield, Bell, Search, LayoutDashboard, ListTodo, Sparkles,
  MousePointerClick, Eye, FileText, Calendar,
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

interface ActivityItem {
  id: string
  activity_type: string
  page: string | null
  agent_id: string | null
  metadata: Record<string, unknown>
  created_at: string
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
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'agents' | 'activity'>('overview')

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch('/api/user-agents').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/activity?limit=20').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([userData, agentsData, activityData]) => {
      setUser(userData?.user ?? null)
      setAgents(agentsData?.agents ?? [])
      setActivity(activityData?.activities ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
          <div className="absolute inset-2 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-4 border-4 border-r-indigo-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
      </div>
    )
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const totalActions = agents.reduce((sum, a) => sum + (a.actions_count ?? 0), 0)
  const planLimit = PLAN_LIMITS[user?.plan?.toLowerCase() ?? 'starter'] ?? 500
  const usagePct = Math.min(Math.round((totalActions / planLimit) * 100), 100)
  const planLabel = user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Starter'
  const firstName = user?.full_name?.split(' ')[0] ?? 'bienvenido'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Hola, {firstName}
            </h1>
            <p className="text-muted-foreground mt-0.5">
              {user?.tenant_name} ·{' '}
              <span className="text-primary font-medium capitalize">{planLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/agents"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Activar agente
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit mb-8 border border-border">
          {([
            { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
            { id: 'agents', label: 'Mis Agentes', icon: Bot },
            { id: 'activity', label: 'Actividad', icon: Activity },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: 'Agentes activos',
                  value: activeCount,
                  icon: Bot,
                  color: 'text-blue-400',
                  bg: 'from-blue-600/10 to-indigo-600/10',
                  border: 'border-blue-500/20',
                  sub: `${agents.length} total`,
                },
                {
                  label: 'Acciones ejecutadas',
                  value: totalActions.toLocaleString('es-AR'),
                  icon: Zap,
                  color: 'text-indigo-400',
                  bg: 'from-indigo-600/10 to-violet-600/10',
                  border: 'border-indigo-500/20',
                  sub: 'este mes',
                },
                {
                  label: 'Plan actual',
                  value: planLabel,
                  icon: TrendingUp,
                  color: 'text-violet-400',
                  bg: 'from-violet-600/10 to-purple-600/10',
                  border: 'border-violet-500/20',
                  sub: `${planLimit === 999999 ? 'ilimitado' : planLimit.toLocaleString()} acciones`,
                },
                {
                  label: 'Uso del plan',
                  value: `${usagePct}%`,
                  icon: BarChart2,
                  color: usagePct >= 80 ? 'text-orange-400' : 'text-cyan-400',
                  bg: 'from-cyan-600/10 to-blue-600/10',
                  border: 'border-cyan-500/20',
                  sub: `${totalActions.toLocaleString()} / ${planLimit === 999999 ? '∞' : planLimit.toLocaleString()}`,
                },
              ].map(stat => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.bg} border ${stat.border} rounded-2xl p-5 relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.sub}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${stat.bg} blur-xl opacity-60`} />
                </div>
              ))}
            </div>

            {/* Usage bar */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Actividad del plan</span>
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    En vivo
                  </span>
                </div>
                {usagePct >= 80 && (
                  <Link href="/pricing" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Subir de plan <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    usagePct >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : usagePct >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{usagePct}% utilizado</span>
                <span>{totalActions.toLocaleString('es-AR')} / {planLimit === 999999 ? '∞' : planLimit.toLocaleString('es-AR')} acciones</span>
              </div>
            </div>

            {/* System status row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Agentes online', val: activeCount, icon: Cpu, color: 'text-cyan-400', pct: agents.length > 0 ? Math.round((activeCount / agents.length) * 100) : 0 },
                { label: 'Disponibilidad', val: '99.9%', icon: Wifi, color: 'text-green-400', pct: 99 },
                { label: 'Seguridad', val: 'Activa', icon: Shield, color: 'text-violet-400', pct: 100 },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className={`text-lg font-bold ${s.color} mb-2`}>{s.val}</div>
                  <div className="h-1 bg-muted rounded-full">
                    <div className={`h-full rounded-full bg-gradient-to-r ${
                      s.color === 'text-cyan-400' ? 'from-cyan-500 to-blue-500'
                      : s.color === 'text-green-400' ? 'from-green-500 to-emerald-500'
                      : 'from-violet-500 to-purple-500'
                    }`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions + explore */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                href="/wizard"
                className="flex items-center gap-4 p-5 bg-gradient-to-br from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl hover:border-violet-500/40 transition-all group"
              >
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Wizard IA</p>
                  <p className="text-xs text-muted-foreground">Encontrá el agente ideal para tu caso de uso</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </>
        )}

        {tab === 'agents' && (
          <>
            {agents.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl py-20 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">Sin agentes activos aún</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  Explorá el catálogo, probá las demos y activá tu primer agente IA en menos de 24h.
                </p>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
                >
                  Explorar catálogo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
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

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                        <Link
                          href={`/agents/${agentSlug}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 rounded-lg text-xs font-medium text-foreground transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver agente
                        </Link>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
                          <Activity className="w-3.5 h-3.5" />
                          Actividad
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
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
          </>
        )}

        {/* ── Activity tab ── */}
        {tab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Historial de actividad</h2>
              <span className="text-sm text-muted-foreground">{activity.length} eventos recientes</span>
            </div>
            {activity.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl py-16 text-center">
                <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Sin actividad registrada aún</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map(a => {
                  const icon = a.activity_type.includes('demo') ? Bot
                    : a.activity_type.includes('view') || a.activity_type.includes('page') ? Eye
                    : a.activity_type.includes('reservation') ? Calendar
                    : a.activity_type.includes('click') ? MousePointerClick
                    : FileText
                  const Icon = icon
                  const label = a.activity_type
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase())
                  return (
                    <div key={a.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/20 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        {a.page && <p className="text-xs text-muted-foreground truncate">{a.page}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(a.created_at).toLocaleString('es-AR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Subscription notice */}
        {user?.subscription_status !== 'active' && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Sin suscripción activa</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Reservá un agente para activar tu plan.{' '}
                <Link href="/agents" className="text-primary hover:underline">Ver catálogo</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
