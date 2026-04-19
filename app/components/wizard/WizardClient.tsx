'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle, Loader2, Bot, Target, Headphones, Settings, CalendarDays, BarChart2, LucideIcon } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

const GOALS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'leads', label: 'Generar y calificar leads', Icon: Target },
  { id: 'soporte', label: 'Automatizar soporte al cliente', Icon: Headphones },
  { id: 'operaciones', label: 'Optimizar operaciones internas', Icon: Settings },
  { id: 'agenda', label: 'Gestionar agenda y citas', Icon: CalendarDays },
  { id: 'reportes', label: 'Generar reportes automáticos', Icon: BarChart2 },
  { id: 'otros', label: 'Otro objetivo', Icon: Sparkles },
]

const INDUSTRIES = [
  'Inmobiliaria', 'Seguros', 'Legal', 'Tecnología', 'Salud',
  'Retail / E-commerce', 'Educación', 'Consultora B2B', 'Otro',
]

const CHANNELS = ['WhatsApp', 'Instagram DM', 'Email', 'Web chat', 'Facebook Messenger', 'Teléfono']
const STACK_OPTIONS = ['Gmail', 'Google Calendar', 'HubSpot', 'Notion', 'Sheets', 'Pipedrive', 'Zendesk', 'Slack', 'WhatsApp API', 'n8n', 'Zapier', 'Ninguno']
const VOLUMES = [
  { id: 'bajo', label: 'Bajo', detail: '< 50 interacciones/día' },
  { id: 'medio', label: 'Medio', detail: '50–200 interacciones/día' },
  { id: 'alto', label: 'Alto', detail: '200+ interacciones/día' },
]

interface Recommendation {
  primary: { name: string; reason: string; roi_30d: string; roi_90d: string }
  secondary: { name: string; reason: string } | null
  implementation_plan: { step: number; title: string; description: string }[]
  recommended_stack: string[]
  summary: string
}

export default function WizardClient() {
  const [step, setStep] = useState<Step>(1)
  const [goal, setGoal] = useState('')
  const [industry, setIndustry] = useState('')
  const [channels, setChannels] = useState<string[]>([])
  const [stack, setStack] = useState<string[]>([])
  const [volume, setVolume] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ recommendation: Recommendation; primary_slug: string | null } | null>(null)
  const [error, setError] = useState('')

  const toggleArr = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const canProceed = () => {
    if (step === 1) return !!goal
    if (step === 2) return !!industry
    if (step === 3) return channels.length > 0
    if (step === 4) return true
    if (step === 5) return !!volume
    return false
  }

  const next = () => {
    if (step < 5) setStep((step + 1) as Step)
    else submit()
  }
  const back = () => { if (step > 1) setStep((step - 1) as Step) }

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, industry, channels, stack, volume }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error en el servidor')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos generar la recomendación. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Use step/6 so step 1 shows ~17% instead of 0% (better perceived progress)
  const progress = result ? 100 : (step / 6) * 100

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Analizando tu perfil...</h2>
          <p className="text-muted-foreground text-sm">La IA está seleccionando el mejor agente para vos.</p>
        </div>
      </main>
    )
  }

  if (result) {
    const rec = result.recommendation
    return (
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 border-b border-border">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tu recomendación personalizada</h1>
            <p className="text-muted-foreground">{rec.summary}</p>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
          {/* Primary agent */}
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-primary/30 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs text-primary font-medium mb-1">Agente principal recomendado</div>
                <h2 className="text-xl font-bold text-foreground">{rec.primary.name}</h2>
              </div>
            </div>
            <p className="text-foreground text-sm mb-4">{rec.primary.reason}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-card rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-400">{rec.primary.roi_30d}</div>
                <div className="text-xs text-muted-foreground">ROI 30 días</div>
              </div>
              <div className="bg-card rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-400">{rec.primary.roi_90d}</div>
                <div className="text-xs text-muted-foreground">ROI 90 días</div>
              </div>
            </div>
            <div className="flex gap-3">
              {result.primary_slug && (
                <Link
                  href={`/agents/${result.primary_slug}`}
                  className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-glow transition-all"
                >
                  Ver agente completo
                </Link>
              )}
              <Link
                href="/contact"
                className="flex-1 text-center px-4 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary/50 transition-all"
              >
                Reservar llamada
              </Link>
            </div>
          </div>

          {/* Secondary agent */}
          {rec.secondary?.name && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="text-xs text-muted-foreground font-medium mb-2">Agente complementario</div>
              <h3 className="font-bold text-foreground mb-1">{rec.secondary.name}</h3>
              <p className="text-muted-foreground text-sm">{rec.secondary.reason}</p>
            </div>
          )}

          {/* Implementation plan */}
          {rec.implementation_plan?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Plan de implementación</h2>
              <div className="space-y-3">
                {rec.implementation_plan.map(s => (
                  <div key={s.step} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                    <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended stack */}
          {rec.recommended_stack?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-foreground mb-3">Stack recomendado</h3>
              <div className="flex flex-wrap gap-2">
                {rec.recommended_stack.map((s: string) => (
                  <span key={s} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Retry */}
          <div className="text-center">
            <button
              onClick={() => { setResult(null); setStep(1); setGoal(''); setIndustry(''); setChannels([]); setStack([]); setVolume('') }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Empezar de nuevo
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Encontrá tu agente ideal</h1>
          <p className="text-muted-foreground">5 preguntas · La IA te recomienda el agente perfecto para tu negocio</p>
        </div>
      </section>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Pregunta {step} de 5</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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
            <p className="text-muted-foreground text-sm mb-6">Los agentes están configurados por industria para mejores resultados.</p>
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
                  onClick={() => toggleArr(channels, ch, setChannels)}
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
            <h2 className="text-xl font-bold text-foreground mb-2">¿Qué herramientas tenés?</h2>
            <p className="text-muted-foreground text-sm mb-6">Seleccioná las que ya usás en tu negocio (opcional).</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STACK_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleArr(stack, opt, setStack)}
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

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button onClick={back} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
          ) : <div />}
          <button
            onClick={next}
            disabled={!canProceed()}
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
