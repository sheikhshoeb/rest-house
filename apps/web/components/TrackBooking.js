"use client";

import React from "react";

export default function TrackBooking() {
  const progress = 25;

  const steps = [
    { id: "submitted", label: "Reservation Submitted", completed: true },

    {
      id: "pending",
      label: progress > 25 ? "Approved" : "Pending Approval",
      completed: progress > 25,
    },

    {
      id: "payment",
      label: progress > 50 ? "Paid" : "Payment",
      completed: progress > 50,
    },

    {
      id: "checkedin",
      label: "Checked In",
      completed: false,
    },
  ];

  return (
    <section className="w-full bg-white py-40 px-6 font-[Poppins]">
      <div className="max-w-6xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold leading-tight text-[#10375C]">
          Track Your Booking In Real -Time
        </h2>

        {/* Steps */}
        <div className="mt-12 flex flex-col items-center">
          <div className="w-full max-w-4xl">

            <div className="flex items-center justify-between">
              {steps.map((s) => {
                const isGrey = s.id === "payment" && progress < 75;

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 w-1/4 justify-center"
                  >
                    {/* Icon */}
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 56 56"
                      fill="none"
                      aria-hidden
                    >
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill={s.completed && !isGrey ? "#FFFFFF" : "#F0F0F0"}
                        stroke={s.completed && !isGrey ? "#10375C" : "#C5C5C5"}
                        strokeWidth="3"
                      />

                      <path
                        d="M20 28l5 5L36 22"
                        stroke={s.completed && !isGrey ? "#10375C" : "#B0B0B0"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Label */}
                    <div className="text-sm md:text-base text-[#111827] font-medium text-left">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-10">
              <div className="relative h-6">
                {/* Track */}
                <div className="absolute left-0 right-0 top-0 bottom-0 rounded-full bg-[#E6E6E6]" />

                {/* Progress value */}
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-[#10375C] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
