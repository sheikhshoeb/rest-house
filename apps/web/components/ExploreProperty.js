"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Helpers: produce YYYY-MM-DD string for India time (IST)
 */
function todayISTYYYYMMDD() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function addDaysYYYYMMDD(yyyyMmDd, days) {
  const parts = yyyyMmDd.split("-").map((p) => Number(p));
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Categories */
const CATEGORIES = ["General", "VIP", "VVIP"];

function isCategory(v) {
  return CATEGORIES.includes(v);
}

export default function ExploreProperty() {
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState("");

  const [category, setCategory] = useState("General");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef(null);

  // Init dates
  const initialCheckIn = todayISTYYYYMMDD();
  const initialCheckOut = addDaysYYYYMMDD(initialCheckIn, 1);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const minCheckIn = initialCheckIn;
  const minCheckOut = addDaysYYYYMMDD(checkIn, 1);

  const router = useRouter();

  // Load locations
  useEffect(() => {
    let mounted = true;

    async function loadZones() {
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        const res = await fetch(`${API_BASE}/api/zones`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to load zones");

        const data = await res.json();

        if (!mounted) return;

        setLocations(data);
        setLocation(data[0] || "");
      } catch (err) {
        console.error("Zone fetch failed:", err);

        // optional fallback
        const fallback = [
          "Amravati",
          "Chandrapur",
          "Kolhapur",
          "Nashik",
          "Pune",
          "Thane",
          "Vashi",
        ];

        if (!mounted) return;
        setLocations(fallback);
        setLocation(fallback[0]);
      }
    }

    loadZones();

    return () => {
      mounted = false;
    };
  }, []);

  function handleCheckInChange(value) {
    setCheckIn(value);
    const nextMin = addDaysYYYYMMDD(value, 1);
    if (checkOut < nextMin) setCheckOut(nextMin);
  }

  function onExplore(e) {
    e.preventDefault();

    if (!location) return;

    const params = new URLSearchParams({
      location,
      category,
      adults: String(adults),
      children: String(children),
      checkIn,
      checkOut,
    });

    router.push(`/explore?${params.toString()}`);
  }

  // Close dropdown on outside click or ESC
  useEffect(() => {
    function onDocClick(e) {
      if (!guestsRef.current) return;
      if (!guestsRef.current.contains(e.target)) {
        setGuestsOpen(false);
      }
    }

    function onEsc(e) {
      if (e.key === "Escape") setGuestsOpen(false);
    }

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function guestLabel() {
    const adultPart = `${adults} Adult${adults > 1 ? "s" : ""}`;
    const childPart =
      children > 0 ? ` | ${children} Child${children > 1 ? "ren" : ""}` : "";
    return `${adultPart}${childPart}`;
  }

  // Shared icon
  const ChevronIcon = ({ className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 ${className}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <section className="w-full bg-[#10375C] py-16 px-4 flex flex-col items-center font-[Poppins]">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center">
        WHAT DO YOU NEED?
      </h2>

      <form onSubmit={onExplore} className="w-full max-w-5xl mt-10 space-y-10">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location */}
          <div>
            <label className="text-white font-semibold text-sm block mb-2">
              Location
            </label>

            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white h-12 px-4 pr-10 rounded-xl text-[#676767] outline-none appearance-none"
              >
                {locations.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#676767]">
                <ChevronIcon />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-white font-semibold text-sm block mb-2">
              Category
            </label>

            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isCategory(v)) setCategory(v);
                }}
                className="w-full bg-white h-12 px-4 pr-10 rounded-xl text-[#676767] outline-none appearance-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#676767]">
                <ChevronIcon />
              </div>
            </div>
          </div>

          {/* Guests */}
          <div ref={guestsRef} className="relative">
            <label className="text-white font-semibold text-sm block mb-2">
              No. of Guest
            </label>

            <button
              type="button"
              onClick={() => setGuestsOpen((s) => !s)}
              aria-expanded={guestsOpen}
              className="w-full bg-white h-12 px-4 rounded-xl flex items-center justify-between text-[#676767]"
            >
              <span>{guestLabel()}</span>
              <div
                className={`${
                  guestsOpen ? "rotate-180" : "rotate-0"
                } transition-transform`}
              >
                <ChevronIcon />
              </div>
            </button>

            {guestsOpen && (
              <div
                role="dialog"
                className="absolute z-50 left-0 w-full mt-2 bg-white rounded-xl shadow-lg p-4"
              >
                {/* Adults */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-[#10375C]">
                      Adults
                    </div>
                    <div className="text-xs text-[#676767]">Ages 13+</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults((a) => Math.max(1, a - 1))}
                      className="min-w-[36px] h-9 rounded-md border border-gray-200 cursor-pointer"
                    >
                      −
                    </button>
                    <div className="w-8 text-center">{adults}</div>
                    <button
                      type="button"
                      onClick={() => setAdults((a) => a + 1)}
                      className="min-w-[36px] h-9 rounded-md border border-gray-200 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <hr className="my-2" />

                {/* Children */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-[#10375C]">
                      Children
                    </div>
                    <div className="text-xs text-[#676767]">Ages 0–12</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChildren((c) => Math.max(0, c - 1))}
                      className="min-w-[36px] h-9 rounded-md border border-gray-200 cursor-pointer"
                    >
                      −
                    </button>
                    <div className="w-8 text-center">{children}</div>
                    <button
                      type="button"
                      onClick={() => setChildren((c) => c + 1)}
                      className="min-w-[36px] h-9 rounded-md border border-gray-200 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setGuestsOpen(false)}
                    className="px-4 py-2 rounded-md bg-[#FF5722] text-white cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-white font-semibold text-sm block mb-2">
              Check in
            </label>
            <input
              type="date"
              value={checkIn}
              min={minCheckIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full h-12 bg-white rounded-xl px-4 text-[#676767]"
            />
          </div>

          <div>
            <label className="text-white font-semibold text-sm block mb-2">
              Check out
            </label>
            <input
              type="date"
              value={checkOut}
              min={minCheckOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full h-12 bg-white rounded-xl px-4 text-[#676767]"
            />
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md px-6 py-3 shadow-sm
                       text-white text-lg font-semibold bg-[#FF5722] hover:bg-[#e64b1f] transition cursor-pointer"
          >
            Explore Property
          </button>
        </div>
      </form>
    </section>
  );
}
