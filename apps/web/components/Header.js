"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// stable, top-level menu arrays (won't change per render)
const LEFT_MENU = [
  { label: "Home", href: "/home" },
  { label: "Features", href: "/features" }, // note: keep href for non-home navigation
  { label: "About", href: "/about" },
  { label: "Booking", href: "/booking" },
];

const RIGHT_MENU = [
  { label: "Profile", href: "/profile" },
  { label: "Contact", href: "/contact" },
];

// combined stable array for active detection
const COMBINED_MENU = [...LEFT_MENU, ...RIGHT_MENU];

export default function Header() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  // derive active label from the current pathname
  const active = useMemo(() => {
    // exact match first
    const exact = COMBINED_MENU.find((m) => m.href === pathname);
    if (exact) return exact.label;
    // find menu whose href is a prefix of pathname (for nested routes)
    const pref = COMBINED_MENU.find(
      (m) => m.href !== "/" && pathname.startsWith(m.href)
    );
    if (pref) return pref.label;
    // default to Home
    return "Home";
  }, [pathname]);

  async function logout() {
    try {
      // Call server to clear the HttpOnly cookie
      const res = await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // important so the cookie is sent and cleared by server
      });

      // ignore body; proceed to redirect even if server had an issue
      // but log a warning if it wasn't ok (helpful during dev)
      if (!res.ok) {
        console.warn(
          "Logout call failed",
          await res.text().catch(() => "no body")
        );
      }
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      // always redirect to login and close mobile
      setMobileOpen(false);
      router.replace("/login");
    }
  }

  function closeMobileAndNavigate(href) {
    setMobileOpen(false);
    router.push(href);
  }

  // -- handle click for "Features" so we can smooth-scroll to the section if already on home
  function handleFeaturesClick(e) {
    const onDashboard = pathname === "/home" || pathname === "/";
    if (onDashboard) {
      e.preventDefault();
      const el = document.getElementById("salient-features");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileOpen(false);
      } else {
        router.push("/home#salient-features");
        setMobileOpen(false);
      }
    } else {
      e.preventDefault();
      router.push("/home#salient-features");
      setMobileOpen(false);
    }
  }

  // -- NEW: handle click for "About" so we can smooth-scroll to the ReserveAccomodation section if on home
  function handleAboutClick(e) {
    const onDashboard = pathname === "/home" || pathname === "/";
    // primary id (based on your file name) and a secondary spelled-correct variant
    const primaryId = "reserve-accomodation"; // user added this id
    const altId = "reserve-accommodation"; // possible alternative

    if (onDashboard) {
      e.preventDefault();
      let el = document.getElementById(primaryId);
      if (!el) el = document.getElementById(altId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileOpen(false);
      } else {
        // fallback: navigate to anchor (ensures correct URL if element not present)
        router.push(`/home#${primaryId}`);
        setMobileOpen(false);
      }
    } else {
      e.preventDefault();
      router.push(`/home#${primaryId}`);
      setMobileOpen(false);
    }
  }

  // Reusable class generator for desktop links (keeps your look)
  function menuClass(
    label,
    base = "text-sm font-semibold tracking-wide transition-colors"
  ) {
    const isActive = active === label;
    if (isActive) {
      // orange text + underline bar
      return (
        base +
        ' text-[#FF5722] after:content-[""] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-6 after:h-[2px] after:bg-[#FF5722]'
      );
    }
    return base + " text-white hover:text-[#FF5722]";
  }

  return (
    <header
      className="relative bg-[#10375C] text-white overflow-visible pb-0 z-50"
      aria-label="site header"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* LEFT: Logo + nav */}
          <div className="flex items-center gap-8">
            {/* Replace with your logo if you have one */}
            {/* <Link href="/home" className="text-xl font-bold text-white mr-4 hidden md:inline">
              Rest House
            </Link> */}

            {/* Desktop nav (hidden on mobile) */}
            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="main navigation"
            >
              {LEFT_MENU.map((item) => {
                // Attach special handler for Features
                if (item.label === "Features") {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={handleFeaturesClick}
                      className={"relative " + menuClass(item.label)}
                      aria-current={active === item.label ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  );
                }

                // Attach special handler for About
                if (item.label === "About") {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={handleAboutClick}
                      className={"relative " + menuClass(item.label)}
                      aria-current={active === item.label ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={"relative " + menuClass(item.label)}
                    aria-current={active === item.label ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: actions (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {RIGHT_MENU.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={"relative " + menuClass(item.label)}
                aria-current={active === item.label ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={logout}
              className="ml-2 bg-rose-500 text-white px-3 py-1 rounded text-sm font-semibold"
              aria-label="Logout"
            >
              Logout
            </button>

            {/* EN dropdown placeholder */}
            <div className="relative">
              <button
                type="button"
                className="text-sm font-medium flex items-center gap-2 hover:text-[#FF5722] focus:outline-none font-semibold"
                aria-haspopup="menu"
                aria-label="Language"
              >
                EN
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.25 7.5L10 12.25 14.75 7.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen((s) => !s)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-md bg-transparent border border-white/10"
            >
              {/* white hamburger / close icon */}
              {mobileOpen ? (
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center semicircle (absolutely positioned) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ bottom: "-40px" }}
        aria-hidden="true"
      >
        <div className="w-40 h-20 bg-[#10375C] rounded-b-full" />
      </div>

      {/* MOBILE PANEL (full screen overlay) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transform transition-all ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* background */}
        <div
          className="absolute inset-0 bg-[#10375C] bg-opacity-100"
          onClick={() => setMobileOpen(false)}
        />

        <div className="relative h-full overflow-auto">
          <div className="px-6 pt-8 pb-12">
            <div className="flex items:center justify-between">
              <div className="text-white text-xl font-bold">Rest House</div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-md"
              >
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <nav
              className="mt-10 flex flex-col gap-6"
              aria-label="mobile navigation"
            >
              {[...LEFT_MENU, ...RIGHT_MENU].map((item) => {
                const isActive = active === item.label;

                // mobile Features button — use same handler (navigates or scrolls)
                if (item.label === "Features") {
                  return (
                    <button
                      key={item.label}
                      onClick={(e) => {
                        const onDashboard =
                          pathname === "/home" || pathname === "/";
                        if (onDashboard) {
                          setMobileOpen(false);
                          const el =
                            document.getElementById("salient-features");
                          if (el)
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          else router.push("/home#salient-features");
                        } else {
                          setMobileOpen(false);
                          router.push("/home#salient-features");
                        }
                      }}
                      className={`w-full text-left text-white text-lg font-semibold py-3 px-4 rounded ${
                        isActive
                          ? "text-[#FF5722]"
                          : "text-white/95 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }

                // mobile About button — use same handler for ReserveAccomodation target
                if (item.label === "About") {
                  return (
                    <button
                      key={item.label}
                      onClick={(e) => {
                        const onDashboard =
                          pathname === "/home" || pathname === "/";
                        const primaryId = "reserve-accomodation";
                        const altId = "reserve-accommodation";
                        if (onDashboard) {
                          setMobileOpen(false);
                          let el = document.getElementById(primaryId);
                          if (!el) el = document.getElementById(altId);
                          if (el)
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          else router.push(`/home#${primaryId}`);
                        } else {
                          setMobileOpen(false);
                          router.push(`/home#${primaryId}`);
                        }
                      }}
                      className={`w-full text-left text-white text-lg font-semibold py-3 px-4 rounded ${
                        isActive
                          ? "text-[#FF5722]"
                          : "text-white/95 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => closeMobileAndNavigate(item.href)}
                    className={`w-full text-left text-white text-lg font-semibold py-3 px-4 rounded ${
                      isActive
                        ? "text-[#FF5722]"
                        : "text-white/95 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <button
                onClick={logout}
                className="w-full text-left text-white text-lg font-semibold py-3 px-4 rounded hover:text-white/90"
              >
                Logout
              </button>

              <div className="mt-4">
                <label className="text-sm text-white/90 mb-2 block">
                  Language
                </label>
                <div className="flex gap-3">
                  <button className="px-3 py-2 rounded bg-white/10 text-white">
                    EN
                  </button>
                  <button className="px-3 py-2 rounded bg-white/10 text-white">
                    MR
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
