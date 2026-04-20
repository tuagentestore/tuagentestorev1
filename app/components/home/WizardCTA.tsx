import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function WizardCTA() {
  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-primary/20 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="glow-orb w-64 h-64 bg-blue-600/10 -top-20 -left-20" />
            <div className="glow-orb w-64 h-64 bg-violet-600/10 -bottom-20 -right-20" />
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              Recomendación personalizada con IA
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              No sabés cuál agente necesitás?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Respondé 5 preguntas y nuestra IA te recomienda el agente ideal
              con un plan de implementación personalizado para tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/wizard"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-5 h-5" />
                Encontrá tu agente ideal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold hover:border-primary/50 hover:shadow-custom transition-all"
              >
                Ver catálogo completo
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ✓ Sin registro · ✓ Gratis · ✓ Resultado en 30 segundos
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
