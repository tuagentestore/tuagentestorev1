'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, AlertCircle, Info, X } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  action_url?: string
  read: boolean
  created_at: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setNotifications(data.notifications ?? [])
          setUnread(data.unread ?? 0)
        }
      })
      .catch(() => null)
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markRead = async (id?: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { id } : {}),
    })
    fetchNotifications()
  }

  const iconFor = (type: string) => {
    if (type === 'warning') return <AlertCircle className="w-4 h-4 text-yellow-400" />
    if (type === 'error') return <AlertCircle className="w-4 h-4 text-red-400" />
    return <Info className="w-4 h-4 text-blue-400" />
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60_000)
    if (m < 1) return 'Ahora'
    if (m < 60) return `${m}m`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl shadow-custom z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-foreground text-sm">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={() => markRead()} className="text-xs text-primary hover:underline">
                  Marcar todas como leídas
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tenés notificaciones
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{n.title}</div>
                    {n.message && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</div>
                    )}
                    {n.action_url && (
                      <a href={n.action_url} className="text-xs text-primary hover:underline mt-1 inline-block">
                        Ver →
                      </a>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
