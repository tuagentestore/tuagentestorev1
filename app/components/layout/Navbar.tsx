'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Bot, LayoutGrid, User, Shield, Menu, X, Sparkles, Building2, Sun, Moon, MessageCircle, Store } from 'lucide-react'
import NotificationBell from './NotificationBell'
import { useTheme } from './ThemeProvider'

interface NavUser {
  name?: string
  email: string
  role: string
}

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  const navLinks = [
    { name: 'Inicio', href: '/', icon: LayoutGrid },
    { name: 'Marketplace', href: '/marketplace', icon: Store },
    { name: 'Catálogo', href: '/agents', icon: Bot },
    { name: 'Casos', href: '/casos', icon: Building2 },
    { name: 'Wizard IA', href: '/wizard', icon: Sparkles },
    ...(user ? [{ name: 'Mis Agentes', href: '/dashboard', icon: User }] : []),
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

          {/* Logo — wrapper recorta el espacio en blanco del canvas de la imagen */}
          <Link href="/" className="flex items-center shrink-0 group">
            {/* Light mode — brightness reducida para que el texto gris sea visible */}
            <div className="overflow-hidden dark:hidden" style={{ width: 180, height: 92 }}>
              <Image
                src="/logo.png"
                alt="TuAgente Store"
                width={220}
                height={147}
                className="brightness-75 transition-opacity group-hover:opacity-80"
                style={{ marginTop: -14, marginLeft: -20 }}
                priority
              />
            </div>
            {/* Dark mode — logo blanco sobre fondo oscuro */}
            <div className="overflow-hidden hidden dark:block" style={{ width: 180, height: 92 }}>
              <Image
                src="/logo-dark.png"
                alt="TuAgente Store"
                width={220}
                height={147}
                className="transition-opacity group-hover:opacity-80"
                style={{ marginTop: -14, marginLeft: -20 }}
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-custom'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
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

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user && <NotificationBell />}

            {/* WhatsApp icon */}
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

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground truncate max-w-32">
                  {user.name ?? user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
            <Link
              href="/wizard"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Encontrá tu Agente
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
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

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
            <div className="pt-2 flex flex-col gap-2">
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
                href="/agents"
                onClick={() => setMobileOpen(false)}
                className="mx-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-sm text-center"
              >
                Explorar Agentes
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
