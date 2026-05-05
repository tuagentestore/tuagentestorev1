'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, PhoneOff, Loader2, Shield } from 'lucide-react'

type Status = 'idle' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'error'
type Message = { id: string; role: 'vera' | 'user'; text: string }

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  idle:       { label: 'Presioná para hablar con Vera',  color: 'text-slate-400' },
  connecting: { label: 'Conectando...',                  color: 'text-yellow-400' },
  connected:  { label: 'Conectado',                      color: 'text-green-400'  },
  listening:  { label: 'Escuchando — hablá ahora',       color: 'text-green-400'  },
  thinking:   { label: 'Procesando...',                  color: 'text-cyan-400'   },
  speaking:   { label: 'Vera está hablando',             color: 'text-cyan-400'   },
  error:      { label: 'Error de conexión',              color: 'text-red-400'    },
}

const AGENTS_DATA = [
  { name: 'Sales AI Closer',            price_usd: 397, category: 'ventas'      },
  { name: 'AI Support Agent',           price_usd: 397, category: 'soporte'     },
  { name: 'AI Lead Engine',             price_usd: 597, category: 'marketing'   },
  { name: 'Appointment Setting Agent',  price_usd: 397, category: 'agenda'      },
  { name: 'Content & Marketing Agent',  price_usd: 597, category: 'contenido'   },
  { name: 'Operations Assistant',       price_usd: 597, category: 'operaciones' },
]

const PRICING_DATA = [
  { name: 'Básico',     price_usd: 397,         agents: 1,           conversations_per_month: 500   },
  { name: 'Pro',        price_usd: 597,         agents: 2,           conversations_per_month: 2000  },
  { name: 'Enterprise', price_usd: 'a consultar', agents: 'ilimitado', conversations_per_month: 'ilimitado' },
]

export default function VoiceDemoClient() {
  const [status, setStatus] = useState<Status>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [leadCaptured, setLeadCaptured] = useState(false)

  const pcRef        = useRef<RTCPeerConnection | null>(null)
  const dcRef        = useRef<RTCDataChannel | null>(null)
  const audioElRef   = useRef<HTMLAudioElement | null>(null)
  const streamRef    = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const buttonRef    = useRef<HTMLButtonElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    audioElRef.current = new Audio()
    audioElRef.current.autoplay = true
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (buttonRef.current) buttonRef.current.style.transform = 'scale(1)'
    dcRef.current?.close()
    dcRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (audioElRef.current) audioElRef.current.srcObject = null
    setStatus('idle')
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const startAudioViz = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        const scale = 1 + (avg / 255) * 0.22
        if (buttonRef.current) {
          buttonRef.current.style.transform = `scale(${scale})`
        }
        animFrameRef.current = requestAnimationFrame(tick)
      }
      animFrameRef.current = requestAnimationFrame(tick)
    } catch {
      // audio viz optional
    }
  }, [])

  const handleToolCall = useCallback(async (
    callId: string,
    name: string,
    args: Record<string, unknown>,
  ) => {
    let result: Record<string, unknown> = {}

    switch (name) {
      case 'capture_lead':
        try {
          await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...args, source: 'voice-demo' }),
          })
          setLeadCaptured(true)
          result = { success: true, message: 'Datos guardados correctamente' }
        } catch {
          result = { success: false, message: 'No se pudo guardar, intentá más tarde' }
        }
        break

      case 'book_demo':
        result = {
          success: true,
          url: 'https://tuagentestore.com/contact?type=demo',
          message: 'Link de agendamiento generado',
        }
        break

      case 'get_agents':
        result = { agents: AGENTS_DATA }
        break

      case 'get_pricing':
        result = { plans: PRICING_DATA }
        break
    }

    if (!dcRef.current) return
    dcRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: { type: 'function_call_output', call_id: callId, output: JSON.stringify(result) },
    }))
    dcRef.current.send(JSON.stringify({ type: 'response.create' }))
  }, [])

  const startSession = useCallback(async () => {
    try {
      setStatus('connecting')
      setError(null)
      setMessages([])
      setLeadCaptured(false)

      const tokenRes = await fetch('/api/voice/session', { method: 'POST' })
      if (!tokenRes.ok) throw new Error('No se pudo crear la sesión. Intentá de nuevo.')
      const tokenData = await tokenRes.json()
      if (tokenData.error) throw new Error(tokenData.error)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
        throw new Error('Necesitás dar permiso de micrófono para hablar con Vera.')
      })
      streamRef.current = stream
      startAudioViz(stream)

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      pc.ontrack = (e) => {
        if (audioElRef.current) audioElRef.current.srcObject = e.streams[0]
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setError('Conexión perdida')
          setStatus('error')
        }
      }

      stream.getAudioTracks().forEach(track => pc.addTrack(track, stream))

      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc

      dc.onopen = () => setStatus('listening')

      dc.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data as string)
          switch (ev.type) {
            case 'input_audio_buffer.speech_started':
              setStatus('listening')
              break
            case 'response.created':
              setStatus('thinking')
              break
            case 'response.audio.delta':
              setStatus('speaking')
              break
            case 'response.done':
              setStatus('listening')
              break
            case 'conversation.item.input_audio_transcription.completed':
              if (ev.transcript?.trim()) {
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(), role: 'user', text: ev.transcript.trim(),
                }])
              }
              break
            case 'response.audio_transcript.done':
              if (ev.transcript?.trim()) {
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(), role: 'vera', text: ev.transcript.trim(),
                }])
              }
              break
            case 'response.function_call_arguments.done':
              handleToolCall(ev.call_id, ev.name, JSON.parse(ev.arguments || '{}'))
              break
            case 'error':
              setError(ev.error?.message ?? 'Error del modelo de voz')
              setStatus('error')
              break
          }
        } catch { /* ignore parse errors */ }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      if (!offer.sdp) throw new Error('No se pudo crear la oferta SDP')

      const sdpRes = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${tokenData.client_secret.value}`,
            'Content-Type': 'application/sdp',
          },
        },
      )

      if (!sdpRes.ok) throw new Error('No se pudo conectar con el modelo de voz')
      await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStatus('error')
      cleanup()
    }
  }, [cleanup, startAudioViz, handleToolCall])

  const stopSession = useCallback(() => {
    cleanup()
    setMessages([])
    setLeadCaptured(false)
  }, [cleanup])

  const isActive = status !== 'idle' && status !== 'error'
  const isSpeaking = status === 'speaking'
  const { label, color } = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">

      {/* Mic / hangup button */}
      <div className="relative flex items-center justify-center">
        {isActive && (
          <div
            className={`absolute rounded-full pointer-events-none ${
              isSpeaking
                ? 'bg-cyan-400/20 animate-ping'
                : 'bg-green-400/10 animate-pulse'
            }`}
            style={{ width: 164, height: 164 }}
          />
        )}
        <button
          ref={buttonRef}
          onClick={isActive ? stopSession : startSession}
          disabled={status === 'connecting'}
          className={[
            'relative w-28 h-28 rounded-full flex items-center justify-center',
            'transition-colors duration-300',
            isActive
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_40px_rgba(6,182,212,0.45)]'
              : 'bg-[#1e293b] border-2 border-slate-700 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
            status === 'connecting' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
          aria-label={isActive ? 'Terminar llamada' : 'Hablar con Vera'}
        >
          {status === 'connecting'
            ? <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
            : isActive
              ? <PhoneOff className="w-9 h-9 text-white" />
              : <Mic className="w-9 h-9 text-slate-400" />
          }
        </button>
      </div>

      {/* Status text */}
      <div className="text-center space-y-1 min-h-[3rem]">
        <p className={`text-sm font-medium ${color}`}>{label}</p>
        {leadCaptured && (
          <p className="text-xs text-green-400">✓ Datos guardados — te contactamos pronto</p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div className="w-full space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={[
                'max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                msg.role === 'vera'
                  ? 'bg-[#1e293b] text-slate-100 rounded-tl-sm border border-slate-700/60'
                  : 'bg-cyan-500/15 text-cyan-50 rounded-tr-sm border border-cyan-500/25',
              ].join(' ')}>
                {msg.role === 'vera' && (
                  <span className="block text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                    Vera
                  </span>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Disclaimer */}
      {!isActive && (
        <p className="flex items-center gap-1.5 text-xs text-slate-600">
          <Shield className="w-3 h-3 shrink-0" />
          Audio procesado por OpenAI · Requiere permiso de micrófono
        </p>
      )}
    </div>
  )
}
