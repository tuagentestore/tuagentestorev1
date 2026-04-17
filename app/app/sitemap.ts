import { MetadataRoute } from 'next'

const BASE = 'https://tuagentestore.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = [
    { url: BASE, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE}/agents`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE}/marketplace`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE}/marketplace/catalogo`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE}/marketplace/comparar`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE}/casos`, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${BASE}/wizard`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE}/pricing`, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE}/docs`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE}/soporte`, changeFrequency: 'monthly' as const, priority: 0.6 },
  ].map(p => ({ ...p, lastModified: now }))

  const agents = [
    'sales-ai-closer',
    'ai-support-agent',
    'ai-lead-engine',
    'appointment-setting-agent',
    'marketing-ai-agent',
    'ecommerce-agent',
  ].map(slug => ({
    url: `${BASE}/agents/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  const verticals = [
    'inmobiliarias',
    'clinicas',
    'concesionarias',
    'agencias',
  ].map(vertical => ({
    url: `${BASE}/para/${vertical}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const cases = [
    'inmobiliaria-gestion-leads',
    'aseguradora-consultas-automaticas',
    'legal-clasificacion-documentos',
  ].map(slug => ({
    url: `${BASE}/casos/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...agents, ...verticals, ...cases]
}
