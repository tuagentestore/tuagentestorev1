import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Martín García',
    role: 'Director Comercial',
    company: 'InmoPro Buenos Aires',
    text: 'El Sales AI Closer califica mis leads antes de que los vea. El equipo solo habla con gente que realmente quiere comprar. Nuestra tasa de cierre subió 40%.',
    rating: 5,
    avatar: 'MG',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Sofía Romero',
    role: 'CEO',
    company: 'LegalTech Mendoza',
    text: 'El agente de soporte resuelve el 80% de las consultas sin que yo intervenga. Mis clientes piensan que tengo un equipo enorme. Son solo yo y el agente.',
    rating: 5,
    avatar: 'SR',
    color: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Diego Herrera',
    role: 'Fundador',
    company: 'Seguros Online AR',
    text: 'En 24 horas teníamos el agente respondiendo cotizaciones en WhatsApp. Antes perdíamos leads fuera del horario de oficina. Ahora no se escapa ninguno.',
    rating: 5,
    avatar: 'DH',
    color: 'from-indigo-500 to-blue-500',
  },
]

const LOGOS = [
  'Google Workspace', 'WhatsApp Business', 'HubSpot',
  'Stripe', 'Calendly', 'Notion', 'Shopify', 'OpenAI',
]

export default function SocialProof() {
  return (
    <section className="py-24 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Casos reales
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Empresas que ya automatizaron con nosotros
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-muted-foreground text-sm ml-2">5.0 promedio</span>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-custom transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Integration logos */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-6">
            Se integra con las herramientas que ya usás
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {LOGOS.map((logo) => (
              <span
                key={logo}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
