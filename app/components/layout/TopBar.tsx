'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Sun, Moon, MessageCircle, User, X, Sparkles,
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import { useTheme } from './ThemeProvider'

interface NavUser {
  name?: string
  email: string
  role: string
  avatar_url?: string | null
}

function UserMenu({ user, onLogout }: { user: NavUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()
  const showPhoto = !!user.avatar_url && !imgError

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center hover:ring-2 hover:ring-primary/40 transition-all"
      >
        {showPhoto ? (
          <Image
            src={user.avatar_url!}
            alt={user.name ?? user.email}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <span className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {initials}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 py-1">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <User className="w-4 h-4" />
            Mi Panel
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default function TopBar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser | null>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="hidden lg:flex sticky top-0 z-30 h-14 items-center justify-end gap-2 px-6 bg-card/80 backdrop-blur-xl border-b border-border">
      {/* WhatsApp */}
      <a
        href="https://wa.me/5493437527193?text=Hola%2C+me+interesa+TuAgente+Store"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="p-2 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Cambiar tema"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Notifications */}
      {user && <NotificationBell />}

      {/* User / Login */}
      {user ? (
        <UserMenu user={user} onLogout={handleLogout} />
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
        >
          <User className="w-4 h-4" />
          Iniciar sesión
        </Link>
      )}

      {/* CTA */}
      {pathname !== '/wizard' && (
        <Link
          href="/wizard"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap ml-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Elegí tu Agente
        </Link>
      )}
    </header>
  )
}
