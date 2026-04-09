import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'TuAgente Store — Marketplace de Agentes IA',
    template: '%s | TuAgente Store',
  },
  description:
    'El marketplace de agentes IA para automatizar tu empresa. Ventas, soporte, marketing y más — listos en 24h.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://tuagentestore.com'),
  keywords: ['agentes ia', 'automatizacion', 'marketplace ia', 'chatbot', 'crm automatico'],
  openGraph: {
    siteName: 'TuAgente Store',
    type: 'website',
    locale: 'es_AR',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
