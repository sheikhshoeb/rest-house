"use client";

import React from "react";

/**
 * CTA section — centered headline + button
 */
export default function CTABookNow({
  title = "Ready to Book Your Next Stay?",
  buttonLabel = "Book Now",
  onClick,
}) {
  return (
    <section className="w-full bg-white py-12 md:py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0b1221] leading-tight">
          {title}
        </h2>

        <div className="mt-8">
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center justify-center rounded-md px-6 py-3 shadow-sm
                       text-white text-lg font-semibold bg-[#FF5722] hover:bg-[#e64b1f] transition"
            aria-label={buttonLabel}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
