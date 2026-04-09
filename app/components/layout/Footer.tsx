import Link from 'next/link'
import { Zap, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    producto: [
      { name: 'Catálogo de Agentes', href: '/agents' },
      { name: 'Cómo Funciona', href: '/#como-funciona' },
      { name: 'Precios', href: '/#precios' },
    ],
    empresa: [
      { name: 'Sobre Nosotros', href: '/#nosotros' },
      { name: 'Blog', href: '/blog' },
      { name: 'Casos de Uso', href: '/#casos' },
    ],
    soporte: [
      { name: 'Contacto', href: 'mailto:hola@tuagentestore.com' },
      { name: 'Documentación', href: '/docs' },
      { name: 'Términos de uso', href: '/terms' },
      { name: 'Privacidad', href: '/privacy' },
    ],
  }

  const socials = [
    { icon: Instagram, href: 'https://instagram.com/tuagentestore', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/tuagentestore', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://x.com/tuagentestore', label: 'X' },
    { icon: Youtube, href: 'https://youtube.com/@tuagentestore', label: 'YouTube' },
  ]

  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Brand col */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-custom">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-primary">TuAgente</span>
                <span className="text-muted-foreground font-medium"> Store</span>
              </span>
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
            <a href="mailto:hola@tuagentestore.com" className="hover:text-primary transition-colors">
              hola@tuagentestore.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
