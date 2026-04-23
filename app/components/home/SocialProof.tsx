import { Star, Quote, Building2, Scale, Shield } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Martín García',
    role: 'Director Comercial',
    company: 'Inmobiliaria de Buenos Aires',
    text: 'El Sales AI Closer califica mis leads antes de que los vea. El equipo solo habla con gente que realmente quiere comprar. Nuestra tasa de cierre subió 40%.',
    rating: 5,
    icon: Building2,
    color: 'from-blue-500 to-indigo-500',
    iconColor: 'text-blue-100',
  },
  {
    name: 'Sofía Romero',
    role: 'CEO',
    company: 'LegalTech Mendoza',
    text: 'El agente de soporte resuelve el 80% de las consultas sin que yo intervenga. Mis clientes piensan que tengo un equipo enorme. Son solo yo y el agente.',
    rating: 5,
    icon: Scale,
    color: 'from-violet-500 to-purple-500',
    iconColor: 'text-violet-100',
  },
  {
    name: 'Diego Herrera',
    role: 'Fundador',
    company: 'Empresa de Seguros en Argentina',
    text: 'En 24 horas teníamos el agente respondiendo cotizaciones en WhatsApp. Antes perdíamos leads fuera del horario de oficina. Ahora no se escapa ninguno.',
    rating: 5,
    icon: Shield,
    color: 'from-indigo-500 to-blue-500',
    iconColor: 'text-indigo-100',
  },
]

/* ─── Inline SVG brand logos (light+dark adaptive) ─── */
function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 120 36" className="h-7 w-auto" aria-label="WhatsApp">
      <rect width="36" height="36" rx="8" fill="#25D366"/>
      <path d="M18 6C11.37 6 6 11.37 6 18c0 2.14.57 4.15 1.56 5.88L6 30l6.32-1.52A11.96 11.96 0 0018 30c6.63 0 12-5.37 12-12S24.63 6 18 6zm6.44 16.5c-.27.75-1.6 1.4-2.19 1.48-.56.08-1.27.11-2.04-.13a18.5 18.5 0 01-1.84-.68c-3.24-1.4-5.35-4.67-5.51-4.89-.16-.22-1.3-1.73-1.3-3.3 0-1.57.82-2.34 1.11-2.66.29-.32.63-.4.84-.4l.6.01c.19 0 .45-.07.7.54.27.63.91 2.22.99 2.38.08.16.13.35.03.56-.1.21-.16.34-.31.52-.16.19-.33.41-.47.55-.16.16-.32.34-.14.66.18.32.8 1.32 1.72 2.14 1.18 1.05 2.18 1.37 2.5 1.53.32.16.5.13.69-.08.19-.21.8-.93 1.01-1.25.21-.32.42-.27.7-.16.28.11 1.76.83 2.06.98.3.15.5.22.57.34.07.12.07.7-.2 1.45z" fill="white"/>
      <text x="44" y="24" fontSize="14" fontWeight="700" fill="#25D366" fontFamily="system-ui">WhatsApp</text>
    </svg>
  )
}

function MetaLogo() {
  return (
    <svg viewBox="0 0 90 36" className="h-7 w-auto" aria-label="Meta">
      <path d="M6 22c0 3.31 1.49 5.5 3.75 5.5 1.6 0 2.77-.75 4.5-3.25L16 22l1.75 2.25C19.48 26.75 20.65 27.5 22.25 27.5 24.51 27.5 26 25.31 26 22c0-2.1-.7-3.9-1.9-5.1a3.5 3.5 0 00-2.6-1.15c-1.4 0-2.4.55-3.75 2.25-.5.65-1 1.35-1.75 2.5-.75-1.15-1.25-1.85-1.75-2.5C12.9 16.3 11.9 15.75 10.5 15.75a3.5 3.5 0 00-2.6 1.15C6.7 18.1 6 19.9 6 22zm4.5-4.75c.8 0 1.35.4 2.5 2l2 2.85-2 2.85C11.85 26.55 11.3 27 10.5 27c-1.5 0-2.5-1.65-2.5-4 0-1.5.4-2.7 1.1-3.4.4-.4.87-.6 1.4-.6l-.5.25zm11.75 0c.53 0 1 .2 1.4.6.7.7 1.1 1.9 1.1 3.4 0 2.35-1 4-2.5 4-.8 0-1.35-.45-2.5-2l-2-2.85 2-2.85c1.15-1.6 1.7-2 2.5-2z" fill="#0866FF"/>
      <text x="32" y="24" fontSize="14" fontWeight="700" fill="#0866FF" fontFamily="system-ui">Meta</text>
    </svg>
  )
}

function HubSpotLogo() {
  return (
    <svg viewBox="0 0 110 36" className="h-7 w-auto" aria-label="HubSpot">
      <g transform="translate(4,4)">
        <circle cx="14" cy="14" r="5" fill="#FF7A59"/>
        <circle cx="14" cy="3" r="3" fill="#FF7A59"/>
        <circle cx="14" cy="25" r="3" fill="#FF7A59"/>
        <circle cx="3" cy="14" r="3" fill="#FF7A59"/>
        <circle cx="25" cy="14" r="3" fill="#FF7A59"/>
        <line x1="14" y1="6" x2="14" y2="9" stroke="#FF7A59" strokeWidth="2"/>
        <line x1="14" y1="19" x2="14" y2="22" stroke="#FF7A59" strokeWidth="2"/>
        <line x1="6" y1="14" x2="9" y2="14" stroke="#FF7A59" strokeWidth="2"/>
        <line x1="19" y1="14" x2="22" y2="14" stroke="#FF7A59" strokeWidth="2"/>
      </g>
      <text x="36" y="24" fontSize="13" fontWeight="700" fill="#FF7A59" fontFamily="system-ui">HubSpot</text>
    </svg>
  )
}

function CalendlyLogo() {
  return (
    <svg viewBox="0 0 108 36" className="h-7 w-auto" aria-label="Calendly">
      <rect x="4" y="4" width="28" height="28" rx="6" fill="#006BFF"/>
      <rect x="10" y="8" width="4" height="6" rx="2" fill="white"/>
      <rect x="22" y="8" width="4" height="6" rx="2" fill="white"/>
      <rect x="8" y="16" width="20" height="2" fill="white" opacity="0.5"/>
      <rect x="8" y="20" width="6" height="6" rx="1" fill="white"/>
      <rect x="17" y="20" width="6" height="6" rx="1" fill="white"/>
      <text x="38" y="24" fontSize="13" fontWeight="700" fill="#006BFF" fontFamily="system-ui">Calendly</text>
    </svg>
  )
}

function OpenAILogo() {
  return (
    <svg viewBox="0 0 100 36" className="h-7 w-auto" aria-label="OpenAI">
      <circle cx="18" cy="18" r="13" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-900 dark:text-white"/>
      <circle cx="18" cy="18" r="6" fill="currentColor" className="text-gray-900 dark:text-white"/>
      <path d="M18 5 L18 13 M18 23 L18 31 M5 18 L13 18 M23 18 L31 18 M9.4 9.4 L15 15 M21 21 L26.6 26.6 M26.6 9.4 L21 15 M15 21 L9.4 26.6" stroke="currentColor" strokeWidth="1.5" className="text-gray-900 dark:text-white"/>
      <text x="36" y="24" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="system-ui" className="text-gray-900 dark:text-white">OpenAI</text>
    </svg>
  )
}

function ZapierLogo() {
  return (
    <svg viewBox="0 0 90 36" className="h-7 w-auto" aria-label="Zapier">
      <circle cx="18" cy="18" r="14" fill="#FF4A00"/>
      <path d="M10 18 L26 18 M18 10 L26 18 L18 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <text x="36" y="24" fontSize="14" fontWeight="700" fill="#FF4A00" fontFamily="system-ui">Zapier</text>
    </svg>
  )
}

function ShopifyLogo() {
  return (
    <svg viewBox="0 0 96 36" className="h-7 w-auto" aria-label="Shopify">
      <path d="M25 8c-.5-3-2.5-4-4-4.2L19 8h6zm-6 0l-1.5-4L15 7l4 1zm-3.5-3.5L14 7.5l-2.5-1.5C12 4.5 13 4 15.5 4.5zm-4 5l-4 1-.5-3.5C8.5 8 10 7.5 11.5 9.5zm14 4.5H10L8.5 29h18L25 14zm-7.5 9.5c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5 2.5 1 2.5 2.5-1 2.5-2.5 2.5z" fill="#96BF48"/>
      <text x="32" y="24" fontSize="14" fontWeight="700" fill="#96BF48" fontFamily="system-ui">Shopify</text>
    </svg>
  )
}

function N8nLogo() {
  return (
    <svg viewBox="0 0 70 36" className="h-7 w-auto" aria-label="n8n">
      <circle cx="8" cy="18" r="6" fill="#EA4B71"/>
      <circle cx="28" cy="18" r="6" fill="#EA4B71"/>
      <line x1="14" y1="18" x2="22" y2="18" stroke="#EA4B71" strokeWidth="2"/>
      <circle cx="18" cy="10" r="4" fill="#FF6B35"/>
      <line x1="18" y1="14" x2="18" y2="22" stroke="#FF6B35" strokeWidth="1.5" strokeDasharray="2,1"/>
      <text x="38" y="24" fontSize="14" fontWeight="700" fill="#EA4B71" fontFamily="system-ui">n8n</text>
    </svg>
  )
}

function MercadoLibreLogo() {
  return (
    <svg viewBox="0 0 140 36" className="h-7 w-auto" aria-label="Mercado Libre">
      <circle cx="18" cy="18" r="14" fill="#FFE600"/>
      <path d="M11 16 L18 10 L25 16" fill="none" stroke="#FF7733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 20 L18 14 L25 20" fill="none" stroke="#FF7733" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="36" y="24" fontSize="12" fontWeight="700" fill="#333" fontFamily="system-ui">Mercado Libre</text>
    </svg>
  )
}

function SlackLogo() {
  return (
    <svg viewBox="0 0 90 36" className="h-7 w-auto" aria-label="Slack">
      <g transform="translate(4,4)">
        <rect x="0" y="10" width="7" height="7" rx="2" fill="#E01E5A"/>
        <rect x="10" y="0" width="7" height="7" rx="2" fill="#36C5F0"/>
        <rect x="10" y="10" width="7" height="7" rx="2" fill="#2EB67D"/>
        <rect x="20" y="10" width="7" height="7" rx="2" fill="#ECB22E"/>
        <rect x="10" y="20" width="7" height="7" rx="2" fill="#E01E5A"/>
      </g>
      <text x="36" y="24" fontSize="14" fontWeight="700" fill="#4A154B" fontFamily="system-ui">Slack</text>
    </svg>
  )
}

function ZendeskLogo() {
  return (
    <svg viewBox="0 0 104 36" className="h-7 w-auto" aria-label="Zendesk">
      <circle cx="18" cy="18" r="14" fill="#03363D"/>
      <path d="M12 14 L12 22 L24 14 Z" fill="#03EAAE"/>
      <path d="M12 22 L24 22 L24 14 Z" fill="#3EFFC4"/>
      <text x="36" y="24" fontSize="13" fontWeight="700" fill="#03363D" fontFamily="system-ui" className="dark:fill-white">Zendesk</text>
    </svg>
  )
}

function SalesforceLogo() {
  return (
    <svg viewBox="0 0 118 36" className="h-7 w-auto" aria-label="Salesforce">
      <path d="M18 8c-3 0-5.5 1.7-7 4.2a5.5 5.5 0 00-3 9.8 5 5 0 009.3 1.7 4 4 0 006.5-.2 5 5 0 004.5-5 5 5 0 00-1-3 4.5 4.5 0 00-9.3-7.5z" fill="#00A1E0"/>
      <text x="36" y="24" fontSize="12" fontWeight="700" fill="#00A1E0" fontFamily="system-ui">Salesforce</text>
    </svg>
  )
}

function GoogleDriveLogo() {
  return (
    <svg viewBox="0 0 122 36" className="h-7 w-auto" aria-label="Google Drive">
      <polygon points="18,6 30,28 6,28" fill="none" stroke="#34A853" strokeWidth="0"/>
      <polygon points="18,6 30,28 24,28 12,6" fill="#34A853"/>
      <polygon points="6,28 18,6 12,6 0,28" fill="#4285F4" transform="translate(4,0)"/>
      <polygon points="4,28 30,28 27,22 7,22" fill="#FBBC04" transform="translate(4,0)"/>
      <text x="40" y="24" fontSize="12" fontWeight="600" fill="#5F6368" fontFamily="system-ui" className="dark:fill-gray-300">Google Drive</text>
    </svg>
  )
}

function GoogleCalendarLogo() {
  return (
    <svg viewBox="0 0 148 36" className="h-7 w-auto" aria-label="Google Calendar">
      <rect x="4" y="6" width="28" height="24" rx="3" fill="white" stroke="#DADCE0" strokeWidth="1.5"/>
      <rect x="4" y="6" width="28" height="8" rx="3" fill="#4285F4"/>
      <rect x="4" y="11" width="28" height="3" fill="#4285F4"/>
      <text x="12" y="26" fontSize="11" fontWeight="700" fill="#4285F4" fontFamily="system-ui">31</text>
      <rect x="10" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <rect x="23" y="8" width="3" height="5" rx="1.5" fill="white"/>
      <text x="40" y="24" fontSize="11" fontWeight="600" fill="#5F6368" fontFamily="system-ui" className="dark:fill-gray-300">Google Calendar</text>
    </svg>
  )
}

function GoogleMeetLogo() {
  return (
    <svg viewBox="0 0 124 36" className="h-7 w-auto" aria-label="Google Meet">
      <rect x="4" y="8" width="22" height="20" rx="4" fill="#00897B"/>
      <polygon points="26,13 34,9 34,27 26,23" fill="#00BFA5"/>
      <text x="40" y="24" fontSize="12" fontWeight="600" fill="#5F6368" fontFamily="system-ui" className="dark:fill-gray-300">Google Meet</text>
    </svg>
  )
}

function KlaviyoLogo() {
  return (
    <svg viewBox="0 0 96 36" className="h-7 w-auto" aria-label="Klaviyo">
      <circle cx="18" cy="18" r="14" fill="#231F20" className="dark:fill-gray-100"/>
      <path d="M12 10 L12 26 L18 19 L24 26 L24 10" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-gray-900"/>
      <text x="36" y="24" fontSize="14" fontWeight="700" fill="#231F20" fontFamily="system-ui" className="dark:fill-gray-200">Klaviyo</text>
    </svg>
  )
}

function IntercomLogo() {
  return (
    <svg viewBox="0 0 102 36" className="h-7 w-auto" aria-label="Intercom">
      <rect x="4" y="4" width="28" height="28" rx="7" fill="#286EFA"/>
      <path d="M10 12 L10 22 Q10 24 12 24 L24 24 L28 28 L28 24 Q30 24 30 22 L30 12 Q30 10 28 10 L12 10 Q10 10 10 12Z" fill="white" opacity="0.2"/>
      <circle cx="14" cy="18" r="2" fill="white"/>
      <circle cx="18" cy="18" r="2" fill="white"/>
      <circle cx="22" cy="18" r="2" fill="white"/>
      <text x="38" y="24" fontSize="13" fontWeight="700" fill="#286EFA" fontFamily="system-ui">Intercom</text>
    </svg>
  )
}

function WooCommerceLogo() {
  return (
    <svg viewBox="0 0 128 36" className="h-7 w-auto" aria-label="WooCommerce">
      <rect x="2" y="7" width="32" height="22" rx="5" fill="#7F54B3"/>
      <path d="M6 12 L10 20 L14 13 L18 20 L22 14 L26 22 L30 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="40" y="24" fontSize="11" fontWeight="700" fill="#7F54B3" fontFamily="system-ui">WooCommerce</text>
    </svg>
  )
}

function NotionLogo() {
  return (
    <svg viewBox="0 0 88 36" className="h-7 w-auto" aria-label="Notion">
      <rect x="4" y="4" width="28" height="28" rx="5" fill="#191919" className="dark:fill-gray-100"/>
      <path d="M10 10 L20 10 L26 16 L26 26 L10 26 Z" fill="none" stroke="white" strokeWidth="1.5" className="dark:stroke-gray-900"/>
      <path d="M10 10 L20 10 L20 16 L26 16" fill="none" stroke="white" strokeWidth="1.5" className="dark:stroke-gray-900"/>
      <text x="36" y="24" fontSize="14" fontWeight="700" fill="#191919" fontFamily="system-ui" className="dark:fill-gray-200">Notion</text>
    </svg>
  )
}

function AnthropicLogo() {
  return (
    <svg viewBox="0 0 114 36" className="h-7 w-auto" aria-label="Anthropic">
      <path d="M14 28 L18 10 L22 10 L26 28 L23 28 L22 24 L18 24 L17 28 Z M18.5 21 L21.5 21 L20 13 Z" fill="currentColor" className="text-gray-900 dark:text-gray-100"/>
      <text x="36" y="24" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="system-ui" className="text-gray-900 dark:text-gray-100">Anthropic</text>
    </svg>
  )
}

const BRAND_LOGOS = [
  { name: 'WhatsApp',        Component: WhatsAppLogo },
  { name: 'Meta',            Component: MetaLogo },
  { name: 'HubSpot',         Component: HubSpotLogo },
  { name: 'Calendly',        Component: CalendlyLogo },
  { name: 'OpenAI',          Component: OpenAILogo },
  { name: 'Zapier',          Component: ZapierLogo },
  { name: 'Shopify',         Component: ShopifyLogo },
  { name: 'n8n',             Component: N8nLogo },
  { name: 'Mercado Libre',   Component: MercadoLibreLogo },
  { name: 'Slack',           Component: SlackLogo },
  { name: 'Zendesk',         Component: ZendeskLogo },
  { name: 'Salesforce',      Component: SalesforceLogo },
  { name: 'Google Drive',    Component: GoogleDriveLogo },
  { name: 'Google Calendar', Component: GoogleCalendarLogo },
  { name: 'Google Meet',     Component: GoogleMeetLogo },
  { name: 'Klaviyo',         Component: KlaviyoLogo },
  { name: 'Intercom',        Component: IntercomLogo },
  { name: 'WooCommerce',     Component: WooCommerceLogo },
  { name: 'Notion',          Component: NotionLogo },
  { name: 'Anthropic',       Component: AnthropicLogo },
]

export default function SocialProof() {
  return (
    <section className="py-14 sm:py-24 bg-muted/10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Casos reales
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Empresas que ya automatizaron con nosotros
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-muted-foreground text-sm ml-2">5.0 promedio</span>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-custom transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0`}>
                  <t.icon className={`w-5 h-5 ${t.iconColor}`} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Integration brand logos — inline SVG, infinite scroll */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-8">
            Se integra con las herramientas que ya usás
          </p>
          <div
            className="relative overflow-hidden w-full"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            <div className="flex animate-marquee" style={{ width: 'max-content' }}>
              {[...BRAND_LOGOS, ...BRAND_LOGOS].map((brand, i) => (
                <div
                  key={`${brand.name}-${i}`}
                  className="flex items-center justify-center mx-5 shrink-0 opacity-90 hover:opacity-100 transition-opacity"
                  style={{ height: 44 }}
                >
                  <brand.Component />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
