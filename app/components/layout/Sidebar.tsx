'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Bot, LayoutGrid, User, Shield, Menu, X, Sparkles, Building2,
  Sun, Moon, MessageCircle, DollarSign, Package, GitCompare,
  Workflow,
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import { useTheme } from './ThemeProvider'

interface NavUser {
  name?: string
  email: string
  role: string
}

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { name: 'Inicio', href: '/', icon: LayoutGrid },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { name: 'Agentes IA',       href: '/agents',                icon: Bot },
      { name: 'Marketplace',      href: '/marketplace',           icon: Package },
      { name: 'Catálogo n8n',     href: '/marketplace/catalogo',  icon: Workflow },
      { name: 'Comparar agentes', href: '/marketplace/comparar',  icon: GitCompare },
    ],
  },
  {
    label: 'Plataforma',
    items: [
      { name: 'Casos de éxito',   href: '/casos',    icon: Building2 },
      { name: 'Elegí tu Agente',  href: '/wizard',   icon: Sparkles },
      { name: 'Precios',          href: '/pricing',  icon: DollarSign },
      { name: 'Contacto',         href: '/contact',  icon: MessageCircle },
    ],
  },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  if (href === '/marketplace') return pathname === '/marketplace'
  return pathname.startsWith(href)
}

function SidebarContent({
  user,
  onLogout,
  onClose,
}: {
  user: NavUser | null
  onLogout: () => void
  onClose?: () => void
}) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const initials = user ? (user.name ?? user.email).slice(0, 2).toUpperCase() : null

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-border shrink-0">
        <Link href="/" onClick={onClose} className="flex items-center group">
          <div className="overflow-hidden dark:hidden w-[120px] h-[40px]">
            <Image
              src="/logo.png"
              alt="TuAgente Store"
              width={200}
              height={133}
              className="w-[120px] transition-opacity group-hover:opacity-80"
              style={{ marginTop: -8, marginLeft: -8, filter: 'brightness(0.65) contrast(1.25)' }}
              priority
            />
          </div>
          <div className="overflow-hidden hidden dark:block w-[120px] h-[40px]">
            <Image
              src="/logo-dark.png"
              alt="TuAgente Store"
              width={200}
              height={133}
              className="w-[120px] transition-opacity group-hover:opacity-80"
              style={{ marginTop: -8, marginLeft: -8 }}
              priority
            />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label ?? '__main'}>
            {section.label && (
              <p className="px-2 mb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, pathname)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Admin */}
        {user?.role === 'admin' && (
          <div>
            <p className="px-2 mb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            <Link
              href="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith('/admin')
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              Panel Admin
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-4 space-y-3 shrink-0">
        {/* CTA */}
        <Link
          href="/wizard"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Elegí tu Agente
        </Link>

        {/* User row */}
        <div className="flex items-center gap-1.5">
          {/* Theme */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* WhatsApp */}
          <a
            href="https://wa.me/5493437527193?text=Hola%2C+me+interesa+TuAgente+Store"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors shrink-0"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {user && <NotificationBell />}

          {/* User info */}
          <div className="ml-auto">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-foreground truncate max-w-[70px] leading-tight">
                    {user.name ?? user.email.split('@')[0]}
                  </span>
                  <button
                    onClick={onLogout}
                    className="text-[11px] text-red-400 hover:text-red-300 text-left leading-tight transition-colors"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col z-40 bg-card border-r border-border">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile top bar (< lg) ─────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-card/90 backdrop-blur-xl border-b border-border">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo — centered */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <div className="overflow-hidden dark:hidden w-[108px] h-[36px]">
            <Image
              src="/logo.png"
              alt="TuAgente Store"
              width={200}
              height={133}
              className="w-[108px]"
              style={{ marginTop: -7, marginLeft: -7, filter: 'brightness(0.65) contrast(1.25)' }}
              priority
            />
          </div>
          <div className="overflow-hidden hidden dark:block w-[108px] h-[36px]">
            <Image
              src="/logo-dark.png"
              alt="TuAgente Store"
              width={200}
              height={133}
              className="w-[108px]"
              style={{ marginTop: -7, marginLeft: -7 }}
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {user && <NotificationBell />}
        </div>
      </header>

      {/* ── Mobile drawer (< lg) ─────────────────────────────────── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <div className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border shadow-2xl">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors z-10"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent
              user={user}
              onLogout={handleLogout}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
