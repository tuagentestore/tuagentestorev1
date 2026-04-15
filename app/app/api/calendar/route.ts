import { NextResponse } from 'next/server'

export interface CalendarEvent {
  id: string
  title: string
  dateTime: string
  endDateTime: string
  description?: string
  htmlLink?: string
  spots?: number       // en descripción del evento: [spots:3]
  agentSlug?: string   // en descripción del evento: [agent:sales-ai-closer]
}

function getStaticEvents(): CalendarEvent[] {
  const now = new Date()
  const seed = [
    { daysAhead: 1, hour: 10, title: 'Demo en vivo: Sales AI Closer',   spots: 3, agentSlug: 'sales-ai-closer' },
    { daysAhead: 2, hour: 15, title: 'Demo en vivo: AI Lead Engine',     spots: 2, agentSlug: 'ai-lead-engine' },
    { daysAhead: 3, hour: 11, title: 'Demo en vivo: AI Support Agent',   spots: 4, agentSlug: 'ai-support-agent' },
    { daysAhead: 4, hour: 16, title: 'Demo en vivo: Marketing AI Agent', spots: 1, agentSlug: 'marketing-ai-agent' },
    { daysAhead: 5, hour: 10, title: 'Demo en vivo: E-Commerce Agent',   spots: 5, agentSlug: 'ecommerce-agent' },
  ]
  return seed.map((e, i) => {
    const start = new Date(now)
    start.setDate(now.getDate() + e.daysAhead)
    start.setHours(e.hour, 0, 0, 0)
    const end = new Date(start)
    end.setMinutes(30)
    return { id: `static-${i}`, title: e.title, dateTime: start.toISOString(), endDateTime: end.toISOString(), spots: e.spots, agentSlug: e.agentSlug }
  })
}

function parseMetaFromDescription(description?: string) {
  if (!description) return {}
  const spotsMatch = description.match(/\[spots:(\d+)\]/)
  const agentMatch = description.match(/\[agent:([\w-]+)\]/)
  return {
    spots: spotsMatch ? parseInt(spotsMatch[1]) : undefined,
    agentSlug: agentMatch ? agentMatch[1] : undefined,
  }
}

export async function GET() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID
  const apiKey = process.env.GOOGLE_API_KEY

  const isConfigured =
    calendarId && apiKey &&
    calendarId !== 'COMPLETAR_CON_ID_DEL_CALENDAR' &&
    apiKey !== 'COMPLETAR_CON_API_KEY'

  if (!isConfigured) {
    return NextResponse.json({ events: getStaticEvents(), source: 'static' })
  }

  try {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId!)}/events`
    )
    url.searchParams.set('key', apiKey!)
    url.searchParams.set('timeMin', new Date().toISOString())
    url.searchParams.set('maxResults', '6')
    url.searchParams.set('orderBy', 'startTime')
    url.searchParams.set('singleEvents', 'true')

    const res = await fetch(url.toString(), { next: { revalidate: 300 } })

    if (!res.ok) {
      return NextResponse.json({ events: getStaticEvents(), source: 'static' })
    }

    const data = await res.json()
    const items = (data.items ?? []) as Array<{
      id: string
      summary?: string
      description?: string
      start: { dateTime?: string; date?: string }
      end: { dateTime?: string; date?: string }
      htmlLink?: string
    }>

    // Sin eventos reales → mostrar estáticos
    if (items.length === 0) {
      return NextResponse.json({ events: getStaticEvents(), source: 'static' })
    }

    const events: CalendarEvent[] = items.map(item => ({
      id: item.id,
      title: item.summary ?? 'Demo TuAgente Store',
      dateTime: item.start.dateTime ?? item.start.date ?? '',
      endDateTime: item.end.dateTime ?? item.end.date ?? '',
      htmlLink: item.htmlLink,
      ...parseMetaFromDescription(item.description),
    }))

    return NextResponse.json({ events, source: 'google' })
  } catch {
    return NextResponse.json({ events: getStaticEvents(), source: 'static' })
  }
}
