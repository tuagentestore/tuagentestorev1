'use client'

type TrackOptions = {
  page?: string
  agentId?: string
  metadata?: Record<string, unknown>
}

let _sessionId: string | null = null

function getSessionId(): string {
  if (_sessionId) return _sessionId
  if (typeof window === 'undefined') return 'server'
  const stored = sessionStorage.getItem('_tas_sid')
  if (stored) { _sessionId = stored; return stored }
  const id = crypto.randomUUID()
  sessionStorage.setItem('_tas_sid', id)
  _sessionId = id
  return id
}

export async function track(activityType: string, opts: TrackOptions = {}) {
  if (typeof window === 'undefined') return
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_type: activityType,
        page: opts.page ?? window.location.pathname,
        agent_id: opts.agentId ?? null,
        session_id: getSessionId(),
        metadata: {
          ...opts.metadata,
          referrer: document.referrer || null,
          ua: navigator.userAgent.substring(0, 100),
        },
      }),
      keepalive: true,
    })
  } catch { /* fire-and-forget */ }
}

export function trackClick(label: string, opts: TrackOptions = {}) {
  return track('click', { ...opts, metadata: { label, ...opts.metadata } })
}

export function trackVideoProgress(videoId: string, pct: number, page: string) {
  return track('video_progress', {
    page,
    metadata: { video_id: videoId, percent: pct },
  })
}

export function trackSectionView(section: string, page: string) {
  return track('section_view', { page, metadata: { section } })
}
