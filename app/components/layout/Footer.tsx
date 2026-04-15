import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Youtube, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    producto: [
      { name: 'Catálogo de Agentes', href: '/agents' },
      { name: 'Encontrá tu agente', href: '/wizard' },
      { name: 'Precios', href: '/pricing' },
      { name: 'Casos de Implementación', href: '/casos' },
    ],
    empresa: [
      { name: 'Para Inmobiliarias', href: '/para/inmobiliarias' },
      { name: 'Para Clínicas', href: '/para/clinicas' },
      { name: 'Para Concesionarias', href: '/para/concesionarias' },
      { name: 'Para Agencias', href: '/para/agencias' },
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
    { icon: Twitter, href: 'https://x.com/tuagentestore', label: 'X' },
    { icon: Youtube, href: 'https://youtube.com/@tuagentestore', label: 'YouTube' },
  ]

  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Brand col */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4 w-fit group">
              <Image
                src="/logo.png"
                alt="TuAgente Store"
                width={36}
                height={36}
                className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80 dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="TuAgente Store"
                width={36}
                height={36}
                className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80 hidden dark:block"
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
