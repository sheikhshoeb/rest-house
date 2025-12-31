// apps/web/app/(main)/home/page.js  (SERVER component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// import your components as before
import HeroSection from "../../../components/HeroSection";
import ExploreProperty from "../../../components/ExploreProperty";
import SalientFeatures from "../../../components/SalientFeatures";
import ReserveAccommodation from "../../../components/ReserveAccommodation";
import MobileShowcase from "../../../components/MobileShowcase";
import StaffFeatures from "../../../components/StaffFeatures";
import Benefits from "../../../components/Benefits";
import CTABookNow from "../../../components/CTABookNow";

export default async function DashboardPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

  // 1) Read cookies on the server
  const cookieStore = await cookies();
  const arr =
    cookieStore && typeof cookieStore.getAll === "function"
      ? cookieStore.getAll()
      : [];
  const cookieHeader = arr.map((c) => `${c.name}=${c.value}`).join("; ");

  // 2) If no cookie -> redirect to login
  if (!cookieHeader || cookieHeader.trim() === "") {
    redirect("/login");
  }

  // 3) Validate session with backend
  try {
    const res = await fetch(`${apiBase}/api/auth/me`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok) {
      // invalid / expired token -> redirect to login
      redirect("/login");
    }

    // Optionally, you can get the user object:
    // const { user } = await res.json().catch(() => ({}))
  } catch (err) {
    // network error / API down -> treat as unauthenticated
    console.warn("dashboard auth check failed:", err);
    redirect("/login");
  }

  // 4) If we reached here, user is authenticated -> render dashboard
  return (
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
  );
}
