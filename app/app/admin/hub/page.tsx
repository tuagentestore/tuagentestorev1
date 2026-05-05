'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  RefreshCw, TrendingUp, Users, Bot, DollarSign, Star,
  FileText, BarChart3, ArrowUpRight, ArrowDownRight, Minus,
  ChevronRight, Activity, CheckCircle, Clock, XCircle,
} from 'lucide-react'

// ─── types ──────────────────────────────────────────────────────────────────

interface HubMetrics {
  updatedAt: string
  updatedLabel: string
  funnel: {
    leads: number
    demos: number
    demosCompleted: number
    reservations: number
    paid: number
  }
  conversionRates: {
    leadToDemo: string
    demoToReservation: string
    reservationToPaid: string
    overall: string
  }
  revenue: { estimatedUSD: number; paidCount: number }
  pipeline: {
    new: number; contacted: number; qualified: number
    validated: number; paid: number; cancelled: number; no_show: number
  }
  agents: Array<{ name: string; demos: number; reservations: number; testimonials: number }>
  testimonials: { total: number; avgRating: number; fiveStar: number; authorizedToPublish: number }
  content: { pending: number; generated: number; approved: number; published: number; total: number }
  weeklyTrend: {
    thisWeek: { leads: number; paid: number }
    lastWeek: { leads: number; paid: number }
    delta: { leads: number; paid: number }
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function Delta({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-0.5 text-emerald-400 text-xs"><ArrowUpRight size={12} />+{value}</span>
  if (value < 0) return <span className="flex items-center gap-0.5 text-red-400 text-xs"><ArrowDownRight size={12} />{value}</span>
  return <span className="flex items-center gap-0.5 text-slate-500 text-xs"><Minus size={12} />0</span>
}

function KpiCard({
  label, value, sub, color = 'text-cyan-400', delta,
}: { label: string; value: string | number; sub?: string; color?: string; delta?: number }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
      {delta !== undefined && <Delta value={delta} />}
    </div>
  )
}

function SectionHeader({ title, color = 'text-cyan-400' }: { title: string; color?: string }) {
  return (
    <h2 className={`text-xs font-bold uppercase tracking-widest ${color} mt-8 mb-3`}>
      {title}
    </h2>
  )
}

// ─── main page ──────────────────────────────────────────────────────────────

export default function HubPage() {
  const [metrics, setMetrics] = useState<HubMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics-sync')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      setMetrics(data)
      setError(null)
      setLastRefresh(new Date())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/n8n-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook: 'hub-sync' }),
      })
      if (!res.ok) throw new Error('Error al disparar sync')
      await new Promise(r => setTimeout(r, 3000))
      await fetchMetrics()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => { fetchMetrics() }, [fetchMetrics])
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 60_000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-3" size={32} />
          <p className="text-slate-400 text-sm">Cargando métricas del Hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#0d1526] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">TuAgenteStore — Hub Metrics</h1>
              <p className="text-xs text-slate-500">
                {metrics?.updatedLabel ?? 'Sin datos aún'}
                {lastRefresh && ` · Página: ${lastRefresh.toLocaleTimeString('es-AR')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2"
              title="Actualizar datos"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Activity size={14} className={syncing ? 'animate-pulse' : ''} />
              {syncing ? 'Sincronizando...' : 'Hub Sync'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error === 'No metrics available yet. Trigger hub-sync from Apps Script.'
              ? '📋 No hay métricas disponibles aún. Editá cualquier celda en el Google Sheets Master Hub para disparar la primera sincronización, o presioná "Hub Sync" arriba.'
              : `Error: ${error}`}
          </div>
        )}

        {metrics && (
          <>
            {/* ── FUNNEL PRINCIPAL ─────────────────────────────────── */}
            <SectionHeader title="Embudo de Conversión" color="text-cyan-400" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard
                label="Leads" value={metrics.funnel.leads} color="text-cyan-400"
                delta={metrics.weeklyTrend.delta.leads}
                sub={`Esta semana: ${metrics.weeklyTrend.thisWeek.leads}`}
              />
              <KpiCard label="Demos" value={metrics.funnel.demos} color="text-blue-400"
                sub={`Completadas: ${metrics.funnel.demosCompleted}`} />
              <KpiCard label="Reservas" value={metrics.funnel.reservations} color="text-violet-400" />
              <KpiCard
                label="Pagos" value={metrics.funnel.paid} color="text-emerald-400"
                delta={metrics.weeklyTrend.delta.paid}
                sub={`Esta semana: ${metrics.weeklyTrend.thisWeek.paid}`}
              />
              <KpiCard
                label="Revenue Est." color="text-emerald-300"
                value={`$${metrics.revenue.estimatedUSD.toLocaleString()}`}
                sub="USD (pagos × $397)"
              />
              <KpiCard label="Conv. Global" value={metrics.conversionRates.overall} color="text-amber-400" />
            </div>

            {/* ── CONVERSIONES ──────────────────────────────────────── */}
            <SectionHeader title="Tasas de Conversión" color="text-blue-400" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Lead → Demo', value: metrics.conversionRates.leadToDemo },
                { label: 'Demo → Reserva', value: metrics.conversionRates.demoToReservation },
                { label: 'Reserva → Pago', value: metrics.conversionRates.reservationToPaid },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-2xl font-bold text-blue-400">{value}</span>
                </div>
              ))}
            </div>

            {/* ── PIPELINE ──────────────────────────────────────────── */}
            <SectionHeader title="Pipeline — Estado de Leads" color="text-violet-400" />
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { key: 'new', label: '🆕 Nuevo', color: 'text-slate-300' },
                { key: 'contacted', label: '📞 Contactado', color: 'text-blue-300' },
                { key: 'qualified', label: '✅ Calificado', color: 'text-indigo-300' },
                { key: 'validated', label: '🔍 Validado', color: 'text-purple-300' },
                { key: 'paid', label: '💰 Pagado', color: 'text-emerald-400' },
                { key: 'cancelled', label: '❌ Cancelado', color: 'text-red-400' },
                { key: 'no_show', label: '👻 No Show', color: 'text-orange-400' },
              ].map(({ key, label, color }) => (
                <div key={key} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${color}`}>
                    {metrics.pipeline[key as keyof typeof metrics.pipeline]}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* ── AGENTES ───────────────────────────────────────────── */}
            <SectionHeader title="Agentes — Métricas" color="text-slate-300" />
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-slate-700/30 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <span>Agente</span>
                <span className="text-center">Demos</span>
                <span className="text-center">Reservas</span>
                <span className="text-center">Testimonios</span>
              </div>
              {metrics.agents.map((agent) => (
                <div key={agent.name} className="grid grid-cols-4 gap-4 px-4 py-3 border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <span className="text-sm font-medium text-slate-200">{agent.name}</span>
                  <span className="text-center text-indigo-400 font-bold">{agent.demos}</span>
                  <span className="text-center text-violet-400 font-bold">{agent.reservations}</span>
                  <span className="text-center text-amber-400 font-bold">{agent.testimonials}</span>
                </div>
              ))}
            </div>

            {/* ── TESTIMONIOS ───────────────────────────────────────── */}
            <SectionHeader title="Testimonios & NPS" color="text-amber-400" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total" value={metrics.testimonials.total} color="text-amber-400" />
              <KpiCard label="Rating Promedio" value={`${metrics.testimonials.avgRating} / 5 ⭐`} color="text-amber-300" />
              <KpiCard label="5 Estrellas" value={metrics.testimonials.fiveStar} color="text-amber-200" />
              <KpiCard label="Autorizados" value={metrics.testimonials.authorizedToPublish} color="text-emerald-400" sub="para publicar" />
            </div>

            {/* ── CONTENIDO ─────────────────────────────────────────── */}
            <SectionHeader title="Calendario de Contenido" color="text-teal-400" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Pendiente" value={metrics.content.pending} color="text-slate-400" />
              <KpiCard label="Generado" value={metrics.content.generated} color="text-amber-400" />
              <KpiCard label="Aprobado" value={metrics.content.approved} color="text-blue-400" />
              <KpiCard label="Publicado" value={metrics.content.published} color="text-emerald-400" />
            </div>

            {/* ── TENDENCIA SEMANAL ──────────────────────────────────── */}
            <SectionHeader title="Tendencia Semanal" color="text-pink-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Leads', thisWeek: metrics.weeklyTrend.thisWeek.leads, lastWeek: metrics.weeklyTrend.lastWeek.leads, delta: metrics.weeklyTrend.delta.leads },
                { label: 'Pagos', thisWeek: metrics.weeklyTrend.thisWeek.paid, lastWeek: metrics.weeklyTrend.lastWeek.paid, delta: metrics.weeklyTrend.delta.paid },
              ].map(({ label, thisWeek, lastWeek, delta }) => (
                <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{label} — Esta semana vs. anterior</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{thisWeek}</span>
                      <span className="text-slate-500 text-sm">vs {lastWeek}</span>
                    </div>
                  </div>
                  <Delta value={delta} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
