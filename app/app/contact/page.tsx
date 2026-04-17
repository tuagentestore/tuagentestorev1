'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Mail, MessageCircle, Clock, CheckCircle } from 'lucide-react'

const contactTypes = [
  { value: 'demo', label: 'Quiero ver una demo' },
  { value: 'diagnostico', label: 'Quiero una auditoría gratuita' },
  { value: 'enterprise', label: 'Quiero hablar sobre Enterprise' },
  { value: 'support', label: 'Soy cliente y necesito soporte' },
  { value: 'other', label: 'Otro' },
]

function ContactForm() {
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
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-3">¡Ya recibimos tu mensaje!</h2>
        <p className="text-gray-400 leading-relaxed max-w-sm mx-auto">
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
          <a href="/agents" className="px-5 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium">
            Ver agentes mientras tanto
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Intention routing */}
      <div className="mb-2">
        <p className="text-sm text-gray-400 mb-3 font-medium">Elegí cómo querés avanzar:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'demo',        label: 'Ver una demo',       icon: '▶' },
            { value: 'diagnostico', label: 'Pedir diagnóstico',  icon: '🔍' },
            { value: 'enterprise',  label: 'Activar un agente',  icon: '⚡' },
            { value: 'support',     label: 'Necesito soporte',   icon: '💬' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, type: opt.value }))}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                form.type === opt.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Nombre *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Tu nombre"
            className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="vos@empresa.com"
            className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">WhatsApp</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+54 9 11 1234-5678"
            className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Empresa</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Nombre de tu empresa"
            className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Mensaje (opcional)</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Contanos más sobre tu negocio o lo que necesitás..."
          rows={4}
          className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold transition-all"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar y recibir respuesta'}
      </button>
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        Te respondemos por email o WhatsApp en menos de 2 horas hábiles.
        Si aplica, te enviamos el link de demo o activación.
      </p>
      {status === 'error' && (
        <p className="text-red-400 text-sm text-center">
          Hubo un error. Escribinos directo a hola@tuagentestore.com
        </p>
      )}
    </form>
  )
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
              Contacto
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Hablemos sobre tu negocio
            </h1>
            <p className="text-gray-400 mb-8">
              Respondemos en menos de 2 horas hábiles. Si es urgente, escribinos por WhatsApp.
            </p>

            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'hola@tuagentestore.com' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+54 343 752-7193' },
                { icon: Clock, label: 'Horario', value: 'Lun–Vie 9:00–18:00 (Argentina)' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">{label}</div>
                    <div className="text-gray-300">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700/50">
              <p className="text-sm text-gray-500 mb-3">Industrias que atendemos</p>
              <div className="flex flex-wrap gap-2">
                {['Inmobiliarias', 'Clínicas', 'Concesionarias', 'Agencias', 'E-commerce', 'Seguros'].map((ind) => (
                  <span key={ind} className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-700/50 rounded-2xl p-6">
            <Suspense fallback={<div className="text-gray-400 text-sm">Cargando...</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
