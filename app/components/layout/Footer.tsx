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
    ],
  }

  const socials = [
    { icon: Instagram, href: 'https://www.instagram.com/ai.tuagentestore', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/tu-agente-store-4704673b8', label: 'LinkedIn' },
    { icon: XIcon, href: 'https://x.com/tuagentestore', label: 'X' },
    { icon: Youtube, href: 'https://youtube.com/@tuagentestore', label: 'YouTube' },
  ]

  return (
    <footer className="bg-card border-t border-border mt-14 sm:mt-24">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Brand col */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center mb-4 group">
              <Image
                src="/logo.png"
                alt="TuAgente Store"
                width={160}
                height={54}
                className="object-contain dark:hidden transition-opacity group-hover:opacity-80"
                style={{ height: 54 }}
              />
              <Image
                src="/logo-dark.png"
                alt="TuAgente Store"
                width={160}
                height={54}
                className="object-contain hidden dark:block transition-opacity group-hover:opacity-80"
                style={{ height: 54 }}
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
