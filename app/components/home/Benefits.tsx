import { Clock, TrendingUp, Plug, Shield, Headphones, BarChart3 } from 'lucide-react'

const BENEFITS = [
  {
    icon: Clock,
    title: 'Activo en 24 horas',
    description: 'De la reserva al agente funcionando en tu negocio en menos de un día hábil. Sin meses de desarrollo.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Plug,
    title: 'Se integra con tus herramientas',
    description: 'WhatsApp, Gmail, CRM, Sheets, Calendly y más. El agente trabaja donde vos ya trabajás.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: TrendingUp,
    title: 'ROI medible desde el día 1',
    description: 'Leads calificados, respuestas en segundos y cero tiempo perdido en tareas repetitivas.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Shield,
    title: 'Seguro y confiable',
    description: 'Datos seguros, accesos controlados y auditoría de cada acción del agente. Vos tenés el control.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Headphones,
    title: 'Soporte en español',
    description: 'Equipo dedicado en LATAM. Llamada de onboarding, setup personalizado y soporte continuo.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: BarChart3,
    title: 'Métricas en tiempo real',
    description: 'Dashboard con acciones ejecutadas, leads generados, conversiones y ROI semana a semana.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
]

export default function Benefits() {
  return (
    <section className="py-14 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Por qué TuAgente Store
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitás
            <span className="text-gradient"> para escalar con IA</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No vendemos tecnología por sí sola. Entregamos agentes que realmente trabajan
            dentro de tu operación desde el primer día.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-custom transition-all duration-300"
            >
              <div className={`w-12 h-12 ${b.bg} rounded-xl flex items-center justify-center mb-4`}>
                <b.icon className={`w-6 h-6 ${b.color}`} />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
