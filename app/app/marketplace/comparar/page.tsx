import type { Metadata } from 'next'
import { Suspense } from 'react'
import CompareClient from '@/components/marketplace/CompareClient'
import { Bot } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Comparar Agentes IA | TuAgenteStore',
  description: 'Comparás agentes IA lado a lado para elegir el que mejor se adapta a tu negocio.',
}

function CompareFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
        <p className="text-muted-foreground text-sm">Cargando comparador...</p>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <CompareClient />
    </Suspense>
  )
}
