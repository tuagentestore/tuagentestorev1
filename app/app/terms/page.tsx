import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Uso',
  description: 'Términos y condiciones de uso de TuAgenteStore.',
}

const sections = [
  {
    title: '1. Aceptación de los términos',
    content: 'Al registrarse y utilizar TuAgenteStore, aceptás estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguno de estos términos, no debés utilizar el servicio. TuAgenteStore se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios registrados por email.',
  },
  {
    title: '2. Descripción del servicio',
    content: 'TuAgenteStore es una plataforma que ofrece agentes de inteligencia artificial como servicio para empresas y negocios. Los agentes se activan, configuran e integran por el equipo de TuAgenteStore según las especificaciones del cliente. El servicio incluye el acceso a los agentes según el plan contratado, soporte técnico y actualizaciones.',
  },
  {
    title: '3. Cuentas y acceso',
    content: 'Sos responsable de mantener la confidencialidad de tus credenciales de acceso. No podés compartir tu cuenta ni permitir que terceros accedan a ella. TuAgenteStore puede suspender o cancelar cuentas que violen estos términos, que presenten actividad fraudulenta, o que usen el servicio de forma que perjudique a terceros.',
  },
  {
    title: '4. Uso aceptable',
    content: 'Aceptás usar TuAgenteStore únicamente para fines legítimos de negocios. Está prohibido usar el servicio para enviar comunicaciones no solicitadas masivas (spam), para actividades ilegales, para recopilar datos de usuarios sin consentimiento, o para actividades que infrinjan derechos de terceros.',
  },
  {
    title: '5. Datos y privacidad',
    content: 'TuAgenteStore procesa datos de conversaciones para brindar el servicio. Los datos son tratados según nuestra Política de Privacidad. No vendemos ni compartimos datos de clientes con terceros no autorizados. Los datos de conversaciones pueden ser usados de forma anonimizada para mejorar los modelos de IA.',
  },
  {
    title: '6. Precios y facturación',
    content: 'Los precios están en USD y se facturan de forma mensual o anual según el plan elegido. El pago se realiza por adelantado. Las suscripciones se renuevan automáticamente salvo cancelación previa al próximo ciclo. Las tarifas pueden actualizarse con 30 días de preaviso.',
  },
  {
    title: '7. Cancelación y reembolsos',
    content: 'Podés cancelar tu suscripción en cualquier momento desde el dashboard o contactando a soporte. No se emiten reembolsos por períodos parciales ya facturados. El servicio continúa activo hasta el final del período pagado. Los primeros 14 días son de prueba gratuita sin cargo.',
  },
  {
    title: '8. Limitación de responsabilidad',
    content: 'TuAgenteStore no garantiza que el servicio esté disponible de forma ininterrumpida o sin errores. La plataforma se provee "tal como está". En ningún caso TuAgenteStore será responsable por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso del servicio.',
  },
  {
    title: '9. Propiedad intelectual',
    content: 'Todo el contenido, código, marcas, logos y materiales de TuAgenteStore son propiedad de TuAgenteStore o sus licenciantes. No se permite reproducir, distribuir o modificar estos materiales sin autorización expresa. El contenido generado por tus agentes (respuestas, datos) es propiedad de tu empresa.',
  },
  {
    title: '10. Ley aplicable',
    content: 'Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa que no pueda resolverse amigablemente será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.',
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">Términos de Uso</h1>
          <p className="text-muted-foreground">
            Última actualización: Abril 2025 · Vigente para todos los usuarios registrados en TuAgenteStore.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        {sections.map(({ title, content }) => (
          <div key={title} className="border-b border-border pb-8 last:border-0">
            <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{content}</p>
          </div>
        ))}

        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            ¿Tenés preguntas sobre estos términos?
          </p>
          <Link
            href="/contact?type=support"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            Contactar al equipo
          </Link>
        </div>
      </div>
    </main>
  )
}
