import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrackingSection } from "@/components/tracking-section"
import { ServicesSection } from "@/components/services-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { MapSection } from "@/components/map-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export const dynamic = "force-dynamic"

async function getServices() {
  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error("Failed to fetch services");
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

async function getWarehouses() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warehouses`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error: any) {
    console.error("Failed to fetch warehouses:", error);
    return [];
  }
}

export default async function HomePage() {
  const [servicesData, warehousesData] = await Promise.all([
    getServices(),
    getWarehouses()
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrackingSection />
        <ServicesSection data={servicesData} />
        <FeaturesSection />
        <StatsSection />
        <MapSection data={warehousesData} />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
