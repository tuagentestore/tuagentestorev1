'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Bot, LayoutGrid, User, Shield, Menu, X, Sparkles, Building2,
  Sun, Moon, MessageCircle, DollarSign, Package, GitCompare,
  ChevronDown, Workflow,
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import { useTheme } from './ThemeProvider'

interface NavUser {
  name?: string
  email: string
  role: string
}

const MARKETPLACE_ITEMS = [
  { name: 'Agentes IA', href: '/agents', icon: Bot, desc: 'Catálogo completo de agentes' },
  { name: 'Marketplace', href: '/marketplace', icon: Package, desc: 'Packs por industria y comparador' },
  { name: 'Catálogo n8n', href: '/marketplace/catalogo', icon: Workflow, desc: '100+ automatizaciones listas' },
  { name: 'Comparar agentes', href: '/marketplace/comparar', icon: GitCompare, desc: 'Compará hasta 3 agentes' },
]

function UserMenu({ user, onLogout }: { user: NavUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
      >
        {initials}
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

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)
  const marketRef = useRef<HTMLDivElement>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (marketRef.current && !marketRef.current.contains(e.target as Node)) {
        setMarketOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  const isMarketActive = pathname.startsWith('/agents') || pathname.startsWith('/marketplace')

  // Desktop nav links — no icons, no Mi Panel (goes to UserMenu dropdown)
  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Casos', href: '/casos' },
    { name: 'Elegí tu Agente', href: '/wizard' },
    { name: 'Precios', href: '/pricing' },
    { name: 'Contacto', href: '/contact' },
  ]

  // Mobile nav links — with icons
  const mobileNavLinks = [
    { name: 'Inicio', href: '/', icon: LayoutGrid },
    { name: 'Casos', href: '/casos', icon: Building2 },
    { name: 'Elegí tu Agente', href: '/wizard', icon: Sparkles },
    { name: 'Precios', href: '/pricing', icon: DollarSign },
    { name: 'Contacto', href: '/contact', icon: MessageCircle },
    ...(user ? [{ name: 'Mi Panel', href: '/dashboard', icon: User }] : []),
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-card/90 backdrop-blur-xl border-b border-border shadow-custom'
        : 'bg-card/50 backdrop-blur-lg border-b border-border/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <div className="overflow-hidden dark:hidden w-[130px] h-[44px] sm:w-[150px] sm:h-[50px]">
              <Image
                src="/logo.png"
                alt="TuAgente Store"
                width={200}
                height={133}
                className="w-[130px] sm:w-[150px] transition-opacity group-hover:opacity-80"
                style={{ marginTop: -9, marginLeft: -9, filter: 'brightness(0.65) contrast(1.25)' }}
                priority
              />
            </div>
            <div className="overflow-hidden hidden dark:block w-[130px] h-[44px] sm:w-[150px] sm:h-[50px]">
              <Image
                src="/logo-dark.png"
                alt="TuAgente Store"
                width={200}
                height={133}
                className="w-[130px] sm:w-[150px] transition-opacity group-hover:opacity-80"
                style={{ marginTop: -9, marginLeft: -9 }}
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav — shown at lg+ */}
          <div className="hidden lg:flex items-center gap-0.5">
            {/* Inicio */}
            <Link
              href="/"
              className={`px-2.5 py-1.5 rounded-lg transition-all text-sm font-medium ${
                pathname === '/'
                  ? 'bg-primary text-primary-foreground shadow-custom'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Inicio
            </Link>

            {/* Agentes dropdown */}
            <div ref={marketRef} className="relative">
              <button
                onClick={() => setMarketOpen(p => !p)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-sm font-medium ${
                  isMarketActive
                    ? 'bg-primary text-primary-foreground shadow-custom'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Agentes
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${marketOpen ? 'rotate-180' : ''}`} />
              </button>

              {marketOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                  {MARKETPLACE_ITEMS.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMarketOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors ${
                        pathname.startsWith(item.href) && item.href !== '/agents'
                          ? 'bg-primary/10'
                          : pathname === item.href && item.href === '/agents'
                            ? 'bg-primary/10'
                            : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other nav links */}
            {navLinks.slice(1).map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg transition-all text-sm font-medium ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-custom'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-sm font-medium ${
                  pathname.startsWith('/admin')
                    ? 'bg-violet-600 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Right — shown at lg+ */}
          <div className="hidden lg:flex items-center gap-2">
            {user && <NotificationBell />}

            <a
              href="https://wa.me/5493437527193?text=Hola%2C+me+interesa+TuAgente+Store"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                Iniciar sesión
              </Link>
            )}

            <Link
              href="/wizard"
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              Elegí tu Agente
            </Link>
          </div>

          {/* Mobile/tablet toggle — shown below lg */}
          <div className="lg:hidden flex items-center gap-2">
            {user && <NotificationBell />}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile/tablet menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-1 border-t border-border pt-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === '/' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="font-medium">Inicio</span>
            </Link>

            {/* Marketplace group */}
            <div className="px-4 pt-2 pb-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Marketplace</p>
              {MARKETPLACE_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-0.5 ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              ))}
            </div>

            {mobileNavLinks.slice(1).map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}

            <div className="pt-2 flex flex-col gap-2 border-t border-border mt-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-left text-muted-foreground hover:text-foreground text-sm"
                >
                  Cerrar sesión ({user.email})
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground text-sm">
                  Iniciar sesión
                </Link>
              )}
              <Link
                href="/wizard"
                onClick={() => setMobileOpen(false)}
                className="mx-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm text-center"
              >
                Elegí tu Agente
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
