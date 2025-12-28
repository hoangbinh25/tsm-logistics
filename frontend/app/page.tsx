import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrackingSection } from "@/components/tracking-section"
import { ServicesSection } from "@/components/services-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { MapSection } from "@/components/map-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrackingSection />
        <ServicesSection />
        <FeaturesSection />
        <StatsSection />
        <MapSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
