import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { ChatPreviewSection } from "@/components/landing/chat-preview";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";

/**
 * Public landing page — accessible without authentication.
 * Route: /  (added to public routes in middleware.ts)
 *
 * Structure:
 *  1. Sticky blur navbar
 *  2. Hero — gradient headline + floating chat mockup
 *  3. Features — glass cards grid
 *  4. Chat preview — live-feeling fake conversation
 *  5. CTA — gradient glow call-to-action
 *  6. Footer — minimal dark
 */
export default function LandingPage() {
  return (
    <main className="bg-lbg">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <ChatPreviewSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
