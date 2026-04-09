'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Bot, DollarSign, Eye, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'

interface KPIs {
  leads_today: number
  demos_24h: number
  revenue_month_usd: number
  reservations_by_status: Record<string, number>
  pipeline_30d: { date: string; count: number }[]
}

interface Reservation {
  id: string
  user_name: string
  user_email: string
  phone: string
  company: string
  status: string
  plan_interest: string
  agent_name: string | null
  created_at: string
  admin_notes: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  new: { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Eye },
  contacted: { label: 'Contactado', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  qualified: { label: 'Calificado', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: TrendingUp },
  validated: { label: 'Validado', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: CheckCircle },
  paid: { label: 'Pagado', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: DollarSign },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
  no_show: { label: 'No-show', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
}

const NEXT_STATUS: Record<string, string> = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'validated',
  validated: 'paid',
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/reservations').then(r => r.ok ? r.json() : null),
    ]).then(([kpisData, resData]) => {
      if (kpisData) setKpis(kpisData)
      if (resData?.reservations) setReservations(resData.reservations)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const advanceStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      }
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter)

  const totalLeads = Object.values(kpis?.reservations_by_status ?? {}).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Panel Admin</h1>
            <p className="text-muted-foreground mt-1">TuAgente Store — operaciones centralizadas</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Leads hoy', value: kpis?.leads_today ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Demos 24h', value: kpis?.demos_24h ?? 0, icon: Bot, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Total pipeline', value: totalLeads, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            { label: 'Revenue mes (USD)', value: `$${(kpis?.revenue_month_usd ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Pipeline por status */}
        {kpis?.reservations_by_status && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-foreground mb-4">Pipeline de reservas</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(kpis.reservations_by_status).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status]
                if (!cfg) return null
                return (
                  <div key={status} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${cfg.color}`}>
                    <cfg.icon className="w-4 h-4" />
                    {cfg.label}: <strong>{count}</strong>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reservations table */}
        <div className="bg-card border border-border rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
            <h2 className="font-bold text-foreground text-lg">Reservas / Leads</h2>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'new', 'contacted', 'qualified', 'validated', 'paid'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {s === 'all' ? 'Todos' : STATUS_CONFIG[s]?.label ?? s}
                  {s !== 'all' && kpis?.reservations_by_status[s] ? ` (${kpis.reservations_by_status[s]})` : ''}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay reservas en esta categoría</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Lead', 'Contacto', 'Agente', 'Plan', 'Estado', 'Fecha', 'Acción'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(r => {
                    const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.new
                    const next = NEXT_STATUS[r.status]
                    return (
                      <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{r.user_name}</div>
                          <div className="text-xs text-muted-foreground">{r.company ?? '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${r.user_email}`} className="text-primary hover:underline text-xs">{r.user_email}</a>
                          <div className="text-xs text-muted-foreground">{r.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{r.agent_name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs capitalize">{r.plan_interest}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                            <cfg.icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(r.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-4 py-3">
                          {next && (
                            <button
                              onClick={() => advanceStatus(r.id, next)}
                              disabled={updating === r.id}
                              className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {updating === r.id ? '...' : `→ ${STATUS_CONFIG[next]?.label}`}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
