import HeroPrimary from '@/components/home/HeroPrimary'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedAgents from '@/components/home/FeaturedAgents'
import Benefits from '@/components/home/Benefits'
import SocialProof from '@/components/home/SocialProof'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroPrimary />
      <HowItWorks />
      <FeaturedAgents />
      <Benefits />
      <SocialProof />
      <CTASection />
    </>
  )
}
