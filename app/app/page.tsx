import HeroPrimary from '@/components/home/HeroPrimary'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedAgents from '@/components/home/FeaturedAgents'
import Benefits from '@/components/home/Benefits'
import SocialProof from '@/components/home/SocialProof'
import CasosPreview from '@/components/home/CasosPreview'
import WizardCTA from '@/components/home/WizardCTA'
import AgendaSection from '@/components/home/AgendaSection'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroPrimary />
      <HowItWorks />
      <FeaturedAgents />
      <Benefits />
      <CasosPreview />
      <WizardCTA />
      <SocialProof />
      <AgendaSection />
      <CTASection />
    </>
  )
}
