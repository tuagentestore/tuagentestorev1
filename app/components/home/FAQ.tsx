'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: '¿Qué tan difícil es implementar un agente IA en mi negocio?',
    a: 'Nada difícil. Nosotros nos encargamos de todo el setup técnico. Vos solo necesitás responder algunas preguntas sobre tu operación y en 24–48h el agente ya está activo. Sin código, sin servidores, sin equipo técnico propio.',
  },
  {
    q: '¿Necesito conocimientos técnicos para usar la plataforma?',
    a: 'No. TuAgente Store está diseñado para dueños de negocio y equipos operativos, no para programadores. Si sabés usar WhatsApp y un Excel básico, podés aprovechar el 100% de la plataforma.',
  },
  {
    q: '¿Cómo sé qué agente es el más adecuado para mi empresa?',
    a: 'Tenemos un Wizard de selección que en 3 minutos te recomienda el agente ideal según tu industria, tamaño de equipo y los problemas que querés resolver. También podés agendar un diagnóstico gratuito con nuestro equipo.',
  },
  {
    q: '¿Cuánto tiempo tarda en verse un retorno de la inversión?',
    a: 'La mayoría de nuestros clientes recuperan la inversión en el primer mes. Los agentes trabajan 24/7 sin errores ni ausencias, lo que se traduce en más leads respondidos, menos horas manuales y mejor experiencia al cliente desde la primera semana.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Todos los datos se procesan bajo cifrado TLS, los accesos son por JWT con tokens de corta duración, y nunca compartimos información con terceros. Cumplimos con la LPDP argentina y nos alineamos con los principios del GDPR europeo.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. No hay contratos de permanencia forzada. Podés cancelar tu suscripción mensual en cualquier momento desde tu panel. Si cancelás, el agente deja de estar activo al final del período pagado.',
  },
  {
    q: '¿Los agentes funcionan con mis herramientas actuales (CRM, WhatsApp, etc.)?',
    a: 'Sí. Nuestros agentes se integran con WhatsApp Business API, CRMs populares (HubSpot, Pipedrive, Zoho), Google Sheets, Gmail, calendarios y más. Si usás una herramienta específica, consultanos y evaluamos la integración.',
  },
  {
    q: '¿Qué pasa si el agente comete un error o da una respuesta incorrecta?',
    a: 'Los agentes tienen un margen de error mínimo porque se entrenan con la información de tu negocio. Además, podés configurar límites de acción y un "human-in-the-loop" para casos sensibles. Siempre hay un humano que puede tomar el control.',
  },
  {
    q: '¿Cuánto cuesta realmente? ¿Hay costos ocultos?',
    a: 'El plan comienza desde USD 397/mes todo incluido: setup, soporte, actualizaciones y acceso al marketplace. No hay costos de instalación ni sorpresas. El precio que ves es el precio que pagás.',
  },
  {
    q: '¿Qué diferencia a TuAgente Store de otros servicios de IA?',
    a: 'Somos un marketplace de agentes pre-construidos para LATAM, con setup guiado, soporte en español y precios accesibles. No vendemos tecnología genérica — implementamos sistemas agénticos reales adaptados a cómo operan los negocios de la región.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">Preguntas frecuentes</h2>
          <p className="text-muted-foreground text-lg">Todo lo que querés saber antes de empezar.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                aria-expanded={open === i}
              >
                <span className="font-medium text-foreground text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
