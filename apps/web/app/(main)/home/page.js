// apps/web/app/(main)/home/page.js
import AuthGuard from "../../../components/AuthGuard";

import HeroSection from "../../../components/HeroSection";
import ExploreProperty from "../../../components/ExploreProperty";
import SalientFeatures from "../../../components/SalientFeatures";
import ReserveAccommodation from "../../../components/ReserveAccommodation";
import MobileShowcase from "../../../components/MobileShowcase";
import StaffFeatures from "../../../components/StaffFeatures";
import Benefits from "../../../components/Benefits";
import CTABookNow from "../../../components/CTABookNow";

export default function HomePage() {
  return (
    <AuthGuard>
      <main>
        <HeroSection />
        <ExploreProperty />
        <SalientFeatures />
        <ReserveAccommodation />
        <MobileShowcase />
        <StaffFeatures />
        <Benefits />
        <CTABookNow />
      </main>
    </AuthGuard>
  );
}
