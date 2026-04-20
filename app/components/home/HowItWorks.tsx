import { Search, Play, CheckCircle, Rocket } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Explorá el catálogo',
    description: 'Navegá agentes especializados por categoría: ventas, soporte, marketing, operaciones y más.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    icon: Play,
    title: 'Probá el demo gratis',
    description: 'Chateá con el agente en vivo y verificá que resuelve exactamente lo que tu negocio necesita.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Reservá tu activación',
    description: 'Completá el formulario en 2 minutos. Nuestro equipo se contacta en menos de 24 horas.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Agente activo en 24h',
    description: 'Configuramos e integramos el agente con tus herramientas. Listo para trabajar desde el día 1.',
    color: 'from-purple-500 to-purple-600',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-14 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Proceso simple
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            De la idea al agente activo
            <span className="text-gradient"> en 4 pasos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Sin código. Sin contratos complejos. Sin semanas de espera.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%-12px)] w-6 h-[2px] bg-gradient-to-r from-border to-transparent z-10" />
              )}

              <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/30 hover:shadow-custom transition-all duration-300 group-hover:-translate-y-1">
                {/* Number + icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-custom`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-black text-border select-none">{step.number}</span>
                </div>

                <h3 className="font-bold text-foreground text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
