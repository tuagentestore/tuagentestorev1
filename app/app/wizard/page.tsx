import { Metadata } from 'next'
import WizardClient from '@/components/wizard/WizardClient'

export const metadata: Metadata = {
  title: 'Encontrá tu Agente Ideal',
  description: 'Respondé 5 preguntas y nuestra IA te recomienda el agente perfecto para tu negocio.',
}

export default function WizardPage() {
  return <WizardClient />
}
