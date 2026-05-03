import { Microscope, Settings2, CheckCircle, BarChart3 } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Microscope,
    title: 'Diagnóstico de tu operación',
    description: 'Identificamos los procesos que más tiempo consumen en tu equipo y definimos qué parte puede ejecutar un agente desde el día 1.',
    color: 'from-blue-500 to-blue-600',
    label: 'Diagnóstico',
  },
  {
    number: '02',
    icon: Settings2,
    title: 'Sistema diseñado para vos',
    description: 'Configuramos el agente con tus integraciones, flujos de trabajo y tono de marca. No es un template genérico — es tu sistema.',
    color: 'from-indigo-500 to-indigo-600',
    label: 'Configuración',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Activación sin código',
    description: 'Nuestro equipo implementa todo y te muestra cómo funciona. Vos aprobás y lanzás. Sin desarrollo. Sin esperas de semanas.',
    color: 'from-violet-500 to-violet-600',
    label: 'Activación',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Sistema activo y medible',
    description: 'Dashboard con métricas reales desde el día 1: acciones ejecutadas, tiempo ahorrado y leads procesados. Soporte continuo incluido.',
    color: 'from-purple-500 to-purple-600',
    label: 'Resultados',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-14 sm:py-24 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Implementación
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Así implementamos
            <span className="text-gradient"> el sistema</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No vendemos software. Implementamos el sistema operativo de tu negocio.
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

                <div className="text-xs font-medium text-primary/70 uppercase tracking-wider mb-1">{step.label}</div>
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
