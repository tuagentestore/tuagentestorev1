'use client'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface LayerNavItem {
  label: string
  href?: string
}

interface LayerNavProps {
  items: LayerNavItem[]
}

export default function LayerNav({ items }: LayerNavProps) {
  const all = [{ label: 'Inicio', href: '/' }, ...items]

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto">
        <Home className="w-3.5 h-3.5 shrink-0" />
        {all.map((item, i) => {
          const isLast = i === all.length - 1
          return (
            <span key={i} className="flex items-center gap-1.5 shrink-0">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
              {isLast || !item.href ? (
                <span className={isLast ? 'text-foreground font-medium' : ''}>{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
              )}
            </span>
          )
        })}
      </div>
    </nav>
  )
}
