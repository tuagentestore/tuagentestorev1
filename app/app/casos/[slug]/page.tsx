import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CaseDetailClient from '@/components/cases/CaseDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

async function getCase(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/cases/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.case ?? null
  } catch {
    return null
  }
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tuagentestore.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = await getCase(slug)
  if (!c) return { title: 'Caso no encontrado | TuAgenteStore' }

  const desc = c.summary_bullets?.[0] ?? `Caso de implementación en ${c.industry}`
  const ogUrl = `${BASE}/api/og?title=${encodeURIComponent(c.title)}&subtitle=${encodeURIComponent(`${c.primary_metric_value} ${c.primary_metric_label} · ${c.industry}`)}&type=case`

  return {
    title: c.title,
    description: desc,
    openGraph: {
      title: c.title,
      description: desc,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: c.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.title,
      images: [ogUrl],
    },
    alternates: { canonical: `${BASE}/casos/${slug}` },
  }
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params
  const c = await getCase(slug)
  if (!c) notFound()
  return <CaseDetailClient caso={c} />
}
