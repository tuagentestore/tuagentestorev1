import type { Metadata } from 'next'
import PricingClient from '@/components/pricing/PricingClient'

export const metadata: Metadata = {
  title: 'Precios',
  description: 'Planes Starter, Professional y Enterprise. Empezá con 14 días de prueba gratis. Sin contrato de permanencia.',
}

export default function PricingPage() {
  return <PricingClient />
}
