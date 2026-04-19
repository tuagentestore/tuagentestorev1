'use client'
import { useState } from 'react'
import { CheckCircle, Loader2, Send } from 'lucide-react'

interface Props {
  agentId?: string
  agentSlug?: string
  agentName: string
}

const INDUSTRIES = ['Seguros', 'Inmobiliaria', 'Legal', 'Tecnología', 'Salud', 'Retail', 'E-commerce', 'Educación', 'Otro']
const PLANS = [
  { value: 'starter', label: 'Básico ($397/mes)' },
  { value: 'pro', label: 'Pro ($597/mes)' },
  { value: 'enterprise', label: 'Enterprise (a medida)' },
]

export default function ReservationForm({ agentId, agentSlug, agentName }: Props) {
  const [form, setForm] = useState({
    user_name: '',
    user_email: '',
    phone: '',
    company: '',
    industry: '',
    use_case: '',
    plan_interest: 'starter',
    preferred_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.user_name || !form.user_email || !form.phone) {
      setError('Nombre, email y teléfono son obligatorios')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          agent_id: agentId,
          agent_slug: agentSlug,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al enviar la reserva')
        return
      }
      setSuccess(true)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">¡Reserva confirmada!</h2>
        <p className="text-muted-foreground mb-2">
          Recibimos tu solicitud para <strong className="text-foreground">{agentName}</strong>.
        </p>
        <p className="text-muted-foreground text-sm">
          Nuestro equipo se pondrá en contacto en menos de <strong className="text-foreground">24 horas hábiles</strong> para coordinar los próximos pasos.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          También podés escribirnos por{' '}
          <a href="https://wa.me/5493437527193" target="_blank" rel="noopener noreferrer" className="text-[#25D366] underline">
            WhatsApp
          </a>{' '}
          si querés respuesta inmediata.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-xl font-bold text-foreground mb-1">Reservar {agentName}</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Completá el formulario y te contactamos en menos de 24h.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre completo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Juan García"
              value={form.user_name}
              onChange={e => set('user_name', e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="juan@empresa.com"
              value={form.user_email}
              onChange={e => set('user_email', e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Phone + Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Teléfono / WhatsApp <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              placeholder="+54 9 11 1234-5678"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Empresa</label>
            <input
              type="text"
              placeholder="Mi Empresa S.A."
              value={form.company}
              onChange={e => set('company', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Industry + Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Industria</label>
            <select
              value={form.industry}
              onChange={e => set('industry', e.target.value)}
              className="input-field"
            >
              <option value="">Seleccioná tu industria</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Plan de interés</label>
            <select
              value={form.plan_interest}
              onChange={e => set('plan_interest', e.target.value)}
              className="input-field"
            >
              {PLANS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Use case */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            ¿Qué querés automatizar?
          </label>
          <textarea
            rows={3}
            placeholder="Ej: Responder consultas de clientes en WhatsApp las 24h, calificar leads de nuestras campañas..."
            value={form.use_case}
            onChange={e => set('use_case', e.target.value)}
            className="input-field resize-none"
          />
        </div>

        {/* Preferred date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha preferida para la llamada
          </label>
          <input
            type="date"
            value={form.preferred_date}
            onChange={e => set('preferred_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
          ) : (
            <><Send className="w-5 h-5" /> Reservar activación</>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Sin cargo por reservar · Te contactamos en &lt;24h · Podés cancelar en cualquier momento
        </p>
      </form>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 10px 14px;
          background: rgb(var(--background));
          border: 1px solid rgb(var(--border));
          border-radius: 12px;
          color: rgb(var(--foreground));
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .input-field::placeholder {
          color: rgb(var(--muted-foreground));
        }
        .input-field:focus {
          border-color: rgba(37, 99, 235, 0.5);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .input-field option {
          background: rgb(var(--card));
        }
      `}</style>
    </div>
  )
}
