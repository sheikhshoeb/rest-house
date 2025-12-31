"use client";

import React from "react";

const STEPS = [
  {
    title: "Access the Portal",
    desc:
      "Login securely with your registered credentials or by scanning the official QR code.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="6" height="6" stroke="#FF5722" strokeWidth="1.8" />
        <rect x="16" y="2" width="6" height="6" stroke="#FF5722" strokeWidth="1.8" />
        <rect x="2" y="16" width="6" height="6" stroke="#FF5722" strokeWidth="1.8" />
        <path
          d="M9 9h1v1H9zM12 3h1v1h-1zM12 6h1v1h-1zM12 9h1v1h-1z
             M15 3h1v1h-1zM15 6h1v1h-1zM15 9h1v1h-1z
             M9 12h1v1H9zM6 12h1v1H6zM3 12h1v1H3z"
          fill="#FF5722"
        />
      </svg>
    ),
  },
  {
    title: "Provide Stay Information",
    desc:
      "Fill in personal details along with intended dates of arrival and departure.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="4" width="8" height="12" stroke="#FF5722" strokeWidth="1.8" />
        <path d="M9 18h6" stroke="#FF5722" strokeWidth="1.8" />
        <rect x="8.5" y="7" width="3" height="3" fill="#FF5722" />
      </svg>
    ),
  },
  {
    title: "Choose Accommodation Type",
    desc:
      "Select from the available room categories such as Single, AC/Non-AC, Deluxe, or Duplex.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 11h2v6h12v-6h2v8H3v-8z"
          stroke="#FF5722"
          strokeWidth="1.6"
        />
        <path
          d="M8 11V7a4 4 0 118 0v4"
          stroke="#FF5722"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    title: "Receive Confirmation",
    desc:
      "A unique Booking ID is generated instantly, with facility to update or cancel as per rules.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#FF5722" strokeWidth="1.8" />
        <path
          d="M9 12.5l1.8 1.8L15 10"
          stroke="#FF5722"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
];

export default function ReserveAccommodation() {
  return (
    <section id="reserve-accomodation" className="w-full bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto px-6">

        {/* Title */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0b1221] leading-tight">
          Reserve Government Accommodation
        </h2>

        {/* Underline */}
        <div className="flex justify-center mt-6">
          <span
            className="block h-2 rounded-full"
            style={{ width: 140, background: "#FF5722" }}
          />
        </div>

        {/* Cards Row */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="border border-[#FF5722] rounded-md bg-white p-10 text-center flex flex-col items-center"
              style={{
                boxShadow:
                  "0 40px 60px rgba(11,18,33,0.06), 0 14px 28px rgba(11,18,33,0.04)",
              }}
            >
              {/* Icon */}
              <div className="mb-6 text-[#FF5722]">{step.icon}</div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-extrabold text-[#0b1221]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm md:text-base text-[#676767] leading-relaxed max-w-[16rem] mx-auto">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
