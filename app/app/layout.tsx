import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import SalesAgentWidget from '@/components/chat/SalesAgentWidget'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tuagentestore.com'

export const metadata: Metadata = {
  title: {
    default: 'TuAgente Store — Marketplace de Agentes IA para Empresas',
    template: '%s | TuAgente Store',
  },
  description:
    'Marketplace de agentes IA para automatizar ventas, soporte y marketing en tu empresa. Integraciones con WhatsApp, HubSpot, Gmail y más. Listos en 24h.',
  metadataBase: new URL(APP_URL),
  keywords: [
    'agentes ia', 'automatización empresarial', 'marketplace ia latinoamerica',
    'chatbot whatsapp', 'crm automatico', 'n8n agentes', 'ventas automatizadas',
    'soporte ia 24/7', 'generacion de leads ia', 'agente ia argentina',
  ],
  authors: [{ name: 'TuAgente Store', url: APP_URL }],
  creator: 'TuAgente Store',
  publisher: 'TuAgente Store',
  openGraph: {
    siteName: 'TuAgente Store',
    type: 'website',
    locale: 'es_AR',
    url: APP_URL,
    title: 'TuAgente Store — Marketplace de Agentes IA para Empresas',
    description: 'Automatizá ventas, soporte y marketing con agentes IA listos en 24h. Integración con WhatsApp, HubSpot, Gmail y más.',
    images: [{ url: `${APP_URL}/og-default.png`, width: 1200, height: 630, alt: 'TuAgente Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TuAgente Store — Agentes IA para tu empresa',
    description: 'Automatizá ventas, soporte y marketing con agentes IA en 24h.',
    images: [`${APP_URL}/og-default.png`],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    apple: '/favicon.png',
  },
  alternates: {
    canonical: APP_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 lg:ml-60 min-h-screen">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
          <WhatsAppButton />
          <SalesAgentWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
