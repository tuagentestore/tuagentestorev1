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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = await getCase(slug)
  if (!c) return { title: 'Caso no encontrado | TuAgenteStore' }
  return {
    title: `${c.title} | TuAgenteStore`,
    description: c.summary_bullets?.[0] ?? `Caso de implementación en ${c.industry}`,
  }
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params
  const c = await getCase(slug)
  if (!c) notFound()
  return <CaseDetailClient caso={c} />
}
