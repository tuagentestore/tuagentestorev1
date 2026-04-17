import type { Metadata } from 'next'
import { Suspense } from 'react'
import CatalogClient from '@/components/agents/CatalogClient'

export const metadata: Metadata = {
  title: 'Catálogo de Agentes IA',
  description: 'Explorá todos los agentes IA disponibles. Filtrá por categoría, probá demos en vivo y activá el que mejor se adapte a tu negocio.',
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
            Elegí el agente correcto para el <span className="text-gradient">problema correcto</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-3">
            Filtrá por objetivo, industria y canal. Probá demos reales y activá el agente con implementación guiada.
          </p>
          <p className="text-sm text-muted-foreground">
            Desde <span className="font-semibold text-foreground">USD 397/mes</span> · Demos en vivo · Setup en 24h
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 h-64 animate-pulse" />
            ))}
          </div>
        }>
          <CatalogClient />
        </Suspense>
      </div>
    </div>
  )
}
