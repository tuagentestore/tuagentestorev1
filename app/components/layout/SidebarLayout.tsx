'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface SidebarCtx {
  collapsed: boolean
  toggle: () => void
}

const Ctx = createContext<SidebarCtx>({ collapsed: false, toggle: () => {} })
export const useSidebarCollapsed = () => useContext(Ctx)

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
    setMounted(true)
  }, [])

  const toggle = () => {
    setCollapsed(p => {
      const next = !p
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <Ctx.Provider value={{ collapsed, toggle }}>
      <div className={`flex flex-col lg:flex-row min-h-screen transition-all duration-300 ${
        !mounted ? 'lg:ml-60' : collapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        {children}
      </div>
    </Ctx.Provider>
  )
}
