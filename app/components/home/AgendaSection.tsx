'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Users, ArrowRight, Video, Zap } from 'lucide-react'
import type { CalendarEvent } from '@/app/api/calendar/route'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatEventDate(iso: string) {
  const d = new Date(iso)
  return {
    dayName: DAY_NAMES[d.getDay()],
    day: d.getDate(),
    month: MONTH_NAMES[d.getMonth()],
    time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function SpotsBadge({ spots }: { spots?: number }) {
  if (spots === undefined) return null
  const color =
    spots <= 1 ? 'text-red-400 bg-red-500/10 border-red-500/20' :
    spots <= 3 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}>
      <Users className="w-3 h-3" />
      {spots === 1 ? '¡Último lugar!' : `${spots} lugares`}
    </span>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  const { dayName, day, month, time } = formatEventDate(event.dateTime)
  const reserveHref = event.agentSlug
    ? `/agents/${event.agentSlug}#reservar`
    : event.htmlLink ?? '/agents'

  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-custom flex-shrink-0 z-10">
          <Video className="w-4 h-4 text-white" />
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-primary/30 to-transparent mt-2" />
      </div>

      {/* Card */}
      <div className="flex-1 bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-custom transition-all duration-300 group mb-1">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            {/* Date + time row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {dayName} {day} {month}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{time} ARG</span>
              </div>
            </div>

            <h3 className="font-semibold text-foreground text-sm leading-snug mb-2">
              {event.title}
            </h3>
            <SpotsBadge spots={event.spots} />
          </div>

          {/* Reservar button */}
          <Link
            href={reserveHref}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:shadow-glow transition-all hover:scale-105 active:scale-95"
          >
            Reservar
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AgendaSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(data => {
        setEvents(data.events ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left: Timeline agenda */}
          <div className="lg:col-span-3">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                En vivo esta semana
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Próximas demos
                <span className="text-gradient"> en vivo</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Mirá cómo trabaja el agente en tiempo real. Hacé preguntas, pedí casos de tu industria.
              </p>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0" />
                    <div className="flex-1 bg-card border border-border rounded-2xl p-4 h-20" />
                  </div>
                ))}
              </div>
            )}

            {/* Events */}
            {!loading && events.length > 0 && (
              <div>
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && events.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">
                  No hay demos programadas esta semana.
                </p>
                <Link href="/agents" className="text-primary text-sm font-medium hover:underline">
                  Ver todos los agentes →
                </Link>
              </div>
            )}
          </div>

          {/* Right: Booking panel */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-violet-600/10" />
              <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
              <div className="glow-orb w-48 h-48 bg-blue-600/20 -top-12 -right-12" />

              <div className="relative z-10 p-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-5 shadow-custom">
                  <Zap className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  ¿No encontrás un horario?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Reservá una sesión privada con nuestro equipo. Te mostramos el agente exacto para tu industria.
                </p>

                <Link
                  href="/agents"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-glow-lg transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
                >
                  <Calendar className="w-4 h-4" />
                  Explorar y reservar
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="mailto:hola@tuagentestore.com"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-card/80 border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary/40 transition-all"
                >
                  Hablar con el equipo
                </Link>

                <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-foreground">30'</div>
                    <div className="text-xs text-muted-foreground">por sesión</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground">Gratis</div>
                    <div className="text-xs text-muted-foreground">sin cargo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
