import type { Metadata } from 'next'
import AgentDetailClient from '@/components/agents/AgentDetailClient'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: 'Conocé este agente IA, probá el demo en vivo y activalo en tu negocio en 24h.',
  }
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params
  return <AgentDetailClient slug={slug} />
}
