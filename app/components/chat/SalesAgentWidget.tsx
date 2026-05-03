'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { X, Send, Loader2, MessageSquare, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'vera_chat_history'
const MAX_USER_MESSAGES = 10
const WA_LINK = 'https://wa.me/5493437527193?' + 'text=' + encodeURIComponent('Hola, quiero hablar con el equipo de TuAgente Store')
const DEMO_LINK = '/contact?type=demo'

const HIDDEN_PATHS = ['/dashboard', '/admin', '/login', '/register', '/onboarding']

const WELCOME: Message = {
  role: 'assistant',
  content: '¡Hola! Soy Vera, asistente de TuAgente Store. ¿En qué te puedo ayudar? Puedo orientarte sobre agentes IA para tu negocio, precios o reservar una demo gratuita.',
}

export default function SalesAgentWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Message[]
        if (parsed.length > 0) setMessages(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Hide on internal/auth pages
  const hidden = HIDDEN_PATHS.some(p => pathname.startsWith(p))
  if (hidden) return null

  const userMsgCount = messages.filter(m => m.role === 'user').length
  const limitReached = userMsgCount >= MAX_USER_MESSAGES

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading || limitReached) return

    const updated: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(updated)
    setInput('')
    setLoading(true)

    // Agregar placeholder de respuesta que se irá completando con el stream
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat/sales-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })

      if (!res.ok || !res.body) {
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: 'Ups, hubo un problema. Escribinos directamente por WhatsApp.' }
          return copy
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          try {
            const { chunk } = JSON.parse(payload) as { chunk: string }
            setMessages(prev => {
              const copy = [...prev]
              copy[copy.length - 1] = {
                role: 'assistant',
                content: copy[copy.length - 1].content + chunk,
              }
              return copy
            })
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: 'Ups, hubo un problema. Escribinos directamente por WhatsApp.' }
        return copy
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">Vera</div>
                <div className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse inline-block" />
                  Asistente de TuAgente Store
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0 [&>ul]:pl-4 [&>ol]:pl-4"
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-3">
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                </div>
              </div>
            )}

            {limitReached && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-2.5">
                  ¿Querés hablar con una persona de nuestro equipo?
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2 bg-[#25D366] text-white rounded-lg text-xs font-semibold text-center hover:opacity-90 transition-opacity"
                  >
                    Escribir por WhatsApp
                  </a>
                  <a
                    href={DEMO_LINK}
                    className="block py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold text-center hover:opacity-90 transition-opacity"
                  >
                    Agendar Demo Gratuita
                  </a>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!limitReached && (
            <div className="p-3 border-t border-border shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Escribí tu consulta..."
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Enviar"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar Vera' : 'Hablar con Vera'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-glow transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </>
  )
}
