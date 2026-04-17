'use client'
import Link from 'next/link'
import { ArrowRight, Zap, Bot, TrendingUp, Shield, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

const ROTATING_WORDS = ['Ventas', 'Soporte', 'Marketing', 'Leads', 'Clientes']

const LIVE_STATS = [
  { icon: Bot, label: 'Agentes activos', value: '6+' },
  { icon: TrendingUp, label: 'Tiempo de setup', value: '24h' },
  { icon: Shield, label: 'Disponibilidad', value: '24/7' },
]

export default function HeroPrimary() {
  const [wordIdx, setWordIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATING_WORDS.length)
        setVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden bg-background min-h-[92vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
      <div className="glow-orb w-[600px] h-[600px] bg-blue-600/8 -top-40 -left-40" />
      <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/6 top-1/2 -right-60" />
      <div className="glow-orb w-[300px] h-[300px] bg-violet-600/5 bottom-20 left-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Marketplace de Agentes IA — Listos en 24h
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6">
            Automatizá tu{' '}
            <span
              className="text-gradient-hero inline-block transition-all duration-300"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-8px)' }}
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
            <br />
            con Agentes IA
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Encontrá, probá y activá agentes IA especializados para tu negocio.
            Sin programación. Sin meses de desarrollo.
            <span className="text-foreground font-medium"> Funcionando en 24 horas.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/agents"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Explorar Agentes
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact?type=demo"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-base hover:border-primary/50 hover:bg-muted transition-all"
            >
              <Calendar className="w-5 h-5 text-primary" />
              Agendar Demo Gratuita
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {LIVE_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
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

        {/* Hero visual — animated agent cards */}
        <div className="mt-20 relative max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Sales AI Closer', category: 'Ventas', color: 'from-blue-500 to-indigo-500', active: true },
              { name: 'AI Support Agent', category: 'Soporte', color: 'from-violet-500 to-purple-500', active: true },
              { name: 'AI Lead Engine', category: 'Leads', color: 'from-indigo-500 to-blue-600', active: false },
            ].map((agent, i) => (
              <div
                key={agent.name}
                className={`bg-card border border-border rounded-2xl p-5 transition-all duration-500 hover:border-primary/40 hover:shadow-custom ${
                  i === 1 ? 'translate-y-[-8px]' : ''
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-3`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs text-muted-foreground mb-1">{agent.category}</div>
                <div className="font-semibold text-foreground text-sm leading-tight mb-3">{agent.name}</div>
                <div className={`flex items-center gap-1.5 text-xs ${agent.active ? 'text-green-400' : 'text-muted-foreground'}`}>
                  <span className={`w-2 h-2 rounded-full ${agent.active ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground'}`} />
                  {agent.active ? 'Activo' : 'Próximo'}
                </div>
              </div>
            ))}
          </div>
          {/* Gradient fade bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
