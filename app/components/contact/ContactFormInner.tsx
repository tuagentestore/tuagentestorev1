'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Play, Search, Zap, MessageCircle } from 'lucide-react'

export default function ContactFormInner() {
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') || 'demo'

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: defaultType,
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: form.name,
          user_email: form.email,
          phone: form.phone,
          company: form.company,
          plan_interest: ['starter', 'pro', 'enterprise'].includes(form.type) ? form.type : 'starter',
          use_case: form.type + (form.message ? ': ' + form.message : ''),
          utm_source: 'contact_page',
        }),
      })
      if (res.ok) {
        setStatus('sent')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">¡Ya recibimos tu mensaje!</h2>
        <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Te respondemos por email o WhatsApp en menos de 2 horas hábiles.
          Si aplica, te enviamos el link de demo o activación.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/5493437527193?text=Hola%2C+ya+completé+el+formulario"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-xl text-sm font-medium"
          >
            Escribir por WhatsApp
          </a>
          <a href="/agents" className="px-5 py-2.5 border border-border text-muted-foreground rounded-xl text-sm font-medium hover:text-foreground transition-colors">
            Ver agentes mientras tanto
          </a>
        </div>
      </div>
    )
  }

  const intentOptions = [
    { value: 'demo',        label: 'Ver una demo',      Icon: Play },
    { value: 'diagnostico', label: 'Pedir diagnóstico', Icon: Search },
    { value: 'enterprise',  label: 'Activar un agente', Icon: Zap },
    { value: 'support',     label: 'Necesito soporte',  Icon: MessageCircle },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Intention routing */}
      <div className="mb-2">
        <p className="text-sm text-muted-foreground mb-3 font-medium">Elegí cómo querés avanzar:</p>
        <div className="grid grid-cols-2 gap-2">
          {intentOptions.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm(f => ({ ...f, type: value }))}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                form.type === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Nombre *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Tu nombre"
            className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="vos@empresa.com"
            className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">WhatsApp</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+54 9 11 1234-5678"
            className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Empresa</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Nombre de tu empresa"
            className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-muted-foreground mb-1.5">Mensaje (opcional)</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Contanos más sobre tu negocio o lo que necesitás..."
          rows={4}
          className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold transition-all"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar y recibir respuesta'}
      </button>
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Te respondemos por email o WhatsApp en menos de 2 horas hábiles.
      </p>
      {status === 'error' && (
        <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          No se pudo enviar. Intentá de nuevo o escribinos a{' '}
          <a href="mailto:hola@tuagentestore.com" className="underline">hola@tuagentestore.com</a>
        </p>
      )}
    </form>
  )
}
