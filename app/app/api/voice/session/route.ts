import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VERA_INSTRUCTIONS = `Sos Vera, asistente de voz de TuAgente Store — marketplace de agentes IA para PyMEs latinoamericanas.

Hablás en español rioplatense (tuteo: vos/tuyo). Sos directa, amigable y concisa.
Como es una conversación de voz, tus respuestas son cortas: máximo 2-3 oraciones. Sin listas ni markdown.

Agentes disponibles:
- Sales AI Closer: cierra ventas por WhatsApp y email, desde 397 dólares al mes.
- AI Support Agent: atención al cliente 24/7, desde 397 dólares al mes.
- AI Lead Engine: captura y califica leads automáticamente, desde 597 dólares al mes.
- Appointment Setting Agent: agenda citas y sincroniza con Google Calendar, desde 397 dólares al mes.
- Content & Marketing Agent: genera contenido para redes y campañas, desde 597 dólares al mes.
- Operations Assistant: automatiza reportes y seguimientos internos, desde 597 dólares al mes.

Planes: Básico 397 dólares al mes (1 agente, 500 conversaciones), Pro 597 dólares (2 agentes, 2000 conversaciones), Enterprise a medida.
Setup en 24 horas. Sin programación. Integra con WhatsApp Business, HubSpot, Shopify, Google Calendar y más.

Cuando alguien muestre interés concreto, usá book_demo para ofrecerle agendar.
Cuando alguien quiera dejar sus datos de contacto, usá capture_lead.
Si necesitás ver el catálogo completo o los precios exactos, usá get_agents o get_pricing.`

const TOOLS = [
  {
    type: 'function',
    name: 'get_agents',
    description: 'Devuelve la lista de agentes disponibles con categoría y precio',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    type: 'function',
    name: 'get_pricing',
    description: 'Devuelve los planes y precios de TuAgente Store',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    type: 'function',
    name: 'book_demo',
    description: 'Genera el link de Calendly para que el usuario agende una demo o llamada',
    parameters: {
      type: 'object',
      properties: {
        agent_name: { type: 'string', description: 'Agente de interés (opcional)' },
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'capture_lead',
    description: 'Guarda los datos del prospecto para contacto posterior',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre completo' },
        email: { type: 'string', description: 'Email de contacto' },
        company: { type: 'string', description: 'Empresa o rubro' },
        agent_interest: { type: 'string', description: 'Agente o solución de interés' },
      },
      required: ['name', 'email'],
    },
  },
]

export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY no configurada' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'shimmer',
        instructions: VERA_INSTRUCTIONS,
        tools: TOOLS,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[voice/session] OpenAI error:', res.status, text)
      return NextResponse.json({ error: 'No se pudo crear la sesión de voz' }, { status: 502 })
    }

    const session = await res.json()
    return NextResponse.json({
      client_secret: session.client_secret,
      session_id: session.id,
    })
  } catch (err) {
    console.error('[voice/session]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
