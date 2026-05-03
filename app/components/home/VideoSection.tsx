'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { trackClick, trackVideoProgress } from '@/lib/analytics'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface Props {
  title: string
  subtitle: string
  videoId?: string
  ctaLabel: string
  ctaHref: string
}

const MILESTONES = [10, 25, 50, 75, 90, 100]

export default function VideoSection({ title, subtitle, videoId, ctaLabel, ctaHref }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null) // YT.Player — no @types/youtube installed
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const trackedRef = useRef<Set<number>>(new Set())
  const [playerReady, setPlayerReady] = useState(false)
  const page = typeof window !== 'undefined' ? window.location.pathname : '/'

  const stopTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const startTracking = useCallback(() => {
    stopTracking()
    if (!videoId) return
    intervalRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p || typeof p.getCurrentTime !== 'function') return
      const duration = p.getDuration()
      if (!duration) return
      const pct = Math.round((p.getCurrentTime() / duration) * 100)
      const milestone = MILESTONES.find(m => pct >= m && !trackedRef.current.has(m))
      if (milestone !== undefined) {
        trackedRef.current.add(milestone)
        trackVideoProgress(videoId, milestone, page)
      }
    }, 4000)
  }, [videoId, page, stopTracking])

  useEffect(() => {
    if (!videoId) return

    const playerId = `yt-player-${videoId}`
    const divEl = document.getElementById(playerId)
    if (!divEl) return

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setPlayerReady(true),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) startTracking()
            else stopTracking()
            if (e.data === window.YT.PlayerState.ENDED) {
              trackVideoProgress(videoId, 100, page)
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
      if (!document.getElementById('yt-api-script')) {
        const s = document.createElement('script')
        s.id = 'yt-api-script'
        s.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(s)
      }
    }

    return () => {
      stopTracking()
      playerRef.current?.destroy?.()
    }
  }, [videoId, startTracking, stopTracking, page])

  // Section visibility tracking
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          import('@/lib/analytics').then(m => m.trackSectionView(title, page))
          obs.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [title, page])

  return (
    <section ref={containerRef} className="py-12 sm:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>

        <div
          className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-custom mb-8"
          style={{ aspectRatio: '16/9' }}
        >
          {videoId ? (
            <div id={`yt-player-${videoId}`} className="absolute inset-0 w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-background">
              <div className="glow-orb w-48 h-48 bg-blue-600/10 top-0 left-1/3" />
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center relative z-10">
                <Play className="w-7 h-7 text-primary ml-1" />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  Video próximamente
                </span>
              </div>
            </div>
          )}
        </div>

        <Link
          href={ctaHref}
          onClick={() => trackClick(ctaLabel, { page, metadata: { section: 'video', video_id: videoId } })}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {ctaLabel}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
