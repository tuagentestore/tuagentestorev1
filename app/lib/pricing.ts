export const PLANS = {
  starter: {
    key: 'starter',
    label: 'Starter',
    price: 397,
    priceAnnual: 330,
    display: '$397/mes',
  },
  professional: {
    key: 'professional',
    label: 'Professional',
    price: 597,
    priceAnnual: 497,
    display: '$597/mes',
  },
  enterprise: {
    key: 'enterprise',
    label: 'Enterprise',
    price: null,
    priceAnnual: null,
    display: 'Cotizar',
  },
} as const

export type PlanKey = keyof typeof PLANS

export const AGENT_PRICING = {
  basic: PLANS.starter.price,
  pro: PLANS.professional.price,
} as const
