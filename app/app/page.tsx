import HeroPrimary from '@/components/home/HeroPrimary'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedAgents from '@/components/home/FeaturedAgents'
import Benefits from '@/components/home/Benefits'
import SocialProof from '@/components/home/SocialProof'
import CasosPreview from '@/components/home/CasosPreview'
import WizardCTA from '@/components/home/WizardCTA'
import AgendaSection from '@/components/home/AgendaSection'
import CTASection from '@/components/home/CTASection'
import VideoSection from '@/components/home/VideoSection'

export default function HomePage() {
  return (
    <>
      <HeroPrimary />
      <HowItWorks />
      <VideoSection
        title="¿Qué es TuAgente Store?"
        subtitle="Entendé en minutos cómo funciona el marketplace de agentes IA y por qué tu negocio lo necesita."
        ctaLabel="Explorar Agentes"
        ctaHref="/agents"
      />
      <FeaturedAgents />
      <Benefits />
      <CasosPreview />
      <VideoSection
        title="¿Para qué sirve un Agente IA en tu negocio?"
        subtitle="Casos reales, beneficios concretos y cómo empezar a automatizar hoy sin código ni meses de desarrollo."
        ctaLabel="Reservar Diagnóstico Gratuito"
        ctaHref="/contact?type=diagnostico"
      />
      <WizardCTA />
      <SocialProof />
      <AgendaSection />
      <CTASection />
    </>
  )
}
