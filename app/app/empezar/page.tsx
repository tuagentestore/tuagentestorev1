'use client'
import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight, ArrowLeft, CheckCircle, Loader2, Bot,
  TrendingUp, MessageSquare, Megaphone, ShoppingCart, Users, Settings,
  DollarSign, Building2, Phone, Mail, User,
} from 'lucide-react'

// ─── Paso 1 — Problemas ───────────────────────────────────────────────
const PROBLEMS = [
  { id: 'ventas',      label: 'Más ventas',         icon: TrendingUp,    desc: 'Cerrar más clientes sin contratar más vendedores' },
  { id: 'soporte',     label: 'Soporte 24/7',        icon: MessageSquare, desc: 'Responder consultas automáticamente todo el día' },
  { id: 'marketing',   label: 'Marketing',           icon: Megaphone,     desc: 'Generar contenido y captar leads en piloto automático' },
  { id: 'ecommerce',   label: 'E-commerce',          icon: ShoppingCart,  desc: 'Automatizar atención, carritos y post-venta' },
  { id: 'leads',       label: 'Captar leads',        icon: Users,         desc: 'Calificar prospectos y llenarme la agenda' },
  { id: 'operaciones', label: 'Operaciones',         icon: Settings,      desc: 'Automatizar procesos internos y tareas repetitivas' },
]

const COMPANY_SIZES = ['1-10 personas','11-50 personas','51-200 personas','200+ personas']
const BUDGETS       = ['Menos de USD 400/mes','USD 400-800/mes','USD 800-2.000/mes','Más de USD 2.000/mes']
const ORIGINS       = [
  { id:'meta_ads',   label:'Meta Ads (Facebook/Instagram)' },
  { id:'tiktok_ads', label:'TikTok Ads' },
  { id:'google_ads', label:'Google Ads' },
  { id:'linkedin',   label:'LinkedIn' },
  { id:'organic',    label:'Búsqueda orgánica' },
  { id:'referral',   label:'Me lo recomendaron' },
  { id:'whatsapp',   label:'WhatsApp' },
  { id:'other',      label:'Otro' },
]

// ─── Step indicator ───────────────────────────────────────────────────
function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map(s => (
        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
          s < step ? 'w-8 bg-primary' : s === step ? 'w-12 bg-primary' : 'w-8 bg-muted'
        }`} />
      ))}
      <span className="text-xs text-muted-foreground ml-2">Paso {step} de 3</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────
function EmpezarContent() {
  const params = useSearchParams()
  const preselectedProblem = params.get('problema') ?? ''

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Form state
  const [problemArea,    setProblemArea]    = useState(preselectedProblem)
  const [customProblem,  setCustomProblem]  = useState('')
  const [name,           setName]           = useState('')
  const [email,          setEmail]          = useState('')
  const [whatsapp,       setWhatsapp]       = useState('')
  const [company,        setCompany]        = useState('')
  const [industry,       setIndustry]       = useState('')
  const [companySize,    setCompanySize]    = useState('')
  const [budgetRange,    setBudgetRange]    = useState('')
  const [channelOrigin,  setChannelOrigin]  = useState('')
  const [wantsCall,      setWantsCall]      = useState<'si'|'no'|'contactar'>('si')

  const canGoToStep2 = !!problemArea
  const canGoToStep3 = name.trim() && email.includes('@')

  const submit = () => {
    startTransition(async () => {
      setError('')
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem_area: problemArea, custom_problem: customProblem,
            name, email, whatsapp, company, industry,
            company_size: companySize, budget_range: budgetRange,
            channel_origin: channelOrigin, wants_call: wantsCall,
          }),
        })
        if (res.ok) {
          setDone(true)
        } else {
          const d = await res.json()
          setError(d.error ?? 'Algo salió mal. Intentá de nuevo.')
        }
      } catch {
        setError('Error de red. Revisá tu conexión e intentá de nuevo.')
      }
    })
  }

  // ── DONE state ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-3">¡Listo! Te contactamos pronto</h1>
          <p className="text-muted-foreground mb-2">
            Recibimos tu consulta y te respondemos en <strong className="text-foreground">menos de 2 horas</strong> por email.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            {whatsapp && `También podemos coordinarlo por WhatsApp al ${whatsapp}.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/agents"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-glow transition-all">
              Ver agentes disponibles
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold text-sm hover:border-primary/30 transition-all">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="glow-orb w-[500px] h-[500px] bg-blue-600/5 -top-40 -right-40" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Empezá con IA hoy</h1>
          </div>
          <p className="text-muted-foreground">Contanos tu desafío y te mostramos el agente ideal para tu negocio.</p>
        </div>

        <StepDots step={step} />

        {/* ── PASO 1 — Problema ────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">¿Cuál es tu mayor desafío hoy?</h2>
            <p className="text-sm text-muted-foreground mb-6">Elegí el área donde el agente IA puede generar más impacto en tu negocio.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {PROBLEMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProblemArea(p.id)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                    problemArea === p.id
                      ? 'bg-primary/10 border-primary/50 shadow-glow'
                      : 'bg-card border-border hover:border-primary/30 hover:bg-muted/30'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${problemArea === p.id ? 'bg-primary/20' : 'bg-muted'}`}>
                    <p.icon className={`w-4 h-4 ${problemArea === p.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm mb-0.5 ${problemArea === p.id ? 'text-foreground' : 'text-foreground'}`}>{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                ¿Querés agregar algo específico? <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                value={customProblem}
                onChange={e => setCustomProblem(e.target.value)}
                placeholder="Ej: Tenemos 200 consultas por día en WhatsApp y no podemos responderlas todas..."
                rows={3}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canGoToStep2}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── PASO 2 — Info de contacto ─────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Contanos sobre tu negocio</h2>
            <p className="text-sm text-muted-foreground mb-6">Para mostrarte el agente más adecuado y contactarte.</p>

            <div className="space-y-4 mb-8">
              {/* Nombre + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <User className="inline w-3.5 h-3.5 mr-1" />Nombre *
                  </label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Martín González"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <Mail className="inline w-3.5 h-3.5 mr-1" />Email *
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="martin@empresa.com"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>
              </div>

              {/* WhatsApp + Empresa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <Phone className="inline w-3.5 h-3.5 mr-1" />WhatsApp <span className="opacity-50">(opcional)</span>
                  </label>
                  <input
                    type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <Building2 className="inline w-3.5 h-3.5 mr-1" />Empresa <span className="opacity-50">(opcional)</span>
                  </label>
                  <input
                    type="text" value={company} onChange={e => setCompany(e.target.value)}
                    placeholder="Nombre de tu empresa"
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>
              </div>

              {/* Industria */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Industria / rubro</label>
                <input
                  type="text" value={industry} onChange={e => setIndustry(e.target.value)}
                  placeholder="Ej: Inmobiliaria, Consultoría, E-commerce de moda..."
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                />
              </div>

              {/* Tamaño + Presupuesto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tamaño del equipo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPANY_SIZES.map(s => (
                      <button key={s} onClick={() => setCompanySize(s)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                          companySize === s ? 'bg-primary/10 border border-primary/50 text-primary' : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    <DollarSign className="inline w-3.5 h-3.5 mr-1" />Presupuesto estimado
                  </label>
                  <div className="space-y-2">
                    {BUDGETS.map(b => (
                      <button key={b} onClick={() => setBudgetRange(b)}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                          budgetRange === b ? 'bg-primary/10 border border-primary/50 text-primary' : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
                        }`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-sm hover:border-primary/30 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(3)} disabled={!canGoToStep3}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Continuar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3 — Canal y preferencia de contacto ─────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Último paso — ¿Cómo te contactamos?</h2>
            <p className="text-sm text-muted-foreground mb-6">Nos ayuda saber cómo llegaste y cómo preferís coordinarlo.</p>

            {/* Origen */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">¿Cómo te enteraste de TuAgenteStore?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ORIGINS.map(o => (
                  <button key={o.id} onClick={() => setChannelOrigin(o.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                      channelOrigin === o.id ? 'bg-primary/10 border border-primary/50 text-primary' : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferencia de contacto */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">¿Querés agendar una llamada?</label>
              <div className="space-y-2">
                {([
                  { id: 'si',       label: 'Sí, quiero coordinar una llamada de 30 min' },
                  { id: 'no',       label: 'No, prefiero recibir info por email primero' },
                  { id: 'contactar', label: 'Prefiero que me contacten y decido después' },
                ] as const).map(o => (
                  <button key={o.id} onClick={() => setWantsCall(o.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                      wantsCall === o.id ? 'bg-primary/10 border-primary/50 text-foreground' : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                    }`}>
                    <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${wantsCall === o.id ? 'border-primary' : 'border-muted-foreground'}`}>
                      {wantsCall === o.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </span>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-sm hover:border-primary/30 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={submit} disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : <>Quiero empezar <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Al enviar aceptás nuestra <Link href="/terms" className="hover:text-foreground underline">política de privacidad</Link>.
              No hacemos spam.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default function EmpezarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <EmpezarContent />
    </Suspense>
  )
}
