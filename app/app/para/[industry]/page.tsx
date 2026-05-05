import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Home, Heart, Car, TrendingUp, ShoppingCart, Bot, ArrowRight,
  MessageSquare, Megaphone, Users, Settings, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import LayerNav from '@/components/layout/LayerNav'

interface IndustryData {
  name: string
  Icon: LucideIcon
  headline: string
  subheadline: string
  pain: string[]
  solution: string[]
  agents: { name: string; description: string; slug?: string }[]
  result: { metric: string; label: string }[]
  cta_label: string
  problema?: string  // slug para /empezar?problema=
}

const industries: Record<string, IndustryData> = {
  // ── Industrias verticales ──────────────────────────────────────────
  inmobiliarias: {
    name: 'Inmobiliarias',
    Icon: Home,
    headline: 'Tu agente IA captura y califica leads de propiedades las 24 horas',
    subheadline: 'Sin perder consultas de fin de semana. Sin responder el mismo WhatsApp 50 veces.',
    pain: [
      'Leads que preguntan fuera de horario y no obtienen respuesta',
      'Asesores perdiendo tiempo calificando leads que no compran',
      'Propiedades que no se muestran porque no hay quién coordine las visitas',
      'Leads fríos que nunca se reactivan',
    ],
    solution: [
      'El agente responde en segundos: precio, ubicación, ambientes, financiación',
      'Clasifica automáticamente: listo para visita / todavía explorando / no aplica',
      'Agenda visitas directo al calendario del asesor',
      'Reactiva leads dormidos con seguimiento automático',
    ],
    agents: [
      { name: 'Agente Captador de Consultas', slug: 'ai-lead-engine', description: 'Responde WhatsApp 24/7 con info de propiedades, califica y agenda visitas.' },
      { name: 'Agente de Seguimiento',        slug: 'sales-ai-closer', description: 'Reactiva leads que no respondieron. Detecta cuando volvió a buscar.' },
      { name: 'Agente de Coordinación',       slug: 'appointment-setting-agent', description: 'Gestiona disponibilidad de asesores y confirma visitas automáticamente.' },
    ],
    result: [
      { metric: '3x', label: 'más visitas coordinadas' },
      { metric: '70%', label: 'menos tiempo calificando' },
      { metric: '24/7', label: 'cobertura de consultas' },
      { metric: '30%', label: 'leads recuperados' },
    ],
    cta_label: 'Empezar para inmobiliarias',
    problema: 'leads',
  },
  clinicas: {
    name: 'Clínicas y Salud',
    Icon: Heart,
    headline: 'Más pacientes agendados, menos llamadas perdidas',
    subheadline: 'Tu recepción virtual que nunca descansa ni comete errores.',
    pain: [
      'Llamadas sin respuesta fuera de horario',
      'Pacientes que no confirman y dejan baches en la agenda',
      'Tiempo del personal respondiendo preguntas básicas',
      'Turnos cancelados sin aviso',
    ],
    solution: [
      'El agente agenda, modifica y cancela turnos por WhatsApp',
      'Recordatorios automáticos 24h y 2h antes',
      'Responde: coberturas, especialidades, precios, ubicación',
      'Notifica al médico solo cuando hay algo urgente',
    ],
    agents: [
      { name: 'Recepcionista IA',              slug: 'ai-support-agent',            description: 'Agenda turnos, responde consultas frecuentes y confirma citas.' },
      { name: 'Agente de Recordatorios',        slug: 'appointment-setting-agent',   description: 'Envía recordatorios y reduce el no-show hasta un 60%.' },
      { name: 'Agente de Seguimiento Postvisita', slug: 'sales-ai-closer',           description: 'Consulta cómo se siente el paciente y programa turno de control.' },
    ],
    result: [
      { metric: '60%', label: 'menos no-shows' },
      { metric: '100%', label: 'consultas respondidas' },
      { metric: '2h',   label: 'ahorradas por día al personal' },
      { metric: '40%', label: 'más turnos ocupados' },
    ],
    cta_label: 'Empezar para clínicas',
    problema: 'soporte',
  },
  concesionarias: {
    name: 'Concesionarias',
    Icon: Car,
    headline: 'Más test drives coordinados, menos leads que se enfrían',
    subheadline: 'El agente que pre-califica, responde consultas técnicas y agenda el test drive.',
    pain: [
      'Leads que preguntan por WhatsApp y nadie responde rápido',
      'Vendedores perdiendo tiempo con leads no calificados',
      'Test drives que no se concretan por falta de seguimiento',
      'Consultas de precios y disponibilidad que se responden manualmente',
    ],
    solution: [
      'Responde en segundos: modelo, precio, financiación, colores disponibles',
      'Califica: ¿tiene auto para entregar? ¿presupuesto? ¿cuándo compra?',
      'Agenda el test drive directo al vendedor correcto',
      'Reactiva leads fríos con oferta personalizada',
    ],
    agents: [
      { name: 'Agente de Consultas Técnicas', slug: 'ai-support-agent',    description: 'Responde specs, precios y disponibilidad al instante.' },
      { name: 'Agente Calificador',           slug: 'ai-lead-engine',       description: 'Detecta intención de compra y prioriza leads para el equipo.' },
      { name: 'Agente de Test Drive',         slug: 'appointment-setting-agent', description: 'Agenda y confirma test drives. Reduce no-shows con recordatorios.' },
    ],
    result: [
      { metric: '4x',    label: 'más test drives agendados' },
      { metric: '80%',   label: 'leads calificados sin intervención' },
      { metric: '<2min', label: 'tiempo de respuesta promedio' },
      { metric: '25%',   label: 'más cierres el mismo mes' },
    ],
    cta_label: 'Empezar para concesionarias',
    problema: 'ventas',
  },
  agencias: {
    name: 'Agencias de Marketing',
    Icon: TrendingUp,
    headline: 'Más propuestas cerradas, menos tiempo en seguimiento manual',
    subheadline: 'El agente que pre-califica prospectos y convierte tu pipeline en clientes reales.',
    pain: [
      'Prospectos que piden propuesta y nunca responden',
      'Seguimiento manual que consume horas de los account managers',
      'Dificultad para escalar sin contratar más comerciales',
      'Leads que no entienden bien qué hacés antes de la reunión',
    ],
    solution: [
      'El agente educa al prospecto antes de la reunión: casos, resultados, proceso',
      'Pre-califica: presupuesto, objetivo, urgencia, decisor',
      'Hace seguimiento automático post-propuesta',
      'Genera contenido de ventas personalizado por industria',
    ],
    agents: [
      { name: 'Agente Pre-Reunión',            slug: 'sales-ai-closer',      description: 'Envía casos de éxito y materiales relevantes antes de cada llamada.' },
      { name: 'Agente de Seguimiento',          slug: 'ai-lead-engine',       description: 'Follow-up automático post-propuesta hasta obtener respuesta.' },
      { name: 'Agente Generador de Contenido', slug: 'marketing-ai-agent',   description: 'Crea posts, emails y copies para vos y tus clientes.' },
    ],
    result: [
      { metric: '2x', label: 'más propuestas aceptadas' },
      { metric: '5h', label: 'ahorradas por semana en seguimiento' },
      { metric: '3x', label: 'más reuniones calificadas' },
      { metric: '40%', label: 'menos ciclo de venta' },
    ],
    cta_label: 'Empezar para agencias',
    problema: 'marketing',
  },
  ecommerce: {
    name: 'E-Commerce',
    Icon: ShoppingCart,
    headline: 'Recuperá carritos abandonados y aumentá el ticket promedio automáticamente',
    subheadline: 'El agente que vende mientras dormís: recuperación, cross-sell y retención en piloto automático.',
    pain: [
      'Carritos abandonados sin seguimiento automático',
      'Sin estrategia de cross-sell post-compra',
      'Consultas de estado de pedido saturando al equipo',
      'Clientes que compran una vez y no vuelven',
    ],
    solution: [
      'Recupera carritos con mensajes personalizados en WhatsApp e email',
      'Sugiere productos complementarios post-compra',
      'Responde automáticamente: estado del pedido, cambios y devoluciones',
      'Activa campañas de recompra según comportamiento del cliente',
    ],
    agents: [
      { name: 'Agente de Recuperación',  slug: 'ecommerce-agent',     description: 'Recupera carritos abandonados y convierte browsers en compradores.' },
      { name: 'Agente Post-Venta',        slug: 'ai-support-agent',    description: 'Cross-sell, upsell y seguimiento de satisfacción automático.' },
      { name: 'Agente de Retención',      slug: 'marketing-ai-agent',  description: 'Reactiva clientes inactivos con ofertas personalizadas.' },
    ],
    result: [
      { metric: '25%', label: 'carritos recuperados' },
      { metric: '2x',  label: 'ticket promedio con cross-sell' },
      { metric: '80%', label: 'consultas resueltas sin intervención' },
      { metric: '40%', label: 'más recompras en 90 días' },
    ],
    cta_label: 'Empezar para e-commerce',
    problema: 'ecommerce',
  },

  // ── Slugs de problema (L2 por desafío) ────────────────────────────
  ventas: {
    name: 'Automatización de Ventas',
    Icon: TrendingUp,
    headline: 'Cerrá más ventas sin contratar más vendedores',
    subheadline: 'Un agente IA que trabaja 24/7 para llenar tu pipeline, calificar prospectos y hacer seguimiento automático.',
    pain: [
      'El equipo pierde tiempo respondiendo siempre las mismas preguntas',
      'Prospectos que se enfrían porque nadie los siguió a tiempo',
      'Vendedores ocupados en tareas administrativas en vez de vender',
      'Dificultad para escalar las ventas sin contratar más personas',
    ],
    solution: [
      'Califica leads automáticamente según tu criterio ideal de cliente',
      'Follow-up infinito hasta que el prospecto responda o descarte',
      'El equipo humano sólo recibe leads listos para cerrar',
      'Escala de 100 a 10.000 conversaciones sin aumentar el equipo',
    ],
    agents: [
      { name: 'Sales AI Closer',    slug: 'sales-ai-closer',    description: 'Cierra ventas consultivas con conversaciones inteligentes por WhatsApp o email.' },
      { name: 'AI Lead Engine',     slug: 'ai-lead-engine',     description: 'Captura, califica y prioriza leads según tu perfil de cliente ideal.' },
      { name: 'Appointment Setting', slug: 'appointment-setting-agent', description: 'Llena la agenda de tu equipo comercial con reuniones calificadas.' },
    ],
    result: [
      { metric: '3x',  label: 'más leads calificados' },
      { metric: '40%', label: 'menos ciclo de venta' },
      { metric: '24/7', label: 'follow-up automático' },
      { metric: '2x',  label: 'revenue sin más equipo' },
    ],
    cta_label: 'Quiero automatizar mis ventas',
    problema: 'ventas',
  },
  soporte: {
    name: 'Soporte al Cliente',
    Icon: MessageSquare,
    headline: 'Respondé el 100% de las consultas sin ampliar el equipo',
    subheadline: 'Tu agente de soporte disponible 24/7 que resuelve tickets, escala cuando es necesario y aprende de cada conversación.',
    pain: [
      'Consultas sin respuesta fuera del horario de oficina',
      'El equipo saturado respondiendo las mismas preguntas una y otra vez',
      'Clientes frustrados por tiempos de espera largos',
      'Soporte que no escala sin contratar más agentes humanos',
    ],
    solution: [
      'Responde al instante: FAQs, estado de pedidos, políticas, precios',
      'Escala a humano sólo cuando hay un caso que realmente lo requiere',
      'Aprende de tu base de conocimiento y se actualiza solo',
      'Disponible en WhatsApp, email, chat web y Telegram',
    ],
    agents: [
      { name: 'AI Support Agent', slug: 'ai-support-agent', description: 'Resuelve el 80% de los tickets sin intervención humana.' },
      { name: 'Sales AI Closer',  slug: 'sales-ai-closer',  description: 'Convierte consultas de soporte en oportunidades de venta.' },
      { name: 'AI Lead Engine',   slug: 'ai-lead-engine',   description: 'Califica prospectos que llegan por canales de soporte.' },
    ],
    result: [
      { metric: '80%', label: 'tickets resueltos automáticamente' },
      { metric: '24/7', label: 'cobertura completa' },
      { metric: '3min', label: 'tiempo promedio de respuesta' },
      { metric: '60%', label: 'reducción del costo de soporte' },
    ],
    cta_label: 'Quiero soporte 24/7',
    problema: 'soporte',
  },
  marketing: {
    name: 'Marketing con IA',
    Icon: Megaphone,
    headline: 'Creá contenido y captá leads en piloto automático',
    subheadline: 'Un agente que genera posts, emails y copies; distribuye en todos los canales; y mide qué convierte.',
    pain: [
      'El equipo pierde semanas en crear contenido que nadie ve',
      'Sin sistema consistente de publicación y seguimiento',
      'Ideas de contenido que se quedan en el cajón',
      'ROI de marketing difícil de medir y optimizar',
    ],
    solution: [
      'Genera contenido adaptado a tu voz y tu audiencia',
      'Publica en LinkedIn, Instagram, TikTok y email de forma coordinada',
      'Convierte cada pieza de contenido en leads con CTAs inteligentes',
      'Reportes automáticos de qué funciona y qué no',
    ],
    agents: [
      { name: 'Marketing AI Agent', slug: 'marketing-ai-agent', description: 'Crea y distribuye contenido optimizado para tu audiencia.' },
      { name: 'AI Lead Engine',     slug: 'ai-lead-engine',     description: 'Convierte tu audiencia en leads calificados.' },
      { name: 'Sales AI Closer',    slug: 'sales-ai-closer',    description: 'Cierra a los leads que vienen del contenido.' },
    ],
    result: [
      { metric: '10x', label: 'más piezas de contenido' },
      { metric: '3x',  label: 'más engagement orgánico' },
      { metric: '5h',  label: 'ahorradas por semana' },
      { metric: '2x',  label: 'más leads desde contenido' },
    ],
    cta_label: 'Quiero marketing automatizado',
    problema: 'marketing',
  },
  leads: {
    name: 'Captación de Leads',
    Icon: Users,
    headline: 'Llenate de leads calificados sin esfuerzo manual',
    subheadline: 'Un sistema que atrae, captura y califica prospectos automáticamente, 24 horas al día.',
    pain: [
      'El pipeline siempre está vacío o lleno de leads no calificados',
      'Gasto en ads sin sistema que convierta el tráfico',
      'Formularios que nadie completa porque el follow-up tarda',
      'Equipo de ventas quejándose de la calidad de los leads',
    ],
    solution: [
      'Landing pages y formularios que convierten hasta 3x más',
      'Respuesta inmediata al lead: en menos de 60 segundos',
      'Calificación automática: ¿tiene presupuesto? ¿es decisor? ¿cuándo compra?',
      'Pipeline siempre lleno de oportunidades listas para cerrar',
    ],
    agents: [
      { name: 'AI Lead Engine',     slug: 'ai-lead-engine',     description: 'Captura y califica leads automáticamente desde todos los canales.' },
      { name: 'Sales AI Closer',    slug: 'sales-ai-closer',    description: 'Convierte prospectos calificados en clientes pagantes.' },
      { name: 'Appointment Setting', slug: 'appointment-setting-agent', description: 'Agenda reuniones con leads calificados en el calendario del equipo.' },
    ],
    result: [
      { metric: '5x',  label: 'más leads calificados' },
      { metric: '60s', label: 'respuesta al lead' },
      { metric: '70%', label: 'menos leads descartados' },
      { metric: '3x',  label: 'más reuniones agendadas' },
    ],
    cta_label: 'Quiero más leads',
    problema: 'leads',
  },
  operaciones: {
    name: 'Automatización de Operaciones',
    Icon: Settings,
    headline: 'Liberá horas de trabajo eliminando tareas repetitivas',
    subheadline: 'Un agente que toma procesos manuales y los ejecuta automáticamente, sin errores y sin descanso.',
    pain: [
      'El equipo pierde horas en tareas repetitivas que no generan valor',
      'Procesos manuales propensos a errores y demoras',
      'Información dispersa en WhatsApp, email y hojas de cálculo',
      'Dificultad para escalar sin más personas',
    ],
    solution: [
      'Automatiza flujos completos: de la consulta al cierre sin intervención',
      'Integra WhatsApp, CRM, email, calendario y base de datos',
      'Reportes automáticos para tomar decisiones en tiempo real',
      'Escala operaciones sin contratar más personal',
    ],
    agents: [
      { name: 'Appointment Setting', slug: 'appointment-setting-agent', description: 'Gestiona agendas, recordatorios y coordinación automáticamente.' },
      { name: 'AI Support Agent',    slug: 'ai-support-agent',    description: 'Resuelve consultas operativas sin intervención del equipo.' },
      { name: 'E-Commerce Agent',    slug: 'ecommerce-agent',     description: 'Automatiza operaciones de venta y post-venta online.' },
    ],
    result: [
      { metric: '15h', label: 'ahorradas por semana' },
      { metric: '95%', label: 'reducción de errores manuales' },
      { metric: '3x',  label: 'velocidad de operación' },
      { metric: '0',   label: 'tareas repetitivas para el equipo' },
    ],
    cta_label: 'Quiero automatizar operaciones',
    problema: 'operaciones',
  },
}

type Params = { params: Promise<{ industry: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { industry } = await params
  const data = industries[industry]
  if (!data) return { title: 'No encontrado' }
  return {
    title: `Agentes IA para ${data.name}`,
    description: data.subheadline,
    openGraph: { title: data.headline, description: data.subheadline },
  }
}

export default async function IndustryPage({ params }: Params) {
  const { industry } = await params
  const data = industries[industry]
  if (!data) notFound()

  const { Icon } = data
  const problema = data.problema ?? industry

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Breadcrumb L2 ── */}
      <LayerNav items={[{ label: data.name }]} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="glow-orb w-[500px] h-[500px] bg-blue-600/6 -top-40 -right-40" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Solución IA para {data.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{data.headline}</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">{data.subheadline}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/empezar?problema=${problema}`}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow transition-all hover:scale-[1.02]"
            >
              <Zap className="w-5 h-5" />
              {data.cta_label}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/agents"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-base hover:border-primary/30 transition-all"
            >
              Ver todos los agentes
            </Link>
          </div>
        </div>
      </section>

      {/* ── Métricas ─────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {data.result.map(({ metric, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-primary mb-1">{metric}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Antes / Después ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">
          Así se ve tu operación HOY vs. con el agente IA
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-400 font-bold text-sm uppercase tracking-wide">Sin agente IA</span>
            </div>
            <ul className="space-y-3">
              {data.pain.map((p) => (
                <li key={p} className="flex items-start gap-3 text-muted-foreground text-sm">
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-400 font-bold text-sm uppercase tracking-wide">Con TuAgenteStore</span>
            </div>
            <ul className="space-y-3">
              {data.solution.map((s) => (
                <li key={s} className="flex items-start gap-3 text-foreground text-sm">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Agentes sugeridos ─────────────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Agentes recomendados para {data.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.agents.map((agent) => (
              <div key={agent.name} className="bg-card rounded-2xl p-5 border border-border hover:border-primary/40 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{agent.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                {agent.slug && (
                  <Link href={`/agents/${agent.slug}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver demo <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/8 to-violet-600/5 pointer-events-none" />
        <div className="glow-orb w-80 h-80 bg-blue-600/10 -top-20 -left-20" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">
            ¿Querés verlo en acción para tu negocio?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Completá el formulario en 2 minutos y te mostramos un demo personalizado sin compromiso.
          </p>
          <Link
            href={`/empezar?problema=${problema}`}
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-glow transition-all hover:scale-[1.02]"
          >
            {data.cta_label}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Sin tarjeta · Sin compromiso · Respondemos en menos de 2 horas
          </p>
        </div>
      </section>

    </main>
  )
}

export function generateStaticParams() {
  return Object.keys(industries).map((industry) => ({ industry }))
}
