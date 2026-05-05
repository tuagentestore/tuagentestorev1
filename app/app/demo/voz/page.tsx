import type { Metadata } from 'next'
import { Zap } from 'lucide-react'
import VoiceDemoClient from '@/components/voice/VoiceDemoClient'

export const metadata: Metadata = {
  title: 'Demo de Voz — Vera | TuAgente Store',
  description:
    'Hablá en tiempo real con Vera, nuestra asistente IA de voz. Preguntale sobre agentes, precios y cómo automatizar tu empresa en español.',
}

export default function VozPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12 max-w-md">
        <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
          <Zap className="w-3 h-3" />
          DEMO EN VIVO · VOZ REAL
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
          Hablá con{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Vera
          </span>
        </h1>
        <p className="text-slate-400 text-base">
          Asistente IA de voz en español. Preguntale sobre agentes, precios e integraciones — responde al instante.
        </p>
      </div>

      {/* Voice component */}
      <VoiceDemoClient />

      {/* CTA below */}
      <div className="mt-14 text-center">
        <p className="text-slate-600 text-xs mb-3">¿Querés esta misma experiencia en tu empresa?</p>
        <a
          href="/empezar"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Encontrá el agente ideal para tu negocio →
        </a>
      </div>
    </div>
  )
}
