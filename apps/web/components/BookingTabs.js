"use client";
import React from "react";

const tabs = [
  { key: "upcoming", label: "Upcoming" },
  { key: "cancelled", label: "Cancelled" },
  { key: "completed", label: "Completed" },
];

export default function BookingTabs({ value, onChange }) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <nav className="flex gap-10 items-end px-4 sm:px-0">
        {tabs.map((t) => {
          const active = t.key === value;

          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`text-xl font-semibold pb-3 focus:outline-none ${
                active ? "text-[#0b1221]" : "text-gray-800/80"
              }`}
            >
              <div className="relative">
                <span>{t.label}</span>

                {active && (
                  <span className="absolute left-0 -bottom-3 w-16 h-1 rounded bg-sky-800"></span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
