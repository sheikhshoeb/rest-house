"use client";

import React from "react";

const ACCENT = "#FF5722";
const BORDER = "#FF7A51"; // softer border tone

const FEATURES = [
  {
    title: "Dashboard view of bookings",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="6" height="6" rx="1.2" fill={ACCENT} />
        <rect x="15" y="3" width="6" height="6" rx="1.2" fill={ACCENT} />
        <rect x="3" y="15" width="6" height="6" rx="1.2" fill={ACCENT} />
        <rect x="15" y="15" width="6" height="6" rx="1.2" fill={ACCENT} />
      </svg>
    ),
  },
  {
    title: "Calendar integration",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" stroke={ACCENT} strokeWidth="1.6" />
        <path d="M16 3v4M8 3v4" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 11h5M7 15h5" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "One-click approvals/rejections",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v6" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M8 9v6a4 4 0 008 0V9"
          stroke={ACCENT}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 14l2-2 2 2"
          stroke={ACCENT}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Automated PDF/Excel reports",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="5" width="12" height="14" rx="1.5" stroke={ACCENT} strokeWidth="1.6" />
        <path d="M16 7v4h3" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="6.2" y="9.2" width="3.6" height="1.6" rx="0.4" fill={ACCENT} />
      </svg>
    ),
  },
  {
    title: "Offline and online sync",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 12a9 9 0 10-3.2 6.6"
          stroke={ACCENT}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M21 16v-4h-4" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M3 12a9 9 0 013.2-6.6"
          stroke={ACCENT}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 8v4h4" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function StaffFeatures() {
  return (
    <section className="w-full bg-white py-20 px-6 font-[Poppins]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Title */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0b1221] leading-tight">
          For Staff & Administrators
        </h2>

        {/* Underline */}
        <div className="flex justify-center mt-6">
          <span
            className="block rounded-full"
            style={{ width: 140, height: 6, background: ACCENT }}
          />
        </div>

        {/* Top row - 3 cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {FEATURES.slice(0, 3).map((f, idx) => (
            <article
              key={idx}
              className="flex items-center gap-6 border rounded-sm p-8"
              style={{ borderColor: BORDER }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0b1221]">{f.title}</h3>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom row - 2 centered cards */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8">
          {FEATURES.slice(3).map((f, idx) => (
            <article
              key={idx + 3}
              className="flex items-center gap-6 border rounded-sm p-8 w-full md:w-1/3"
              style={{ borderColor: BORDER, maxWidth: 520 }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {f.icon}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#0b1221]">{f.title}</h3>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
