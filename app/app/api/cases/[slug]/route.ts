import { NextResponse, type NextRequest } from 'next/server'
import { queryOne } from '@/lib/db'

// Static fallback for dev/demo without DB
const STATIC_CASES: Record<string, object> = {
  'inmobiliaria-gestion-leads': {
    id: 'static-1',
    title: 'Inmobiliaria reduce 65% el tiempo de gestión comercial',
    slug: 'inmobiliaria-gestion-leads',
    industry: 'Inmobiliaria',
    stack: ['WhatsApp', 'HubSpot', 'Gmail', 'Google Sheets'],
    setup_time: '24h',
    primary_metric_label: 'Reducción de tiempo de gestión',
    primary_metric_value: '65%',
    summary_bullets: ['Leads calificados automáticamente', 'Respuesta en menos de 2 minutos', 'Equipo comercial con más foco'],
    confidentiality: 'anonymous',
    featured: true,
    is_beta: false,
    problem: 'La inmobiliaria recibía más de 80 consultas por semana desde portales, WhatsApp y su web. El equipo comercial tardaba hasta 6 horas en responder los primeros mensajes, y los leads fríos se perdían sin seguimiento.',
    solution: 'Implementamos el agente Sales AI Closer conectado a WhatsApp Business y HubSpot. El agente responde en menos de 2 minutos, califica intención de compra/alquiler, detecta el perfil del prospecto y lo deriva al asesor correcto con contexto completo.',
    workflow_map: [
      { step: 1, description: 'Consulta entra por WhatsApp o formulario web' },
      { step: 2, description: 'El agente saluda, detecta si busca compra, alquiler o tasación' },
      { step: 3, description: 'Recopila zona, presupuesto y plazo de decisión' },
      { step: 4, description: 'Puntúa el lead y lo registra en HubSpot con etiqueta de prioridad' },
      { step: 5, description: 'Si es caliente, deriva al asesor en menos de 30 segundos' },
    ],
    requirements: ['WhatsApp Business API activa', 'CRM HubSpot (plan gratuito o superior)', 'Gmail para notificaciones al equipo'],
    deliverables: ['Agente configurado y testeado', 'Flujo en n8n con 5 nodos', 'Dashboard de leads en HubSpot', 'Guía de escalado para el equipo'],
    actions_definition: 'Una acción = 1 conversación iniciada (primer mensaje respondido + calificación básica)',
    actions_per_month_example: 'La inmobiliaria maneja ~350 conversaciones nuevas por mes. Con el plan Pro (2.000 acciones/mes) tiene holgura para el crecimiento.',
    risk_controls: 'Si el lead expresa urgencia extrema o mención de presupuesto muy alto (>USD 200K), el agente notifica al gerente comercial de inmediato vía Slack.',
    before_after: [
      { metric: 'Tiempo de primera respuesta', before: '4-6 horas', after: '< 2 minutos', period: 'Semana 1' },
      { metric: 'Leads calificados/semana', before: '12', after: '30+', period: 'Mes 1' },
      { metric: 'Tiempo del equipo en clasificación', before: '8h/semana', after: '< 3h/semana', period: 'Mes 1' },
    ],
    roi_notes: 'Con 65% menos de tiempo en gestión de leads, el equipo cerró 3 operaciones adicionales en el primer mes que antes se perdían por falta de seguimiento rápido.',
    agents: [{ id: 'static-a1', name: 'Sales AI Closer', slug: 'sales-ai-closer', tagline: 'Cierra más ventas, automatiza el seguimiento de leads' }],
  },
  'aseguradora-consultas-automaticas': {
    id: 'static-2',
    title: 'Aseguradora procesa 1.200 consultas por mes sin intervención',
    slug: 'aseguradora-consultas-automaticas',
    industry: 'Seguros',
    stack: ['WhatsApp', 'Gmail', 'Zendesk', 'Google Sheets'],
    setup_time: '24h',
    primary_metric_label: 'Consultas/mes automatizadas',
    primary_metric_value: '1.200+',
    summary_bullets: ['Atención 24/7 sin escalar al equipo', 'Respuestas consistentes y precisas', 'CSAT del 4.8/5 en consultas automáticas'],
    confidentiality: 'anonymous',
    featured: true,
    is_beta: false,
    problem: 'La aseguradora tenía un equipo de 3 personas atendiendo consultas de cobertura, siniestros y renovaciones. El 78% de las preguntas eran repetitivas. Fuera del horario laboral, las consultas quedaban sin respuesta por hasta 14 horas.',
    solution: 'Implementamos el AI Support Agent con una base de conocimiento personalizada con los 40 productos de la aseguradora. El agente resuelve autónomamente el 80% de las consultas y escala inteligentemente los casos complejos a Zendesk.',
    workflow_map: [
      { step: 1, description: 'Consulta llega por WhatsApp o email' },
      { step: 2, description: 'El agente identifica el tipo: cobertura, siniestro, renovación o queja' },
      { step: 3, description: 'Para coberturas y consultas estándar: responde con la información correcta de la póliza del cliente' },
      { step: 4, description: 'Para siniestros: guía el proceso paso a paso y crea ticket en Zendesk' },
      { step: 5, description: 'Para quejas: escala a agente humano con resumen del contexto' },
    ],
    requirements: ['WhatsApp Business API', 'Zendesk (cualquier plan)', 'Acceso a la base de datos de pólizas (export CSV o integración directa)'],
    deliverables: ['Agente con base de conocimiento de 40 productos', 'Integración Zendesk para escalado', 'Dashboard de métricas de atención', 'Protocolo de escalado para el equipo'],
    actions_definition: 'Una acción = 1 conversación resuelta (ya sea autónomamente o derivada a Zendesk con contexto)',
    actions_per_month_example: 'La aseguradora procesa 1.200 conversaciones/mes. El plan Pro (2.000 acciones/mes) cubre el volumen actual con margen para picos estacionales.',
    risk_controls: 'Las consultas sobre siniestros de alto valor (>USD 10K) siempre escalan a agente humano, sin excepción.',
    before_after: [
      { metric: 'Consultas resueltas sin humano', before: '20%', after: '80%', period: 'Mes 1' },
      { metric: 'Tiempo de respuesta promedio', before: '6h', after: '< 5 min', period: 'Semana 1' },
      { metric: 'Horas del equipo en consultas', before: '120h/mes', after: '< 30h/mes', period: 'Mes 2' },
    ],
    roi_notes: 'El equipo recuperó 90 horas mensuales que ahora destina a ventas de pólizas nuevas. En el primer trimestre, eso representó 4 pólizas corporativas adicionales.',
    agents: [{ id: 'static-a2', name: 'AI Support Agent', slug: 'ai-support-agent', tagline: 'Soporte al cliente 24/7 que resuelve, no solo responde' }],
  },
  'legal-clasificacion-documentos': {
    id: 'static-3',
    title: 'Estudio legal automatiza el 80% de clasificación documental',
    slug: 'legal-clasificacion-documentos',
    industry: 'Legal',
    stack: ['Gmail', 'Google Drive', 'Google Sheets', 'OpenAI'],
    setup_time: '48h',
    primary_metric_label: 'Clasificación automatizada',
    primary_metric_value: '80%',
    summary_bullets: ['Documentos clasificados en segundos', 'Equipo enfocado en análisis de alto valor', 'Cero errores en categorización estándar'],
    confidentiality: 'anonymous',
    featured: true,
    is_beta: false,
    problem: 'El estudio recibía diariamente más de 60 documentos por email. Dos paralegales dedicaban 3 horas diarias a clasificar y archivar manualmente en carpetas de Drive. Los errores de clasificación generaban demoras.',
    solution: 'Implementamos el Operations Assistant configurado para reconocer 15 tipos de documentos legales. El agente procesa los adjuntos de Gmail, clasifica con precisión del 95%+, mueve a la carpeta correcta en Drive y actualiza el registro en Sheets.',
    workflow_map: [
      { step: 1, description: 'Email llega a inbox designado con adjunto' },
      { step: 2, description: 'El agente extrae texto del PDF con OCR' },
      { step: 3, description: 'IA clasifica el tipo de documento (contrato, poder, escritura, etc.)' },
      { step: 4, description: 'Identifica cliente/expediente y detecta fecha y partes' },
      { step: 5, description: 'Mueve el archivo a la carpeta correcta en Drive y actualiza Sheets' },
    ],
    requirements: ['Gmail con etiquetas configuradas', 'Google Drive con estructura de carpetas definida', 'Google Sheets para el registro maestro'],
    deliverables: ['Agente configurado con 15 tipos de documentos', 'Integración Gmail + Drive + Sheets', 'Reglas de clasificación documentadas', 'Dashboard de documentos procesados'],
    actions_definition: 'Una acción = 1 documento procesado (clasificado + archivado + registrado)',
    actions_per_month_example: 'El estudio procesa ~900 documentos/mes. Con el plan Pro (2.000 acciones/mes) cubre el volumen con capacidad sobrante.',
    risk_controls: 'Los documentos que el agente clasifica con confianza < 85% van a una carpeta de revisión manual. Ningún documento se archiva definitivamente sin al menos 85% de confianza.',
    before_after: [
      { metric: 'Horas en clasificación/semana', before: '15h (2 paralegales)', after: '< 3h', period: 'Semana 2' },
      { metric: 'Errores de clasificación', before: '~8/mes', after: '0 en categorías estándar', period: 'Mes 1' },
      { metric: 'Tiempo de respuesta a clientes', before: '24-48h para encontrar doc', after: '< 2h', period: 'Mes 1' },
    ],
    roi_notes: 'Los paralegales recuperaron 12 horas semanales que ahora usan en preparación de juicios y revisión de contratos complejos, aumentando el throughput en un 30%.',
    agents: [{ id: 'static-a3', name: 'Operations Assistant', slug: 'operations-assistant', tagline: 'Automatiza tareas internas, reportes y seguimientos' }],
  },
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Try DB first
  const c = await queryOne(
    `SELECT c.*,
       COALESCE(
         (SELECT json_agg(json_build_object('id', a.id, 'name', a.name, 'slug', a.slug, 'tagline', a.tagline))
          FROM agents a WHERE a.id = ANY(c.agent_ids)),
         '[]'
       ) AS agents
     FROM cases c
     WHERE c.slug = $1`,
    [slug]
  ).catch(() => null)

  if (c) return NextResponse.json({ case: c })

  // Fallback to static data
  const staticCase = STATIC_CASES[slug]
  if (staticCase) return NextResponse.json({ case: staticCase })

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
