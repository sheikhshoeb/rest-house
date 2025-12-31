"use client";

import React from "react";

const ACCENT = "#FF5722";
const DARK = "#10375C";

export default function Benefits({
  manualImage = "/images/manual-booking.png",
  digitalImage = "/images/digital-booking.jpg",
  impactImage = "/images/impact.png",
}) {
  return (
    <section className="w-full bg-white py-16 px-6 font-[Poppins]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Title */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#0b1221] leading-tight">
          Benefits
        </h2>

        <div className="flex justify-center mt-4">
          <span
            className="block rounded-full"
            style={{ width: 84, height: 6, background: ACCENT }}
          />
        </div>

        <p className="text-center text-sm md:text-base text-[#333333] mt-6 max-w-2xl mx-auto">
          From Manual to Digital a Smarter way to book
        </p>

        {/* Row 1: Manual Booking */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* left image */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div
              style={{
                width: 600,
                height: 480,
                overflow: "hidden",
              }}
              className="rounded overflow-hidden"
            >
              <img
                src={manualImage}
                alt="Manual booking"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* right text */}
          <div className="lg:col-span-6">
            <div className="pl-0 lg:pl-12">
              <div className="w-full bg-[#10375C] text-white px-6 py-3 font-semibold mb-6">
                MANUAL BOOKING
              </div>

              <ul className="space-y-6 mt-3">
                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    Manual booking relies on calls and emails, often causing delays.
                  </p>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    There is a high risk of double booking.
                  </p>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    It creates heavy administrative workload.
                  </p>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    Records are maintained in handwritten registers.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Row 2: Digital Booking */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* left text */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="pr-0 lg:pr-12">
              <div
                className="w-full bg-[#10375C] text-white px-6 py-3 font-semibold mb-6"
                style={{ paddingRight: 48 }}
              >
                DIGITAL BOOKING
              </div>

              <ul className="space-y-6 mt-3">
                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    Customers can book easily through online self-service.
                  </p>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    All data is managed in a centralized system.
                  </p>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    Bookings are updated in real time with synchronization.
                  </p>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    className="mt-1 w-3 h-3 rounded-full"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-sm md:text-base text-[#111827]">
                    Workload is reduced by up to 70%.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* right image */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end">
            <div
              style={{
                width: 600,
                height: 480,
                overflow: "hidden",
              }}
              className="rounded overflow-hidden"
            >
              <img
                src={digitalImage}
                alt="Digital booking"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Impact */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* left image */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div
              style={{
                width: 600,
                height: 480,
                overflow: "hidden",
              }}
              className="rounded overflow-hidden"
            >
              <img
                src={impactImage}
                alt="Impact"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* right Impact text */}
          <div className="lg:col-span-6">
            <div className="pl-0 lg:pl-12">
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#0b1221]">
                Impact
              </h3>

              <div
                className="h-1 w-12 rounded-full mt-3"
                style={{ background: ACCENT }}
              />

              <p className="mt-4 text-sm md:text-base text-[#111827] font-medium">
                Transforming the Rest House Experience
              </p>

              <ul className="list-disc list-inside mt-4 space-y-3 text-sm md:text-base text-[#111827]">
                <li>Booking time reduced from hours to seconds</li>
                <li>100% transparent availability</li>
                <li>Significant reduction in staff workload</li>
                <li>Role-based secure access</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
