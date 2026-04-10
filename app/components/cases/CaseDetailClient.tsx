'use client'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, TrendingUp, Clock, Layers, ArrowRight } from 'lucide-react'

interface BeforeAfter { metric: string; before: string; after: string; period: string }
interface WorkflowStep { step: number; description: string }
interface RelatedAgent { id: string; name: string; slug: string; tagline: string }

interface Case {
  title: string
  industry: string
  stack: string[]
  setup_time: string
  primary_metric_label: string
  primary_metric_value: string
  summary_bullets: string[]
  confidentiality: string
  problem: string
  solution: string
  workflow_map: WorkflowStep[]
  requirements: string[]
  deliverables: string[]
  actions_definition: string
  actions_per_month_example: string
  risk_controls: string
  before_after: BeforeAfter[]
  roi_notes: string
  is_beta: boolean
  agents: RelatedAgent[]
}

const INDUSTRY_COLORS: Record<string, string> = {
  Inmobiliaria: 'from-blue-500 to-indigo-500',
  Seguros: 'from-violet-500 to-purple-500',
  Legal: 'from-slate-500 to-gray-600',
  Tecnología: 'from-cyan-500 to-blue-500',
  Salud: 'from-green-500 to-emerald-500',
  Retail: 'from-orange-500 to-amber-500',
}

export default function CaseDetailClient({ caso }: { caso: Case }) {
  const color = INDUSTRY_COLORS[caso.industry] ?? 'from-blue-500 to-indigo-500'

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className={`bg-gradient-to-br ${color} py-16`}>
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/casos" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a casos
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{caso.industry}</span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full capitalize">{caso.confidentiality}</span>
            {caso.is_beta && <span className="bg-yellow-400/30 text-yellow-100 text-xs px-3 py-1 rounded-full">Resultado estimado</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{caso.title}</h1>
          <div className="flex flex-wrap gap-6 mt-6">
            <div>
              <div className="text-5xl font-black text-white">{caso.primary_metric_value}</div>
              <div className="text-white/70 text-sm">{caso.primary_metric_label}</div>
            </div>
            <div className="flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" /> Setup: {caso.setup_time}
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Layers className="w-4 h-4" /> Stack: {caso.stack?.slice(0, 3).join(', ')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* Summary bullets */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-foreground mb-4">Resultados clave</h2>
          <ul className="space-y-2">
            {caso.summary_bullets?.map((b: string) => (
              <li key={b} className="flex items-start gap-2 text-foreground">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Problem → Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-3">El problema</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{caso.problem}</p>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-3">La solución</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{caso.solution}</p>
          </div>
        </div>

        {/* Workflow */}
        {caso.workflow_map?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">Cómo funciona el flujo</h2>
            <div className="space-y-3">
              {caso.workflow_map.map((step: WorkflowStep) => (
                <div key={step.step} className="flex items-start gap-4 bg-card border border-border rounded-xl p-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                    {step.step}
                  </div>
                  <p className="text-foreground text-sm pt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Before/After */}
        {caso.before_after?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">Antes vs Después</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-semibold text-foreground">Métrica</th>
                    <th className="text-left p-4 font-semibold text-red-400">Antes</th>
                    <th className="text-left p-4 font-semibold text-green-400">Después</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Período</th>
                  </tr>
                </thead>
                <tbody>
                  {caso.before_after.map((row: BeforeAfter) => (
                    <tr key={row.metric} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-medium text-foreground">{row.metric}</td>
                      <td className="p-4 text-red-400">{row.before}</td>
                      <td className="p-4 text-green-400 font-semibold">{row.after}</td>
                      <td className="p-4 text-muted-foreground">{row.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requirements + Deliverables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caso.requirements?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">Requisitos para replicar</h3>
              <ul className="space-y-2">
                {caso.requirements.map((r: string) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {caso.deliverables?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">Qué recibís</h3>
              <ul className="space-y-2">
                {caso.deliverables.map((d: string) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ROI + Risk */}
        {(caso.roi_notes || caso.risk_controls) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caso.roi_notes && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-3">Cómo se midió el ROI</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{caso.roi_notes}</p>
              </div>
            )}
            {caso.risk_controls && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-3">Guardrails y escalación humana</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{caso.risk_controls}</p>
              </div>
            )}
          </div>
        )}

        {/* Related agents */}
        {caso.agents?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">Agentes usados en este caso</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {caso.agents.map((a: RelatedAgent) => (
                <Link
                  key={a.id}
                  href={`/agents/${a.slug}`}
                  className="flex-1 bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-custom transition-all group"
                >
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{a.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{a.tagline}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">¿Querés implementar algo similar?</h2>
          <p className="text-muted-foreground mb-6">Hablemos de tu caso específico y te armamos una propuesta.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
            >
              Reservar llamada <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/wizard"
              className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:border-primary/50 transition-all"
            >
              Encontrá tu agente ideal
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
