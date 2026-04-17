import type { Metadata } from 'next'
import AgentDetailClient from '@/components/agents/AgentDetailClient'

interface Props { params: Promise<{ slug: string }> }

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tuagentestore.com'

function slugToTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const title = slugToTitle(slug)
  const ogUrl = `${BASE}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Demo en vivo disponible · Listo en 24h · Sin programación')}&type=agent`

  return {
    title,
    description: `Conocé el agente ${title}, probá el demo en vivo y activalo en tu negocio en 24h. Sin código, sin técnicos.`,
    openGraph: {
      title,
      description: 'Demo en vivo disponible. Activación en 24h. Sin programación.',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [ogUrl],
    },
    alternates: { canonical: `${BASE}/agents/${slug}` },
  }
}

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params
  return <AgentDetailClient slug={slug} />
}
