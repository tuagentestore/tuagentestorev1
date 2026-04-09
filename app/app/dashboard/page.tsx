'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, Zap, TrendingUp, Clock, ArrowRight, Plus, AlertCircle } from 'lucide-react'

interface UserAgent {
  id: string
  agent_name: string
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

const statusConfig = {
  active: { label: 'Activo', color: 'text-green-400', dot: 'bg-green-400', bg: 'bg-green-400/10 border-green-500/20' },
  paused: { label: 'Pausado', color: 'text-yellow-400', dot: 'bg-yellow-400', bg: 'bg-yellow-400/10 border-yellow-500/20' },
  inactive: { label: 'Inactivo', color: 'text-muted-foreground', dot: 'bg-muted-foreground', bg: 'bg-muted border-border' },
}

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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-card rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const totalActions = agents.reduce((sum, a) => sum + (a.actions_count ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Hola, {user?.full_name?.split(' ')[0] ?? 'bienvenido'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.tenant_name} ·{' '}
              <span className="capitalize text-primary">{user?.plan ?? 'starter'}</span>
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Agentes activos', value: activeCount, icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Acciones ejecutadas', value: totalActions.toLocaleString(), icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Plan actual', value: user?.plan ?? 'Starter', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Agents list */}
        <div className="bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-bold text-foreground text-lg">Mis Agentes</h2>
            <span className="text-sm text-muted-foreground">{agents.length} agente{agents.length !== 1 ? 's' : ''}</span>
          </div>

          {agents.length === 0 ? (
            <div className="py-16 text-center">
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
            <div className="divide-y divide-border">
              {agents.map(agent => {
                const cfg = statusConfig[agent.status] ?? statusConfig.inactive
                return (
                  <div key={agent.id} className="flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{agent.agent_name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        {agent.last_activity && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Última actividad: {new Date(agent.last_activity).toLocaleDateString('es-AR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-foreground">{agent.actions_count?.toLocaleString() ?? 0}</div>
                      <div className="text-xs text-muted-foreground">acciones</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending reservation notice */}
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
