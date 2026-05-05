import type { Metadata } from 'next'
import { Suspense } from 'react'
import N8nCatalogClient from '@/components/marketplace/N8nCatalogClient'
import { Bot } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Catálogo de Automatizaciones n8n',
  description: 'Accedé al catálogo completo de automatizaciones n8n: WhatsApp, Email, Telegram, IA, RRHH y más. Exclusivo para miembros.',
}

function CatalogFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
        <p className="text-muted-foreground text-sm">Cargando catálogo...</p>
      </div>
    </div>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <N8nCatalogClient />
    </Suspense>
  )
}
