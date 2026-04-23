'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Bot, LayoutGrid, User, Shield, Menu, X, Sparkles, Building2,
  MessageCircle, DollarSign, Package, GitCompare, Workflow,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useSidebarCollapsed } from './SidebarLayout'

interface NavUser {
  name?: string
  email: string
  role: string
}

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { name: 'Inicio',            href: '/',                       icon: LayoutGrid },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { name: 'Agentes IA',        href: '/agents',                 icon: Bot },
      { name: 'Marketplace',       href: '/marketplace',            icon: Package },
      { name: 'Catálogo n8n',      href: '/marketplace/catalogo',   icon: Workflow },
      { name: 'Comparar agentes',  href: '/marketplace/comparar',   icon: GitCompare },
    ],
  },
  {
    label: 'Plataforma',
    items: [
      { name: 'Casos de éxito',    href: '/casos',                  icon: Building2 },
      { name: 'Elegí tu Agente',   href: '/wizard',                 icon: Sparkles },
      { name: 'Precios',           href: '/pricing',                icon: DollarSign },
      { name: 'Contacto',          href: '/contact',                icon: MessageCircle },
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
  onClose,
  collapsed = false,
}: {
  user: NavUser | null
  onClose?: () => void
  collapsed?: boolean
}) {
  const pathname = usePathname()
  const { toggle } = useSidebarCollapsed()

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`border-b border-border shrink-0 flex items-center justify-center ${collapsed ? 'py-3 px-2' : 'px-3 py-5'}`}>
        <Link href="/" onClick={onClose} className="flex items-center">
          {collapsed ? (
            /* Icon only when collapsed — light: normal, dark: brightened */
            <>
              <Image
                src="/favicon.png"
                alt="TuAgente Store"
                width={44}
                height={44}
                className="object-contain w-11 h-11 dark:hidden"
                priority
              />
              <Image
                src="/favicon.png"
                alt="TuAgente Store"
                width={44}
                height={44}
                className="object-contain w-11 h-11 hidden dark:block"
                style={{ filter: 'brightness(3) saturate(0.8)' }}
                priority
              />
            </>
          ) : (
            /* Full logo when expanded — light/dark variants, much bigger, centered */
            <>
              <Image
                src="/logo.png"
                alt="TuAgente Store"
                width={210}
                height={90}
                className="object-contain dark:hidden"
                style={{ height: 90, width: 'auto', filter: 'contrast(1.5) brightness(0.75)' }}
                priority
              />
              <Image
                src="/logo-dark.png"
                alt="TuAgente Store"
                width={210}
                height={90}
                className="object-contain hidden dark:block"
                style={{ height: 90, width: 'auto' }}
                priority
              />
            </>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label ?? '__main'}>
            {section.label && !collapsed && (
              <p className="px-2 mb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </p>
            )}
            {section.label && collapsed && (
              <div className="border-t border-border/50 my-1" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, pathname)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                        collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                      } ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Mi Panel (logged in) */}
        {user && (
          <div>
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Mi cuenta
              </p>
            )}
            {collapsed && <div className="border-t border-border/50 my-1" />}
            <Link
              href="/dashboard"
              onClick={onClose}
              title={collapsed ? 'Mi Panel' : undefined}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
              } ${
                pathname.startsWith('/dashboard')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              {!collapsed && 'Mi Panel'}
            </Link>
          </div>
        )}

        {/* Admin */}
        {user?.role === 'admin' && (
          <div>
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
            )}
            <Link
              href="/admin"
              onClick={onClose}
              title={collapsed ? 'Admin' : undefined}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
              } ${
                pathname.startsWith('/admin')
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              {!collapsed && 'Panel Admin'}
            </Link>
          </div>
        )}
      </nav>

      {/* Collapse toggle button — desktop only */}
      <div className={`border-t border-border px-2 py-3 shrink-0 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<NavUser | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { collapsed } = useSidebarCollapsed()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => { setDrawerOpen(false) }, [pathname])

  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────────────── */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen flex-col z-40 bg-card border-r border-border transition-[width] duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}>
        <SidebarContent user={user} collapsed={collapsed} />
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

        {/* Logo centered */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image src="/logo.png" alt="TuAgente Store" width={140} height={52} className="object-contain dark:hidden" style={{ height: 52, width: 'auto', filter: 'contrast(1.5) brightness(0.75)' }} priority />
          <Image src="/logo-dark.png" alt="TuAgente Store" width={140} height={52} className="object-contain hidden dark:block" style={{ height: 52, width: 'auto' }} priority />
        </Link>

        <div className="w-10" />
      </header>

      {/* ── Mobile drawer (< lg) ─────────────────────────────────── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
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
              onClose={() => setDrawerOpen(false)}
              collapsed={false}
            />
          </div>
        </div>
      )}
    </>
  )
}
