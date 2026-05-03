import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Mail, MessageCircle, Clock } from 'lucide-react'
import ContactFormInner from '@/components/contact/ContactFormInner'

export const metadata: Metadata = {
  title: 'Hablemos sobre tu negocio',
  description: 'Contactanos para una demo, diagnóstico o activación de agente. Respondemos en menos de 2 horas hábiles.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Contacto
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Hablemos sobre tu negocio
            </h1>
            <p className="text-muted-foreground mb-8">
              Respondemos en menos de 2 horas hábiles. Si es urgente, escribinos por WhatsApp.
            </p>

            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'hola@tuagentestore.com' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+54 343 752-7193' },
                { icon: Clock, label: 'Horario', value: 'Lun–Vie 9:00–18:00 (Argentina)' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">{label}</div>
                    <div className="text-foreground">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Industrias que atendemos</p>
              <div className="flex flex-wrap gap-2">
                {['Inmobiliarias', 'Clínicas', 'Concesionarias', 'Agencias', 'E-commerce', 'Seguros'].map((ind) => (
                  <span key={ind} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <Suspense fallback={<div className="text-muted-foreground text-sm">Cargando...</div>}>
              <ContactFormInner />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
