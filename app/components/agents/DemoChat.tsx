'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, MessageSquare, ArrowRight } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

interface Props {
  agentSlug: string
  agentName: string
  maxMessages?: number
  onDemoComplete?: () => void
}

export default function DemoChat({ agentSlug, agentName, maxMessages = 3, onDemoComplete }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messagesUsed, setMessagesUsed] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [starting, setStarting] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const startDemo = async () => {
    setStarting(true)
    setError(null)
    try {
      const res = await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_slug: agentSlug, user_email: email || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'No se pudo iniciar el demo')
        return
      }
      setSessionId(data.session_id)
      setStarted(true)
      setMessages([{
        role: 'assistant',
        content: `¡Hola! Soy ${agentName}. Podés hacerme hasta ${data.max_messages} preguntas para ver cómo puedo ayudarte. ¿Por dónde empezamos?`,
      }])
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setStarting(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/demos/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al enviar el mensaje')
        setLoading(false)
        return
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      setMessagesUsed(data.messages_used)
      if (data.completed) setCompleted(true)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Pre-start screen
  if (!started) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow mx-auto mb-5">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Demo de {agentName}</h2>
          <p className="text-muted-foreground mb-6">
            Hacé hasta <strong className="text-foreground">{maxMessages} preguntas en vivo</strong> para ver exactamente cómo funciona el agente.
          </p>

          <div className="text-left mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Tu email <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              placeholder="hola@tuempresa.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1">Para enviarte el resumen de la demo</p>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={startDemo}
            disabled={starting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Iniciando demo...</>
            ) : (
              <><MessageSquare className="w-5 h-5" /> Iniciar demo gratis</>
            )}
          </button>

          <p className="text-xs text-muted-foreground mt-3">Sin tarjeta de crédito · Sin registro obligatorio</p>
        </div>
      </div>
    )
  }

  // Chat interface
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-foreground text-sm">{agentName}</div>
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            En línea
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {messagesUsed}/{maxMessages} mensajes
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '360px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : 'bg-muted'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-muted-foreground" />
              }
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-muted text-foreground rounded-tl-none'
                : 'bg-primary text-primary-foreground rounded-tr-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Completed state */}
      {completed ? (
        <div className="p-5 border-t border-border bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
          <p className="text-foreground font-medium mb-1 text-sm">
            Demo completada. ¿Te convenció?
          </p>
          <p className="text-muted-foreground text-xs mb-4">
            Reservá ahora y tenés el agente activo en 24 horas.
          </p>
          {onDemoComplete ? (
            <button
              onClick={() => onDemoComplete()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              Reservar activación
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <a
              href="/contact?type=enterprise"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              Reservar activación
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      ) : (
        /* Input */
        <div className="p-3 border-t border-border">
          {error && <p className="text-red-400 text-xs mb-2 px-1">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Preguntale algo a ${agentName}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:shadow-custom transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
