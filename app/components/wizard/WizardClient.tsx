'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Sparkles, CheckCircle, Bot,
  Target, Headphones, Settings, CalendarDays, BarChart2,
  LucideIcon, Zap, Clock, TrendingUp, Package,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const GOALS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'leads',      label: 'Generar y calificar leads',       Icon: Target },
  { id: 'soporte',    label: 'Automatizar soporte al cliente',  Icon: Headphones },
  { id: 'operaciones',label: 'Optimizar operaciones internas',  Icon: Settings },
  { id: 'agenda',     label: 'Gestionar agenda y citas',        Icon: CalendarDays },
  { id: 'reportes',   label: 'Generar reportes automáticos',    Icon: BarChart2 },
  { id: 'ecommerce',  label: 'Aumentar ventas online',          Icon: Package },
  { id: 'marketing',  label: 'Automatizar marketing y campañas',Icon: TrendingUp },
  { id: 'otros',      label: 'Otro objetivo',                  Icon: Sparkles },
]

const INDUSTRIES = [
  'Inmobiliaria', 'Seguros', 'Legal', 'Tecnología', 'Salud',
  'Retail / E-commerce', 'Educación', 'Consultora B2B',
  'Agencia de Marketing', 'Clínica / Centro médico', 'Otro',
]

const CHANNELS = ['WhatsApp', 'Instagram DM', 'Email', 'Web chat', 'Facebook Messenger', 'Teléfono / Voz']
const STACK_OPTIONS = ['Gmail', 'Google Calendar', 'HubSpot', 'Notion', 'Sheets', 'Pipedrive', 'Zendesk', 'Slack', 'WhatsApp API', 'n8n', 'Zapier', 'Ninguno']
const VOLUMES = [
  { id: 'bajo',  label: 'Bajo',  detail: '< 50 interacciones/día' },
  { id: 'medio', label: 'Medio', detail: '50–200 interacciones/día' },
  { id: 'alto',  label: 'Alto',  detail: '200+ interacciones/día' },
]

// ─── Agent catalog ───────────────────────────────────────────────────────────

interface AgentRec {
  slug: string
  name: string
  tagline: string
  category: string
  price: number
  roi_30d: string
  roi_90d: string
  reason: string
  color: string
}

const AGENTS: AgentRec[] = [
  { slug: 'sales-ai-closer',         name: 'Sales AI Closer',       tagline: 'Cierra más ventas, automatiza el seguimiento de leads',          category: 'Ventas',      price: 397, roi_30d: '2–3x',  roi_90d: '5–8x',  reason: 'Califica y hace seguimiento de leads automáticamente, liberando a tu equipo para cerrar más.', color: 'from-blue-500 to-indigo-600' },
  { slug: 'ai-support-agent',        name: 'AI Support Agent',      tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde',         category: 'Soporte',     price: 397, roi_30d: '3x',    roi_90d: '6x',    reason: 'Resuelve hasta el 80% de consultas sin intervención humana, disponible 24/7.', color: 'from-violet-500 to-purple-600' },
  { slug: 'ai-lead-engine',          name: 'AI Lead Engine',        tagline: 'Genera y califica leads 24/7 en piloto automático',              category: 'Ventas',      price: 397, roi_30d: '2x',    roi_90d: '4–6x',  reason: 'Captura leads de múltiples canales y los califica automáticamente con scoring inteligente.', color: 'from-indigo-500 to-blue-600' },
  { slug: 'appointment-setting-agent',name:'Appointment Setting',   tagline: 'Agenda reuniones y demos completamente automático',              category: 'Ventas',      price: 397, roi_30d: '2–4x',  roi_90d: '5x',    reason: 'Agenda citas, califica prospectos y envía recordatorios sin ninguna intervención manual.', color: 'from-sky-500 to-blue-600' },
  { slug: 'marketing-ai-agent',      name: 'Marketing AI Agent',    tagline: 'Campañas inteligentes que optimizan su propio ROAS',             category: 'Marketing',   price: 397, roi_30d: '2x',    roi_90d: '4x',    reason: 'Automatiza creación de campañas, calendario de contenido y optimización de ROAS.', color: 'from-violet-500 to-pink-600' },
  { slug: 'ecommerce-agent',         name: 'E-Commerce Agent',      tagline: 'Recupera carritos y multiplica tus ventas online',               category: 'E-Commerce',  price: 397, roi_30d: '3x',    roi_90d: '5–7x',  reason: 'Recupera carritos abandonados, hace upsell y aumenta la retención de clientes.', color: 'from-emerald-500 to-teal-600' },
  { slug: 'operations-ai-agent',     name: 'Operations AI Agent',   tagline: 'Automatiza procesos internos, reportes y flujos operativos',     category: 'Operaciones', price: 397, roi_30d: '2x',    roi_90d: '4x',    reason: 'Automatiza flujos internos, genera reportes y gestiona tareas sin intervención manual.', color: 'from-sky-500 to-cyan-600' },
]

// ─── Recommendation engine ───────────────────────────────────────────────────

interface RecommendationResult {
  primary: AgentRec
  secondary: AgentRec | null
  plan_steps: { step: number; title: string; desc: string }[]
  stack_hint: string[]
}

function buildRecommendation(
  goal: string,
  industry: string,
  channels: string[],
  stack: string[],
  volume: string,
): RecommendationResult {
  // Primary mapping
  const primary_map: Record<string, string> = {
    leads:       'ai-lead-engine',
    soporte:     'ai-support-agent',
    operaciones: 'operations-ai-agent',
    agenda:      'appointment-setting-agent',
    reportes:    'operations-ai-agent',
    ecommerce:   'ecommerce-agent',
    marketing:   'marketing-ai-agent',
    otros:       'sales-ai-closer',
  }

  // Industry overrides for primary
  const industry_override: Record<string, string> = {
    'Retail / E-commerce':    'ecommerce-agent',
    'Clínica / Centro médico':'appointment-setting-agent',
    'Salud':                  'appointment-setting-agent',
    'Agencia de Marketing':   'marketing-ai-agent',
  }

  const primarySlug = industry_override[industry] ?? primary_map[goal] ?? 'sales-ai-closer'
  const primary = AGENTS.find(a => a.slug === primarySlug) ?? AGENTS[0]

  // Secondary: complement the primary
  const secondary_map: Record<string, string> = {
    'ai-lead-engine':           'sales-ai-closer',
    'sales-ai-closer':          'ai-lead-engine',
    'ai-support-agent':         'sales-ai-closer',
    'appointment-setting-agent':'ai-support-agent',
    'ecommerce-agent':          'ai-support-agent',
    'marketing-ai-agent':       'ai-lead-engine',
    'operations-ai-agent':      'ai-support-agent',
  }
  const secSlug = secondary_map[primarySlug]
  const secondary = secSlug ? (AGENTS.find(a => a.slug === secSlug) ?? null) : null

  // Stack hints based on user's tools
  const stack_hint: string[] = []
  if (stack.includes('HubSpot')) stack_hint.push('HubSpot')
  if (stack.includes('Google Calendar')) stack_hint.push('Google Calendar')
  if (stack.includes('WhatsApp API') || channels.includes('WhatsApp')) stack_hint.push('WhatsApp Business API')
  if (stack.includes('n8n')) stack_hint.push('n8n workflows')
  if (stack.includes('Zapier')) stack_hint.push('Zapier')
  if (stack.includes('Gmail')) stack_hint.push('Gmail')
  if (stack_hint.length === 0) stack_hint.push('WhatsApp Business API', 'Gmail', 'Google Calendar')

  // Implementation steps
  const plan_steps = [
    { step: 1, title: 'Diagnóstico de procesos', desc: 'Mapeamos tus flujos actuales e identificamos los puntos de automatización de mayor impacto.' },
    { step: 2, title: 'Configuración del agente', desc: `Configuramos ${primary.name} con tus datos, tono de comunicación y reglas de negocio. Setup en ${volume === 'alto' ? '48' : '24'}h.` },
    { step: 3, title: 'Integración con tus herramientas', desc: `Conectamos el agente a ${stack_hint.slice(0, 2).join(', ')} y tus canales principales.` },
    { step: 4, title: 'Prueba y ajuste', desc: 'Realizamos pruebas en vivo, ajustamos respuestas y validamos los flujos antes del lanzamiento.' },
    { step: 5, title: 'Go live y monitoreo', desc: 'El agente queda activo. Recibís reportes semanales y acceso al dashboard de métricas.' },
  ]

  return { primary, secondary, plan_steps, stack_hint }
}

// ─── Component ───────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5

interface NavUser { email: string; name?: string }

export default function WizardClient() {
  const [step, setStep] = useState<Step>(1)
  const [goal, setGoal] = useState('')
  const [industry, setIndustry] = useState('')
  const [channels, setChannels] = useState<string[]>([])
  const [stack, setStack] = useState<string[]>([])
  const [volume, setVolume] = useState('')
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [user, setUser] = useState<NavUser | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d?.user ?? null))
      .catch(() => {})
  }, [])

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const canNext = () => {
    if (step === 1) return !!goal
    if (step === 2) return !!industry
    if (step === 3) return channels.length > 0
    if (step === 4) return true
    if (step === 5) return !!volume
    return false
  }

  const next = () => {
    if (step < 5) setStep((step + 1) as Step)
    else setResult(buildRecommendation(goal, industry, channels, stack, volume))
  }
  const back = () => { if (step > 1) setStep((step - 1) as Step) }

  const reset = () => {
    setResult(null); setStep(1); setGoal(''); setIndustry('')
    setChannels([]); setStack([]); setVolume('')
  }

  const progress = result ? 100 : (step / 6) * 100

  // ── Result screen ────────────────────────────────────────────────────────
  if (result) {
    const { primary, secondary, plan_steps, stack_hint } = result
    return (
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/5 to-background py-14 border-b border-border">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tu recomendación personalizada</h1>
            <p className="text-muted-foreground">
              Para una empresa de <strong className="text-foreground">{industry}</strong> con foco en <strong className="text-foreground">{GOALS.find(g => g.id === goal)?.label?.toLowerCase()}</strong>.
            </p>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

          {/* Primary agent */}
          <div className={`bg-gradient-to-br ${primary.color} p-px rounded-2xl`}>
            <div className="bg-card rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${primary.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-primary font-semibold mb-0.5 uppercase tracking-wide">Agente principal recomendado</div>
                  <h2 className="text-xl font-bold text-foreground">{primary.name}</h2>
                  <p className="text-muted-foreground text-sm">{primary.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-foreground bg-primary/5 border border-primary/10 rounded-xl p-3 mb-4">{primary.reason}</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-green-500">{primary.roi_30d}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">ROI estimado 30 días</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-blue-500">{primary.roi_90d}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">ROI estimado 90 días</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-xl font-bold text-foreground">${primary.price}</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/agents/${primary.slug}?tab=demo`}
                    className="px-4 py-2 border border-primary/30 text-primary text-sm font-medium rounded-xl hover:bg-primary/10 transition-all"
                  >
                    Ver demo
                  </Link>
                  <Link
                    href={`/agents/${primary.slug}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-glow transition-all"
                  >
                    Activar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary agent */}
          {secondary && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-3">Agente complementario</div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 bg-gradient-to-br ${secondary.color} rounded-lg flex items-center justify-center shrink-0`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{secondary.name}</h3>
                  <p className="text-xs text-muted-foreground">{secondary.tagline}</p>
                </div>
                <Link href={`/agents/${secondary.slug}`} className="ml-auto text-xs text-primary font-medium flex items-center gap-1 hover:gap-1.5 transition-all shrink-0">
                  Ver <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">{secondary.reason}</p>
            </div>
          )}

          {/* Implementation plan */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Plan de implementación</h2>
            <div className="space-y-3">
              {plan_steps.map(s => (
                <div key={s.step} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Stack recomendado para integrarse
            </h3>
            <div className="flex flex-wrap gap-2">
              {stack_hint.map(s => (
                <span key={s} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full border border-primary/20">{s}</span>
              ))}
            </div>
          </div>

          {/* Marketplace extra — logged-in users */}
          {user && (
            <div className="bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-6">
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-2">Recomendaciones avanzadas (tu cuenta)</div>
              <h3 className="font-bold text-foreground mb-1">Explorá el Marketplace completo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Además del agente IA, podés combinar con workflows de n8n, integraciones del catálogo y soluciones personalizadas.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/marketplace" className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary/50 transition-all">
                  <Package className="w-4 h-4 text-primary" />
                  Marketplace
                </Link>
                <Link href="/marketplace/catalogo" className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary/50 transition-all">
                  <Zap className="w-4 h-4 text-primary" />
                  Catálogo n8n
                </Link>
                <Link href={`/marketplace/comparar?a=${primary.slug}`} className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:border-primary/50 transition-all">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Comparar agentes
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-primary/20 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-foreground mb-1">¿Querés que lo activemos juntos?</h3>
            <p className="text-muted-foreground text-sm mb-4">Llamada de diagnóstico gratuita · 30 minutos · Sin compromiso</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact?type=diagnostico"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all"
              >
                <Clock className="w-4 h-4" />
                Reservar diagnóstico gratis
              </Link>
              <Link
                href="/agents"
                className="px-6 py-3 bg-card border border-border rounded-xl font-medium hover:border-primary/50 transition-all text-foreground"
              >
                Ver todos los agentes
              </Link>
            </div>
          </div>

          <div className="text-center">
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Empezar de nuevo
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Wizard steps ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-b from-primary/5 to-background py-14 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Elegí tu agente ideal</h1>
          <p className="text-muted-foreground">
            {user ? `Hola${user.name ? `, ${user.name.split(' ')[0]}` : ''} — ` : ''}
            5 preguntas para encontrar la automatización perfecta para tu negocio.
          </p>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Pregunta {step} de 5</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 1 — Goal */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">¿Cuál es tu objetivo principal?</h2>
            <p className="text-muted-foreground text-sm mb-6">Seleccioná el que mejor describe lo que necesitás automatizar.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    goal === g.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${goal === g.id ? 'bg-primary/20' : 'bg-muted'}`}>
                    <g.Icon className={`w-4 h-4 ${goal === g.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className="font-medium text-sm">{g.label}</span>
                  {goal === g.id && <CheckCircle className="w-4 h-4 text-primary ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Industry */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">¿En qué industria operás?</h2>
            <p className="text-muted-foreground text-sm mb-6">Los agentes están optimizados por industria para mejores resultados.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    industry === ind
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {ind}
                  {industry === ind && <CheckCircle className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Channels */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">¿Qué canales usás actualmente?</h2>
            <p className="text-muted-foreground text-sm mb-6">Podés seleccionar más de uno.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHANNELS.map(ch => (
                <button
                  key={ch}
                  onClick={() => toggle(channels, ch, setChannels)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                    channels.includes(ch)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {ch}
                  {channels.includes(ch) && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Stack */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">¿Qué herramientas ya usás?</h2>
            <p className="text-muted-foreground text-sm mb-6">Seleccioná las que ya tenés en tu negocio (opcional).</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STACK_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggle(stack, opt, setStack)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                    stack.includes(opt)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {opt}
                  {stack.includes(opt) && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Volume */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">¿Cuál es tu volumen de interacciones?</h2>
            <p className="text-muted-foreground text-sm mb-6">Esto ayuda a dimensionar el agente correctamente.</p>
            <div className="space-y-3">
              {VOLUMES.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVolume(v.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    volume === v.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground">{v.label}</div>
                    <div className="text-sm text-muted-foreground">{v.detail}</div>
                  </div>
                  {volume === v.id && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button onClick={back} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
          ) : <div />}
          <button
            onClick={next}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {step === 5 ? (
              <><Sparkles className="w-4 h-4" /> Ver mi recomendación</>
            ) : (
              <>Siguiente <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
