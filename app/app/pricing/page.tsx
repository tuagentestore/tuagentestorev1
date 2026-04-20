'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: { monthly: 397, annual: 330 },
    description: 'Para negocios que quieren empezar a automatizar sin complejidad.',
    features: [
      '1 agente IA activo',
      'Hasta 500 conversaciones/mes',
      'WhatsApp o Web (1 canal)',
      'Plantillas de respuesta incluidas',
      'Dashboard básico',
      'Soporte por email',
    ],
    cta: 'Empezar con Starter',
    highlight: false,
    badge: null,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: { monthly: 597, annual: 497 },
    description: 'Para negocios con volumen que necesitan automatización real.',
    features: [
      '3 agentes IA activos',
      'Hasta 2.000 conversaciones/mes',
      'WhatsApp + Web + Instagram (3 canales)',
      'Integración CRM (HubSpot, GHL)',
      'Agendamiento automático con Google Calendar',
      'Reportes semanales automáticos',
      'Soporte prioritario (< 4h)',
    ],
    cta: 'Comenzar con Professional',
    highlight: true,
    badge: 'Más elegido',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 0, annual: 0 },
    description: 'Solución completa para equipos que escalan en serio.',
    features: [
      'Agentes ilimitados',
      'Conversaciones ilimitadas',
      'Todos los canales disponibles',
      'Integraciones custom (API, Webhooks)',
      'Agente de IA entrenado con tu base de conocimiento',
      'Onboarding dedicado (1:1)',
      'SLA garantizado + soporte 24/7',
      'Panel multi-equipo',
    ],
    cta: 'Hablar con ventas',
    highlight: false,
    badge: null,
  },
]

const faqs = [
  {
    q: '¿Hay período de prueba?',
    a: 'Sí. Todos los planes incluyen 14 días de prueba gratis. No se requiere tarjeta de crédito.',
  },
  {
    q: '¿Puedo cambiar de plan después?',
    a: 'Sí, en cualquier momento. Si subís de plan, el cambio es inmediato. Si bajás, se aplica al inicio del siguiente ciclo.',
  },
  {
    q: '¿Qué pasa si supero el límite de conversaciones?',
    a: 'El agente no se detiene. Se factura automáticamente el bloque extra ($0.15/conversación adicional) o podés subir de plan.',
  },
  {
    q: '¿Los precios son en USD?',
    a: 'Sí, los precios están en USD. Aceptamos pagos con tarjeta internacional y transferencia bancaria.',
  },
  {
    q: '¿Necesito conocimientos técnicos?',
    a: 'No. Nuestro equipo hace toda la implementación. Vos solo aprobás el flujo y los mensajes antes de salir en vivo.',
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
          Precios transparentes
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Elegí el plan que escala con tu negocio
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Sin contratos anuales forzados. Sin letra chica. Empezá hoy y escalá cuando lo necesites.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billing === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billing === 'annual'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Anual
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
              2 meses gratis
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border transition-all flex flex-col ${
                plan.highlight
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-[#111827] border-gray-700/50'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                  {plan.badge}
                </div>
              )}

              <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                {plan.id === 'enterprise' ? (
                  <div>
                    <span className="text-4xl font-bold text-white">A cotizar</span>
                    <p className="text-gray-400 text-sm mt-1">Precio según alcance del proyecto</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold text-white">
                      ${plan.price[billing].toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">USD/mes</span>
                    {billing === 'annual' && (
                      <p className="text-green-400 text-xs mt-1">
                        Ahorrás ${((plan.price.monthly - plan.price.annual) * 12).toLocaleString()} al año
                      </p>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === 'enterprise' ? '/contact?type=enterprise' : `/register?plan=${plan.id}`}
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all mt-auto ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-center">
          {['14 días de prueba gratis', 'Sin contrato de permanencia', 'Implementación incluida', 'Soporte en español'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-green-400">✓</span>
              {item}
            </div>
          ))}
        </div>

        {/* FAQ — accordion */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-white mb-8">Preguntas frecuentes</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div
                key={q}
                className="bg-[#111827] border border-gray-700/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white text-sm">{q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    openFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-gray-400 text-sm px-5 pb-4 border-t border-gray-700/50 pt-3">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">¿No sabés qué plan te conviene?</p>
          <Link
            href="/contact?type=diagnostico"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-medium"
          >
            Hablar con un asesor gratis
          </Link>
        </div>
      </div>
    </main>
  )
}
