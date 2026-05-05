import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Youtube, Linkedin } from 'lucide-react'

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    producto: [
      { name: 'Catálogo de Agentes', href: '/agents' },
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'Catálogo n8n', href: '/marketplace/catalogo' },
      { name: 'Comparar Agentes', href: '/marketplace/comparar' },
      { name: 'Encontrá tu Agente (IA)', href: '/wizard' },
      { name: 'Precios', href: '/pricing' },
    ],
    industrias: [
      { name: 'Para Inmobiliarias', href: '/para/inmobiliarias' },
      { name: 'Para Clínicas', href: '/para/clinicas' },
      { name: 'Para Concesionarias', href: '/para/concesionarias' },
      { name: 'Para Agencias', href: '/para/agencias' },
      { name: 'Casos de Implementación', href: '/casos' },
    ],
    soporte: [
      { name: 'Documentación', href: '/docs' },
      { name: 'Centro de soporte', href: '/soporte' },
      { name: 'Contacto', href: '/contact' },
      { name: 'Términos de uso', href: '/terms' },
      { name: 'Política de privacidad', href: '/privacy' },
    ],
  }

  const socials = [
    { icon: Instagram, href: 'https://www.instagram.com/ai.tuagentestore', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/tu-agente-store-4704673b8', label: 'LinkedIn' },
    { icon: XIcon, href: 'https://x.com/tuagentestore', label: 'X' },
    { icon: Youtube, href: 'https://youtube.com/@tuagentestore', label: 'YouTube' },
    { icon: TiktokIcon, href: 'https://www.tiktok.com/@tuagentestore', label: 'TikTok' },
  ]

  return (
    <footer className="bg-card border-t border-border mt-14 sm:mt-24">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Brand col */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-start mb-5 group w-fit">
              <Image
                src="/logo.png"
                alt="TuAgente Store"
                width={280}
                height={110}
                className="object-contain dark:hidden transition-opacity group-hover:opacity-80"
                style={{ height: 110, width: 'auto' }}
              />
              <Image
                src="/logo-dark.png"
                alt="TuAgente Store"
                width={280}
                height={110}
                className="object-contain hidden dark:block transition-opacity group-hover:opacity-80"
                style={{ height: 110, width: 'auto' }}
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              El marketplace de agentes IA listos para automatizar tu negocio.
              Ventas, soporte, marketing y más — activos en 24h.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-semibold text-foreground capitalize mb-4 text-sm tracking-wide">
                {section}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TuAgente Store. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary">●</span>{' '}
            <a href="mailto:info@tuagentestore.com" className="hover:text-primary transition-colors">
              info@tuagentestore.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
