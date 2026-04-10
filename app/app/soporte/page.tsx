import { Metadata } from 'next'
import { LifeBuoy, MessageCircle, Mail, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Soporte | TuAgenteStore',
  description: 'Canales de soporte, SLA por plan y preguntas frecuentes.',
}

const CHANNELS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    desc: 'Soporte directo para clientes activos.',
    detail: 'Respuesta en < 2 horas en horario laboral.',
    cta: 'Abrir WhatsApp',
    href: 'https://wa.me/5491100000000',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Mail,
    title: 'Email',
    desc: 'Para consultas técnicas y documentación.',
    detail: 'soporte@tuagentestore.com — respuesta < 24h.',
    cta: 'Enviar email',
    href: 'mailto:soporte@tuagentestore.com',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Clock,
    title: 'Ticket de soporte',
    desc: 'Creá un ticket con seguimiento visible.',
    detail: 'Ideal para incidentes con historial.',
    cta: 'Abrir ticket',
    href: '/contact?type=support',
    color: 'from-violet-500 to-purple-500',
  },
]

const SLA = [
  { plan: 'Starter', response: '48 horas', channels: 'Email', incidents: 'No incluido' },
  { plan: 'Pro', response: '24 horas', channels: 'Email + WhatsApp', incidents: '2/mes' },
  { plan: 'Enterprise', response: '4 horas', channels: 'Dedicado', incidents: 'Ilimitado' },
]

const FAQS = [
  {
    q: '¿Cómo reporto un error en mi agente?',
    a: 'Podés abrir un ticket desde esta página o escribirnos por WhatsApp. Incluí el nombre del agente, la acción que falló y el mensaje de error si lo tenés.',
  },
  {
    q: '¿Qué pasa si mi agente deja de responder?',
    a: 'Nuestro sistema monitorea los agentes 24/7. Si detectamos una caída te notificamos automáticamente. También podés escribirnos y revisamos en menos de 1 hora.',
  },
  {
    q: '¿Puedo pedir ajustes en el comportamiento del agente?',
    a: 'Sí, en los planes Pro y Enterprise incluimos 2 ajustes de configuración por mes. En Starter podés contratar ajustes puntuales.',
  },
  {
    q: '¿Cómo cancelo mi suscripción?',
    a: 'Escribinos al email de soporte con el asunto "Cancelar suscripción". Procesamos la baja dentro de las 24 horas hábiles.',
  },
  {
    q: '¿Tienen garantía de satisfacción?',
    a: 'Sí. Si en los primeros 30 días el agente no performa según lo prometido, revisamos la configuración sin cargo adicional o devolvemos el setup fee.',
  },
]

export default function SoportePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <LifeBuoy className="w-4 h-4" />
            Soporte
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            ¿En qué te podemos ayudar?
          </h1>
          <p className="text-muted-foreground text-lg">
            Canales de atención, SLA garantizado y respuestas a las preguntas más frecuentes.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Channels */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-8">Canales de contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHANNELS.map((ch) => (
              <div key={ch.title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-custom transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center mb-4`}>
                  <ch.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{ch.title}</h3>
                <p className="text-muted-foreground text-sm mb-1">{ch.desc}</p>
                <p className="text-xs text-muted-foreground mb-4">{ch.detail}</p>
                <Link
                  href={ch.href}
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                >
                  {ch.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* SLA table */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">SLA por plan</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold text-foreground">Plan</th>
                  <th className="text-left p-4 font-semibold text-foreground">Tiempo de respuesta</th>
                  <th className="text-left p-4 font-semibold text-foreground">Canales</th>
                  <th className="text-left p-4 font-semibold text-foreground">Incidentes/mes</th>
                </tr>
              </thead>
              <tbody>
                {SLA.map((row) => (
                  <tr key={row.plan} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">{row.plan}</td>
                    <td className="p-4 text-muted-foreground">{row.response}</td>
                    <td className="p-4 text-muted-foreground">{row.channels}</td>
                    <td className="p-4 text-muted-foreground">{row.incidents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-2">{faq.q}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">¿No encontraste tu respuesta?</h2>
          <p className="text-muted-foreground mb-6">Abrí un ticket y un especialista te responde en menos de 24h.</p>
          <Link
            href="/contact?type=support"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-glow transition-all"
          >
            Abrir ticket de soporte
          </Link>
        </div>
      </div>
    </main>
  )
}
