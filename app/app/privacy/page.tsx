import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de TuAgente Store. Conocé cómo recopilamos, usamos y protegemos tus datos personales.',
}

const SECTIONS = [
  {
    title: '1. Responsable del Tratamiento',
    content: `TuAgente Store (en adelante "la Plataforma", "nosotros") es la entidad responsable del tratamiento de los datos personales recopilados a través del sitio web tuagentestore.com y sus servicios asociados.

Para consultas sobre privacidad podés contactarnos en: info@tuagentestore.com`,
  },
  {
    title: '2. Datos que Recopilamos',
    content: `Recopilamos los siguientes tipos de datos:

**Datos que proporcionás directamente:**
- Nombre completo y nombre de empresa
- Dirección de correo electrónico
- Número de teléfono / WhatsApp
- Industria o rubro de tu negocio
- Mensajes enviados a través de formularios de contacto y demos
- Información sobre el caso de uso de tu negocio

**Datos recopilados automáticamente:**
- Dirección IP y datos de geolocalización aproximada
- Tipo de dispositivo, navegador y sistema operativo
- Páginas visitadas, duración de la sesión y comportamiento de navegación
- Datos de la sesión de demo (preguntas realizadas, modelo IA utilizado)
- UTM params de campañas publicitarias (fuente, medio, campaña)

**Datos de terceros:**
- Si iniciás sesión con Google OAuth, recibimos nombre, email y foto de perfil de tu cuenta de Google`,
  },
  {
    title: '3. Finalidad del Tratamiento',
    content: `Utilizamos tus datos para:

- **Prestación del servicio:** activar y configurar los agentes IA contratados, gestionar tu cuenta y procesar reservas
- **Comunicación comercial:** enviar información sobre el estado de tu implementación, actualizaciones del servicio y notificaciones de soporte
- **Mejora del servicio:** analizar conversaciones de demo (de forma anonimizada) para mejorar los modelos y prompts de los agentes
- **Marketing:** enviar contenido relevante sobre automatización y casos de éxito (podés darte de baja en cualquier momento)
- **Cumplimiento legal:** cumplir con obligaciones legales y regulatorias aplicables en Argentina y la Unión Europea
- **Seguridad:** detectar y prevenir fraudes, abusos y accesos no autorizados`,
  },
  {
    title: '4. Base Legal para el Tratamiento',
    content: `El tratamiento de tus datos se basa en:

- **Ejecución de contrato:** cuando procesamos datos para prestar los servicios solicitados (Ley 25.326 Argentina, Art. 6 GDPR)
- **Consentimiento:** cuando procesamos datos para marketing u otras finalidades no esenciales. Podés retirar tu consentimiento en cualquier momento
- **Interés legítimo:** para mejorar nuestros servicios, prevenir fraudes y garantizar la seguridad de la plataforma
- **Obligación legal:** cuando el tratamiento es necesario para cumplir con la ley argentina o normativas internacionales aplicables`,
  },
  {
    title: '5. Transferencias Internacionales de Datos',
    content: `TuAgente Store utiliza proveedores de infraestructura y servicios que pueden estar ubicados fuera de Argentina, incluyendo:

- **Neon (PostgreSQL):** almacenamiento de base de datos (EE.UU., con garantías de privacidad adecuadas)
- **Upstash (Redis):** almacenamiento en caché (EE.UU.)
- **OpenAI:** procesamiento de mensajes de demo y respuestas de agentes IA (EE.UU.)
- **Hostinger:** infraestructura de servidor y alojamiento web
- **n8n / Automatización:** orquestación de flujos de trabajo y notificaciones

Todos nuestros proveedores cuentan con políticas de privacidad propias y medidas de seguridad adecuadas. Las transferencias se realizan bajo cláusulas contractuales estándar o mecanismos equivalentes.`,
  },
  {
    title: '6. Tus Derechos',
    content: `De acuerdo con la Ley 25.326 de Protección de Datos Personales (Argentina) y el GDPR (si aplica), tenés derecho a:

- **Acceso:** solicitar una copia de los datos personales que tenemos sobre vos
- **Rectificación:** corregir datos inexactos o incompletos
- **Eliminación:** solicitar la eliminación de tus datos ("derecho al olvido")
- **Portabilidad:** recibir tus datos en un formato estructurado y de uso común
- **Oposición:** oponerte al tratamiento de tus datos para fines de marketing directo
- **Limitación:** solicitar que limitemos el uso de tus datos en determinadas circunstancias
- **Retirar el consentimiento:** en cualquier momento, sin que esto afecte la licitud del tratamiento previo

Para ejercer cualquiera de estos derechos, escribinos a info@tuagentestore.com con el asunto "Derechos LPDP". Respondemos en un máximo de 30 días hábiles.`,
  },
  {
    title: '7. Cookies y Tecnologías de Seguimiento',
    content: `Utilizamos cookies y tecnologías similares para:

- **Sesión de usuario:** mantener tu sesión activa mientras navegás (cookies esenciales, no requieren consentimiento)
- **Análisis:** entender cómo los usuarios interactúan con la plataforma para mejorarla
- **Marketing:** medir la efectividad de campañas publicitarias en Meta (Facebook/Instagram) y Google Ads

Podés controlar las cookies desde la configuración de tu navegador. Desactivar cookies puede afectar algunas funcionalidades de la plataforma.

Las campañas de publicidad paga requieren que hagas clic en el siguiente enlace para ver la Política de Privacidad: tuagentestore.com/privacy (esta página).`,
  },
  {
    title: '8. Retención de Datos',
    content: `Conservamos tus datos durante el tiempo necesario para cumplir con las finalidades descritas en esta política:

- **Datos de cuenta activa:** mientras tu cuenta permanezca activa
- **Datos post-cancelación:** hasta 2 años después de la cancelación del servicio, por razones de auditoría y legales
- **Registros de conversaciones de demo:** 12 meses, luego anonimizados
- **Datos de facturación:** 5 años, según exige la legislación fiscal argentina
- **Cookies de sesión:** hasta que cerrés sesión o el token expire (máximo 30 días)

Podés solicitar la eliminación anticipada de tus datos escribiendo a info@tuagentestore.com.`,
  },
  {
    title: '9. Seguridad de los Datos',
    content: `Implementamos medidas técnicas y organizativas para proteger tus datos:

- Transmisión cifrada mediante HTTPS/TLS en todas las conexiones
- Contraseñas almacenadas con hash bcrypt (no en texto plano)
- Tokens de autenticación httpOnly con expiración automática
- Acceso a la base de datos restringido por IP y credenciales únicas
- Revisiones periódicas de seguridad de la infraestructura

Ningún sistema es 100% seguro. Si detectás una vulnerabilidad, reportala a info@tuagentestore.com.`,
  },
  {
    title: '10. Menores de Edad',
    content: `TuAgente Store es un servicio B2B dirigido exclusivamente a empresas y profesionales. No recopilamos datos de personas menores de 18 años de forma intencionada. Si tomás conocimiento de que un menor nos proporcionó datos personales, contactanos para eliminarlos.`,
  },
  {
    title: '11. Cambios a Esta Política',
    content: `Podemos actualizar esta Política de Privacidad periódicamente. Cuando realicemos cambios materiales, te notificaremos por email o mediante un aviso destacado en la plataforma con al menos 15 días de anticipación.

La fecha de última actualización siempre aparece al pie de esta página.`,
  },
  {
    title: '12. Contacto',
    content: `Para cualquier consulta, solicitud o reclamo relacionado con el tratamiento de tus datos personales:

**TuAgente Store**
Email: info@tuagentestore.com
Web: tuagentestore.com/contact

También podés presentar una reclamación ante la Dirección Nacional de Protección de Datos Personales (DNPDP) de Argentina en: www.argentina.gob.ar/aaip/datospersonales`,
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            En TuAgente Store respetamos tu privacidad y nos comprometemos a proteger tus datos
            personales. Esta política explica qué datos recopilamos, por qué y cómo los utilizamos.
          </p>
          <div className="mt-6 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Última actualización:</span> Mayo 2025 ·{' '}
              <span className="font-semibold text-foreground">Vigente desde:</span> Mayo 2025
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title} className="border-b border-border pb-10 last:border-0">
              <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                {section.content.split('\n').map((line, i) => {
                  if (!line.trim()) return null
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={i} className="font-semibold text-foreground mt-4 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    )
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={i} className="text-muted-foreground ml-4 list-disc leading-relaxed">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: line
                              .slice(2)
                              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>'),
                          }}
                        />
                      </li>
                    )
                  }
                  return (
                    <p
                      key={i}
                      className="text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: line.replace(
                          /\*\*(.+?)\*\*/g,
                          '<strong class="text-foreground">$1</strong>'
                        ),
                      }}
                    />
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-foreground font-semibold mb-2">¿Tenés preguntas sobre tu privacidad?</p>
          <p className="text-sm text-muted-foreground mb-4">
            Escribinos y te respondemos en menos de 48h hábiles.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Contactar al equipo
          </Link>
        </div>

      </div>
    </main>
  )
}
