import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { chatWithRetry, type ChatMessage } from '@/lib/openai'
import { triggerN8n } from '@/lib/n8n'

const MessageSchema = z.object({
  message: z.string().min(1).max(1000),
})

interface DemoSession {
  id: string
  agent_id: string
  messages_used: number
  max_messages: number
  status: string
  conversation: ChatMessage[]
  demo_prompt: string
  demo_model: string
  agent_name: string
  user_email: string | null
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const body = await req.json()
  const parsed = MessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }

  const session = await queryOne<DemoSession>(
    `SELECT ds.id, ds.agent_id, ds.messages_used, ds.max_messages, ds.status,
            ds.conversation, ds.user_email,
            a.demo_prompt, a.demo_model, a.name AS agent_name
     FROM demo_sessions ds
     JOIN agents a ON a.id = ds.agent_id
     WHERE ds.id = $1`,
    [id]
  )

  if (!session) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
  }
  if (session.status !== 'active') {
    return NextResponse.json({ error: 'Demo finalizada' }, { status: 410 })
  }
  if (session.messages_used >= session.max_messages) {
    return NextResponse.json({ error: 'Límite de mensajes alcanzado' }, { status: 429 })
  }

  const history: ChatMessage[] = Array.isArray(session.conversation) ? session.conversation : []
  const systemMessage: ChatMessage = { role: 'system', content: session.demo_prompt ?? `Eres ${session.agent_name}, un agente IA especializado. Responde de forma concisa y útil.` }
  const userMessage: ChatMessage = { role: 'user', content: parsed.data.message }

  const messages: ChatMessage[] = [systemMessage, ...history.slice(-6), userMessage]

  let result
  try {
    result = await chatWithRetry(messages, session.demo_model ?? 'gpt-4o-mini', 400)
  } catch (err) {
    console.error('[Demo message] OpenAI error:', err)
    return NextResponse.json(
      { error: 'El agente no está disponible en este momento. Intentá en unos segundos.' },
      { status: 503 }
    )
  }

  const assistantMessage: ChatMessage = { role: 'assistant', content: result.content }
  const newConversation = [...history, userMessage, assistantMessage]
  const newCount = session.messages_used + 1
  const isCompleted = newCount >= session.max_messages

  await query(
    `UPDATE demo_sessions
     SET messages_used = $1,
         conversation = $2::jsonb,
         status = $3,
         tokens_used = COALESCE(tokens_used, 0) + $4,
         updated_at = NOW()
     WHERE id = $5`,
    [
      newCount,
      JSON.stringify(newConversation),
      isCompleted ? 'completed' : 'active',
      result.tokens.total,
      id,
    ]
  )

  if (isCompleted) {
    triggerN8n('demo-completed', {
      session_id: id,
      agent_id: session.agent_id,
      agent_name: session.agent_name,
      messages: newCount,
      user_email: session.user_email,
      converted: false,
    })
  }

  return NextResponse.json({
    response: result.content,
    messages_used: newCount,
    max_messages: session.max_messages,
    completed: isCompleted,
  })
}
