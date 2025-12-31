"use client";

import React from "react";

const DARK = "#10375C";
const ACCENT = "#FF5722";

export default function MobileShowcase({
  images = ["/images/mobile-1.png", "/images/mobile-2.png", "/images/mobile-3.png"],
  altTexts = [
    "QR scan booking access",
    "Clean personal details form",
    "Simple confirmation screen with ID",
  ],
  scaleOverrides = [1, 1.06, 1],
}) {
  const phoneWidth = 240; // px
  const phoneHeight = 480; // px

  return (
    <section className="w-full bg-white relative overflow-hidden font-[Poppins]">
      <div className="mx-auto">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0b1221] leading-tight">
          Designed for Ease. Built for Speed.
        </h2>

        <div className="flex justify-center mt-4">
          <span
            className="block rounded-full"
            style={{ width: 120, height: 6, background: ACCENT }}
          />
        </div>

        {/* Showcase Section */}
        <div className="relative mt-20 md:mt-28">
          {/* Lower dark background */}
          <div
            aria-hidden
            className="absolute left-0 right-0"
            style={{
              height: "56%",
              top: "44%",
              background: DARK,
            }}
          />

          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end">
              {Array.from({ length: 3 }).map((_, i) => {
                const src = images[i] || images[0];
                const alt = altTexts[i] || `mobile-${i + 1}`;
                const scale = scaleOverrides[i] || 1;

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center md:-translate-y-8 lg:-translate-y-12"
                  >
                    {/* Image Box */}
                    <div
                      role="img"
                      aria-label={alt}
                      style={{
                        width: `${phoneWidth}px`,
                        height: `${phoneHeight}px`,
                        overflow: "hidden",
                        borderRadius: 24,
                        backgroundImage: `url(${src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        transform: `scale(${scale})`,
                        transformOrigin: "center center",
                      }}
                    />

                    {/* Caption */}
                    <div className="mt-6 text-center">
                      <div className="text-base md:text-lg font-semibold text-white">
                        {altTexts[i]}
                      </div>
                      <div className="flex justify-center mt-3">
                        <span
                          className="block rounded-full"
                          style={{ width: 48, height: 4, background: ACCENT }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
