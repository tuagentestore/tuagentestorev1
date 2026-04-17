import Link from 'next/link'
import { ArrowRight, Zap, Calendar, MessageCircle } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Glow container */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-violet-600/10" />
          <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
          <div className="glow-orb w-80 h-80 bg-blue-600/15 -top-20 -left-20" />
          <div className="glow-orb w-60 h-60 bg-violet-600/10 -bottom-10 -right-10" />

          <div className="relative z-10 px-8 py-16 sm:px-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Comenzá hoy
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">
              Tu negocio automatizado
              <br />
              <span className="text-gradient-hero">en menos de 24 horas</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Explorá el catálogo, probá el demo gratis y reservá tu activación.
              Sin tarjeta de crédito, sin compromisos. Solo resultados.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link
                href="/agents"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-5 h-5" />
                Explorar Agentes
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact?type=diagnostico"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-card/80 border border-border text-foreground rounded-xl font-semibold text-base hover:border-primary/50 hover:bg-muted transition-all"
              >
                <Calendar className="w-5 h-5 text-primary" />
                Contratar Diagnóstico
              </Link>
              <a
                href="https://wa.me/5493437527193?text=Hola%2C+me+interesa+TuAgente+Store"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366]/10 border border-[#25D366]/30 text-foreground rounded-xl font-semibold text-base hover:bg-[#25D366]/20 hover:border-[#25D366]/50 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Escribir por WhatsApp
              </a>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Respondemos en menos de 2 horas · Lunes a Viernes 9–18h ARG · info@tuagentestore.com
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
