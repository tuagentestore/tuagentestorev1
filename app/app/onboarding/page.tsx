'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const industries = [
  'Inmobiliaria', 'Concesionaria', 'Clínica / Salud', 'Agencia de marketing',
  'E-commerce', 'Seguros', 'Educación / Academia', 'Consultora B2B',
  'Restaurante / Gastronomía', 'Otro',
]

const channels = [
  { id: 'whatsapp', label: 'WhatsApp Business', icon: '💬' },
  { id: 'instagram', label: 'Instagram DM', icon: '📸' },
  { id: 'website', label: 'Chat en sitio web', icon: '🌐' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'facebook', label: 'Facebook Messenger', icon: '📘' },
]

const leadVolumes = [
  '1–20 leads/semana', '21–100 leads/semana', '101–500 leads/semana', '+500 leads/semana',
]

const urgencies = [
  { value: 'now', label: 'Lo antes posible' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'exploring', label: 'Solo explorando' },
]

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    industry: '',
    channels: [] as string[],
    lead_volume: '',
    main_problem: '',
    current_tools: '',
    urgency: '',
    phone: '',
    company: '',
  })

  const toggleChannel = (id: string) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(id)
        ? f.channels.filter((c) => c !== id)
        : [...f.channels, id],
    }))
  }

  const canProceed = () => {
    if (step === 1) return form.industry !== ''
    if (step === 2) return form.channels.length > 0 && form.lead_volume !== ''
    if (step === 3) return form.main_problem.length > 10
    return form.urgency !== ''
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      router.push('/dashboard?onboarding=complete')
    } catch {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#111827] border border-gray-700/50 rounded-2xl p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">¿En qué industria operás?</h2>
              <p className="text-gray-400 text-sm mb-6">Esto nos ayuda a configurar el agente con los mejores ejemplos para tu sector.</p>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setForm((f) => ({ ...f, industry: ind }))}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${
                      form.industry === ind
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#0a0f1e] border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">¿Por qué canales recibís leads?</h2>
              <p className="text-gray-400 text-sm mb-6">Seleccioná todos los que aplican.</p>
              <div className="space-y-3 mb-6">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      form.channels.includes(ch.id)
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#0a0f1e] border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span>{ch.icon}</span>
                    <span className="text-sm">{ch.label}</span>
                    {form.channels.includes(ch.id) && <span className="ml-auto text-blue-400">✓</span>}
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-sm mb-3">¿Cuántos leads recibís por semana?</p>
              <div className="grid grid-cols-2 gap-3">
                {leadVolumes.map((vol) => (
                  <button
                    key={vol}
                    onClick={() => setForm((f) => ({ ...f, lead_volume: vol }))}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      form.lead_volume === vol
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#0a0f1e] border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {vol}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">¿Cuál es tu principal problema hoy?</h2>
              <p className="text-gray-400 text-sm mb-6">Contanos con tus palabras. Esto nos ayuda a priorizar qué automatizar primero.</p>
              <textarea
                value={form.main_problem}
                onChange={(e) => setForm((f) => ({ ...f, main_problem: e.target.value }))}
                placeholder="Ej: Recibo muchos mensajes en WhatsApp pero no tengo tiempo para responder a todos. Pierdo leads que preguntan de noche o los fines de semana..."
                rows={5}
                className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none mb-4"
              />
              <input
                type="text"
                value={form.current_tools}
                onChange={(e) => setForm((f) => ({ ...f, current_tools: e.target.value }))}
                placeholder="¿Qué herramientas usás ahora? (CRM, WhatsApp Business, GHL, nada...)"
                className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Último paso</h2>
              <p className="text-gray-400 text-sm mb-6">¿Cuándo querés tener el agente activo?</p>
              <div className="space-y-3 mb-6">
                {urgencies.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setForm((f) => ({ ...f, urgency: value }))}
                    className={`w-full p-3 rounded-xl border text-sm text-left transition-all ${
                      form.urgency === value
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#0a0f1e] border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="WhatsApp (ej: +54 9 11 1234-5678)"
                className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3"
              />
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Nombre de tu empresa"
                className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-all"
              >
                Atrás
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canProceed()}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all"
              >
                {loading ? 'Guardando...' : 'Finalizar onboarding'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
