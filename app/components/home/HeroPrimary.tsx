'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ArrowRight, Zap, Bot, TrendingUp, Shield, Plug } from 'lucide-react'
import { trackClick } from '@/lib/analytics'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import dynamic from 'next/dynamic'

const SystemDiagram = dynamic(() => import('./SystemDiagram'), { ssr: false })

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ROTATING_PAIN = ['responder tarde', 'perder leads', 'sin seguimiento', 'operar sin datos']

const LIVE_STATS = [
  { icon: Bot, label: 'Agentes listos', value: '7+' },
  { icon: TrendingUp, label: 'Setup en 24h', value: '24h' },
  { icon: Shield, label: 'Disponibilidad', value: '24/7' },
  { icon: Plug, label: 'Integración real', value: 'WA+CRM' },
]


export default function HeroPrimary() {
  const [wordIndex, setWordIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIndex(i => (i + 1) % ROTATING_PAIN.length)
        setVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, delay: 0.1 })

    tl
      .fromTo('.hero-badge',     { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.4 })
      .fromTo('.hero-title',     { autoAlpha: 0, y: 32 },  { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.15')
      .fromTo('.hero-h2',        { autoAlpha: 0, y: 16 },  { autoAlpha: 1, y: 0, duration: 0.45 }, '-=0.25')
      .fromTo('.hero-sub',       { autoAlpha: 0, y: 20 },  { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.hero-ctas',      { autoAlpha: 0, y: 16 },  { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2')
      .fromTo('.hero-microproof',{ autoAlpha: 0 },          { autoAlpha: 1, duration: 0.3 }, '-=0.15')
      .fromTo('.hero-stat',      { autoAlpha: 0, y: 20 },  { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.15')
      .fromTo('.hero-card',      { autoAlpha: 0, y: 44 },  { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15 }, '-=0.15')

    gsap.to('.hero-orb-1', {
      y: -80, ease: 'none',
      scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
    })
    gsap.to('.hero-orb-2', {
      y: 50, ease: 'none',
      scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 1.5 },
    })
    gsap.to('.hero-orb-3', {
      y: 30, ease: 'none',
      scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 2 },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-background min-h-[80vh] sm:min-h-[92vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
      <div className="hero-orb-1 glow-orb w-[600px] h-[600px] bg-blue-600/8 -top-40 -left-40" />
      <div className="hero-orb-2 glow-orb w-[500px] h-[500px] bg-indigo-600/6 top-1/2 -right-60" />
      <div className="hero-orb-3 glow-orb w-[300px] h-[300px] bg-violet-600/5 bottom-20 left-1/3" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Sistema agéntico activo en 24 horas
          </div>

          {/* Headline con pain point rotado */}
          <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6">
            Tu negocio ya vende.
            <br />
            El problema es{' '}
            <span
              className="text-gradient-hero inline-block transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              {ROTATING_PAIN[wordIndex]}
            </span>
            .
          </h1>

          {/* Value prop subtitle */}
          <h2 className="hero-h2 text-xl sm:text-2xl font-semibold text-foreground/80 mb-4 leading-snug">
            El marketplace de sistemas agénticos.{' '}
            <span className="text-foreground">Activamos agentes IA en tu operación en menos de 48h.</span>
          </h2>

          {/* Subheadline */}
          <p className="hero-sub text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            TuAgente Store implementa sistemas agénticos para empresas que ya tienen operación
            pero todavía dependen de personas para cada tarea repetitiva.
            <span className="text-foreground font-medium"> Sin código. Con impacto desde la primera semana.</span>
          </p>

          {/* CTAs */}
          <div className="hero-ctas flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/marketplace"
              onClick={() => trackClick('Mirá cómo se ve el sistema', { page: '/', metadata: { section: 'hero', position: 'primary_cta' } })}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Mirá cómo se ve el sistema
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://calendly.com/tuagentestore-info/30min"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('Agendá tu diagnóstico', { page: '/', metadata: { section: 'hero', position: 'secondary_cta' } })}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-base hover:border-primary/50 hover:bg-muted transition-all"
            >
              Agendá tu diagnóstico
            </a>
          </div>

          {/* Microproof */}
          <p className="hero-microproof text-sm text-muted-foreground mb-12">
            Desde <span className="font-semibold text-foreground">USD 397/mes</span> · Setup guiado · Soporte en español · Integraciones reales
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {LIVE_STATS.map((stat) => (
              <div key={stat.label} className="hero-stat flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — system diagram */}
        <div className="hero-card mt-10 sm:mt-20 relative max-w-[420px] mx-auto">
          <SystemDiagram />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
