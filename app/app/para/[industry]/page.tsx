import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const industries: Record<string, {
  name: string
  emoji: string
  headline: string
  subheadline: string
  pain: string[]
  solution: string[]
  agents: { name: string; description: string }[]
  result: { metric: string; label: string }[]
  cta_label: string
}> = {
  inmobiliarias: {
    name: 'Inmobiliarias',
    emoji: '🏠',
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
      { name: 'Agente Captador de Consultas', description: 'Responde WhatsApp 24/7 con info de propiedades, califica y agenda visitas.' },
      { name: 'Agente de Seguimiento', description: 'Reactiva leads que no respondieron. Detecta cuando volvió a buscar.' },
      { name: 'Agente de Coordinación', description: 'Gestiona disponibilidad de asesores y confirma visitas automáticamente.' },
    ],
    result: [
      { metric: '3x', label: 'más visitas coordinadas' },
      { metric: '70%', label: 'menos tiempo calificando' },
      { metric: '24/7', label: 'cobertura de consultas' },
      { metric: '30%', label: 'leads recuperados' },
    ],
    cta_label: 'Ver demo para inmobiliarias',
  },
  clinicas: {
    name: 'Clínicas y Salud',
    emoji: '🏥',
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
      { name: 'Recepcionista IA', description: 'Agenda turnos, responde consultas frecuentes y confirma citas.' },
      { name: 'Agente de Recordatorios', description: 'Envía recordatorios y reduce el no-show hasta un 60%.' },
      { name: 'Agente de Seguimiento Postvisita', description: 'Consulta cómo se siente el paciente y programa turno de control.' },
    ],
    result: [
      { metric: '60%', label: 'menos no-shows' },
      { metric: '100%', label: 'consultas respondidas' },
      { metric: '2h', label: 'ahorradas por día al personal' },
      { metric: '40%', label: 'más turnos ocupados' },
    ],
    cta_label: 'Ver demo para clínicas',
  },
  concesionarias: {
    name: 'Concesionarias',
    emoji: '🚗',
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
      { name: 'Agente de Consultas Técnicas', description: 'Responde specs, precios y disponibilidad al instante.' },
      { name: 'Agente Calificador', description: 'Detecta intención de compra y prioriza leads para el equipo.' },
      { name: 'Agente de Test Drive', description: 'Agenda y confirma test drives. Reduce no-shows con recordatorios.' },
    ],
    result: [
      { metric: '4x', label: 'más test drives agendados' },
      { metric: '80%', label: 'leads calificados sin intervención' },
      { metric: '<2min', label: 'tiempo de respuesta promedio' },
      { metric: '25%', label: 'más cierres el mismo mes' },
    ],
    cta_label: 'Ver demo para concesionarias',
  },
  agencias: {
    name: 'Agencias de Marketing',
    emoji: '📈',
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
      { name: 'Agente Pre-Reunión', description: 'Envía casos de éxito y materiales relevantes antes de cada llamada.' },
      { name: 'Agente de Seguimiento', description: 'Follow-up automático post-propuesta hasta obtener respuesta.' },
      { name: 'Agente Generador de Contenido', description: 'Crea posts, emails y copies para vos y tus clientes.' },
    ],
    result: [
      { metric: '2x', label: 'más propuestas aceptadas' },
      { metric: '5h', label: 'ahorradas por semana en seguimiento' },
      { metric: '3x', label: 'más reuniones calificadas' },
      { metric: '40%', label: 'menos ciclo de venta' },
    ],
    cta_label: 'Ver demo para agencias',
  },
}

type Params = { params: Promise<{ industry: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { industry } = await params
  const data = industries[industry]
  if (!data) return { title: 'Industria no encontrada' }
  return {
    title: `Agentes IA para ${data.name} | TuAgenteStore`,
    description: data.subheadline,
  }
}

export default async function IndustryPage({ params }: Params) {
  const { industry } = await params
  const data = industries[industry]
  if (!data) notFound()

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="text-5xl mb-4">{data.emoji}</div>
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-4">
          Solución para {data.name}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {data.headline}
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">{data.subheadline}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/agents?industry=${industry}`}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
          >
            {data.cta_label}
          </Link>
          <Link
            href="/contact?type=diagnostico"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all"
          >
            Diagnóstico gratis
          </Link>
        </div>
      </section>

      {/* Results */}
      <section className="bg-[#111827] border-y border-gray-700/50 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {data.result.map(({ metric, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-blue-400 mb-1">{metric}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain vs Solution */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold text-red-400 mb-4">Sin agente IA</h2>
            <ul className="space-y-3">
              {data.pain.map((p) => (
                <li key={p} className="flex items-start gap-3 text-gray-400 text-sm">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-bold text-green-400 mb-4">Con TuAgenteStore</h2>
            <ul className="space-y-3">
              {data.solution.map((s) => (
                <li key={s} className="flex items-start gap-3 text-gray-300 text-sm">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section className="bg-[#111827] border-y border-gray-700/50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Agentes incluidos en el paquete para {data.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.agents.map((agent) => (
              <div key={agent.name} className="bg-[#0a0f1e] rounded-xl p-5 border border-gray-700/50">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                  <span className="text-blue-400 text-lg">🤖</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{agent.name}</h3>
                <p className="text-sm text-gray-400">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          ¿Querés verlo funcionando para tu {data.name.toLowerCase().replace(/s$/, '')}?
        </h2>
        <p className="text-gray-400 mb-8">
          Demo en vivo de 15 minutos. Sin pitch. Sin compromiso.
        </p>
        <Link
          href="/contact?type=demo"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all"
        >
          Agendar demo gratis
        </Link>
      </section>
    </main>
  )
}

export function generateStaticParams() {
  return Object.keys(industries).map((industry) => ({ industry }))
}
