"use client";

import React from "react";

/**
 * Colors used:
 * - darkBlue: #10375C
 * - white: #FFFFFF
 * - accent: #FF5722
 * - muted: #676767
 *
 * Uses Tailwind utility classes. Ensure Poppins (or your chosen font) is loaded globally.
 */

const FEATURES = [
  "Mobile-Friendly – Book rooms easily from your phone.",
  "Booking History – Track past and upcoming stays.",
  "Bilingual Support – Available in English & Marathi.",
  "Live Availability – View rooms in real time.",
  "Instant Confirmation – Get booking ID immediately.",
  "Secure Login – Encrypted and safe access.",
];

export default function SalientFeatures() {
  return (
    <section id="salient-features" className="w-full bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto px-6">

        {/* Title */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0b1221] leading-tight">
          Salient Features Of The Online Portal
        </h2>

        {/* Orange underline */}
        <div className="flex justify-center mt-6">
          <span
            className="block h-2 rounded-full"
            style={{ width: 140, background: "#FF5722" }}
          />
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-10">
          {FEATURES.map((text, idx) => (
            <div key={idx} className="relative group">
              
              {/* Left vertical pill */}
              <div
                aria-hidden
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-14 rounded-md"
                style={{ background: "#FF5722" }}
              />

              {/* Card */}
              <div
                className="border border-[#FF5722] rounded-sm bg-white pl-10 pr-6 py-8"
                style={{ boxShadow: "none" }}
              >
                <div className="w-[60%] mx-auto">
                  <p className="text-[#0b1221] text-lg md:text-xl font-semibold leading-tight">
                    {text}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
