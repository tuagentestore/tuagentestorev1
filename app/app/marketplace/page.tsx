import type { Metadata } from 'next'
import { Suspense } from 'react'
import MarketplaceClient from '@/components/marketplace/MarketplaceClient'

export const metadata: Metadata = {
  title: 'Marketplace de Agentes IA | TuAgenteStore',
  description: 'Explorá, comparás y activás agentes IA para tu empresa. Ventas, soporte, marketing y operaciones en 24 horas.',
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MarketplaceClient />
    </Suspense>
  )
}
