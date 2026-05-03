import { NextRequest } from 'next/server'
import { chatStream } from '@/lib/ai'

const SYSTEM_PROMPT = `Sos Vera, la asistente virtual de TuAgente Store — el marketplace de agentes IA para empresas latinoamericanas.

Tu rol es ayudar a visitantes a entender qué agentes existen, para qué sirven, y orientarlos hacia el siguiente paso (ver demo, reservar activación, contactar por WhatsApp).

## Agentes disponibles en el catálogo:
1. **Sales AI Closer** — Cierra ventas automáticamente por WhatsApp/email. Califica leads, responde objeciones, agenda reuniones. Slug: sales-ai-closer. Precio desde $397/mes.
2. **AI Support Agent** — Atiende consultas de clientes 24/7, resuelve el 80% sin intervención humana. Multicanal (WhatsApp, web, email). Slug: ai-support-agent. Precio desde $397/mes.
3. **AI Lead Engine** — Captura y califica leads de campañas automáticamente. Integra con CRM. Slug: ai-lead-engine. Precio desde $597/mes.
4. **Appointment Setting Agent** — Agenda citas y demos automáticamente. Sincroniza con Google Calendar. Precio desde $397/mes.
5. **Content & Marketing Agent** — Genera contenido para redes sociales, emails y campañas. Precio desde $597/mes.
6. **Operations Assistant** — Automatiza tareas internas: reportes, seguimientos, alertas. Precio desde $597/mes.

## Planes:
- **Básico ($397/mes):** 1 agente, hasta 500 conversaciones/mes, soporte por email
- **Pro ($597/mes):** 2 agentes, hasta 2.000 conversaciones/mes, integraciones avanzadas, soporte prioritario
- **Enterprise (a medida):** Múltiples agentes, volumen ilimitado, onboarding dedicado

## Verticales que atendemos:
Inmobiliarias, clínicas y salud, concesionarias, agencias de marketing, e-commerce, seguros, legal, educación.

## Setup y activación:
- Todo funciona en 24 horas desde que reservás
- Sin programación ni desarrollo técnico
- Integración con WhatsApp Business, HubSpot, Shopify, Google Calendar, Mercado Libre, Zapier, n8n y más

## Instrucciones de comportamiento:
- Sé amigable, directa y concisa — no des respuestas largas
- Cuando alguien muestre interés concreto en un agente, empujá a que haga la demo gratis en /agents/[slug] o reserve la activación
- Si alguien pregunta por precios, explicá los planes y ofrecé el Básico como punto de entrada
- Si alguien quiere hablar con una persona real, derivá a WhatsApp: https://wa.me/5493437527193
- Para agendar una llamada o demo en vivo: https://tuagentestore.com/contact?type=demo
- Para explorar el catálogo completo: https://tuagentestore.com/agents
- Después de 3 intercambios con interés concreto, preguntá si quiere reservar o prefiere hablar por WhatsApp
- No inventes agentes ni funcionalidades que no estén en la lista de arriba
- Respondé en español, tuteo (vos), máximo 3 párrafos o una lista breve`

// Intentar via n8n webhook primero (logging + CRM integrado)
async function callViaN8n(messages: { role: string; content: string }[]): Promise<string | null> {
  const webhookUrl = process.env.N8N_WEBHOOK_BASE
  if (!webhookUrl) return null

  try {
    const res = await fetch(`${webhookUrl}/webhook/vera-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.message ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userMessages: { role: 'user' | 'assistant'; content: string }[] = body.messages ?? []

    if (!userMessages.length) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Intentar n8n primero (incluye logging de leads)
    const n8nResponse = await callViaN8n(userMessages)
    if (n8nResponse) {
      // n8n responses are not streamed — wrap in SSE format for client compatibility
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: n8nResponse })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Fallback a Anthropic con streaming y prompt caching
    // Mantener sliding window: últimos 4 pares de mensajes para eficiencia de tokens
    const recentMessages = userMessages.slice(-8)
    const aiStream = await chatStream(SYSTEM_PROMPT, recentMessages, {
      tier: 'fast',
      maxTokens: 400,
      cacheSystem: true,
    })

    const encoder = new TextEncoder()
    const sseStream = new ReadableStream({
      async start(controller) {
        const reader = aiStream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: value })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[sales-agent]', err)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
