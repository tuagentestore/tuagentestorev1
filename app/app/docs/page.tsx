import { Metadata } from 'next'
import { BookOpen, Zap, Settings, Code2, MessageSquare, LifeBuoy } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Documentación',
  description: 'Guías, tutoriales y referencias técnicas para activar y usar tus agentes IA.',
}

const DOCS = [
  {
    icon: Zap,
    title: 'Inicio rápido',
    desc: 'Cómo comprar, reservar y activar tu primer agente en 48h.',
    links: [
      { label: 'Explorar el catálogo', href: '/agents' },
      { label: 'Probar una demo gratis', href: '/agents#demo' },
      { label: 'Reservar activación', href: '/contact' },
    ],
  },
  {
    icon: Settings,
    title: 'Configuración e integraciones',
    desc: 'Cómo conectar Gmail, WhatsApp, HubSpot, Sheets y más.',
    links: [
      { label: 'Autenticación OAuth', href: '#' },
      { label: 'Mapeo de datos', href: '#' },
      { label: 'Testing de conexión', href: '#' },
    ],
  },
  {
    icon: Code2,
    title: 'Personalización del agente',
    desc: 'Definí reglas de negocio, workflows y triggers específicos.',
    links: [
      { label: 'Reglas de negocio', href: '#' },
      { label: 'Configurar workflows', href: '#' },
      { label: 'Triggers y automatizaciones', href: '#' },
    ],
  },
  {
    icon: MessageSquare,
    title: 'Demo interactivo',
    desc: 'Cómo sacar el máximo provecho de los 3 mensajes de prueba.',
    links: [
      { label: 'Ver agentes disponibles', href: '/agents' },
      { label: 'Límites del demo', href: '#' },
      { label: 'Convertir demo en reserva', href: '#' },
    ],
  },
  {
    icon: LifeBuoy,
    title: 'Soporte y SLA',
    desc: 'Tiempos de respuesta, canales de soporte y garantías.',
    links: [
      { label: 'Ir a soporte', href: '/soporte' },
      { label: 'SLA por plan', href: '/pricing' },
      { label: 'Estado del sistema', href: '/api/health' },
    ],
  },
  {
    icon: BookOpen,
    title: 'Casos de implementación',
    desc: 'Aprende de empresas reales que ya automatizaron con éxito.',
    links: [
      { label: 'Ver todos los casos', href: '/casos' },
      { label: 'Caso Inmobiliaria', href: '/casos/inmobiliaria-gestion-leads' },
      { label: 'Caso Seguros', href: '/casos/aseguradora-consultas-automaticas' },
    ],
  },
]

const TUTORIALS = [
  { title: 'Cómo comprar un agente', duration: '3 min', steps: ['Explorá el catálogo', 'Probá el demo', 'Completá el formulario', 'Agendá la llamada'] },
  { title: 'La llamada de onboarding', duration: '2 min', steps: ['Presentación del equipo', 'Relevamiento de necesidades', 'Definición de alcance', 'Cronograma'] },
  { title: 'Cómo se integran las APIs', duration: '4 min', steps: ['Autenticación OAuth', 'Mapeo de datos', 'Testing de conexión', 'Activación'] },
  { title: 'Personalización del agente', duration: '5 min', steps: ['Definí reglas de negocio', 'Configurá workflows', 'Establecé triggers', 'Validá resultados'] },
]

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Documentación
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Todo lo que necesitás saber
          </h1>
          <p className="text-muted-foreground text-lg">
            Guías, tutoriales y referencias para activar y usar tus agentes IA.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">

        {/* Docs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {DOCS.map((doc) => (
            <div key={doc.title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-custom transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <doc.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{doc.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{doc.desc}</p>
              <ul className="space-y-2">
                {doc.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-primary hover:underline flex items-center gap-1">
                      → {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tutorials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Tutoriales del Marketplace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TUTORIALS.map((tut, i) => (
              <div key={tut.title} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      Tutorial {i + 1}
                    </span>
                    <h3 className="font-semibold text-foreground mt-2">{tut.title}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{tut.duration}</span>
                </div>
                <ol className="space-y-2">
                  {tut.steps.map((step, j) => (
                    <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {j + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">¿No encontrás lo que buscás?</h2>
          <p className="text-muted-foreground mb-6">Nuestro equipo responde en menos de 24 horas.</p>
          <Link
            href="/soporte"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
          >
            Contactar soporte
          </Link>
        </div>
      </div>
    </main>
  )
}
