import Link from 'next/link'
import { TrendingUp, MessageSquare, Megaphone, ShoppingCart, Users, Settings } from 'lucide-react'

const PROBLEMS = [
  { id: 'ventas',      label: 'Más ventas',    icon: TrendingUp,    color: 'text-blue-400',   border: 'border-blue-500/30',   bg: 'hover:bg-blue-500/10' },
  { id: 'soporte',     label: 'Soporte 24/7',  icon: MessageSquare, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'hover:bg-indigo-500/10' },
  { id: 'marketing',  label: 'Marketing',      icon: Megaphone,     color: 'text-violet-400', border: 'border-violet-500/30', bg: 'hover:bg-violet-500/10' },
  { id: 'ecommerce',   label: 'E-commerce',    icon: ShoppingCart,  color: 'text-purple-400', border: 'border-purple-500/30', bg: 'hover:bg-purple-500/10' },
  { id: 'leads',       label: 'Captar leads',  icon: Users,         color: 'text-cyan-400',   border: 'border-cyan-500/30',   bg: 'hover:bg-cyan-500/10' },
  { id: 'operaciones', label: 'Operaciones',   icon: Settings,      color: 'text-emerald-400',border: 'border-emerald-500/30',bg: 'hover:bg-emerald-500/10' },
]

export default function ProblemChips() {
  return (
    <section className="py-8 sm:py-10 bg-background border-b border-border/50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-5 font-medium">
          ¿Cuál es tu principal desafío?
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {PROBLEMS.map(p => (
            <Link
              key={p.id}
              href={`/para/${p.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card text-sm font-medium transition-all ${p.border} ${p.bg} ${p.color} hover:scale-[1.03]`}
            >
              <p.icon className="w-4 h-4" />
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
