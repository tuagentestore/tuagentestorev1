import { Metadata } from 'next'
import CasosClient from '@/components/cases/CasosClient'

export const metadata: Metadata = {
  title: 'Casos de Implementación',
  description: 'Resultados reales de empresas que automatizaron sus procesos con agentes IA. Inmobiliarias, seguros, legal y más.',
}

export default function CasosPage() {
  return <CasosClient />
}
