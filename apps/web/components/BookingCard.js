"use client";
import React from "react";
import Image from "next/image";

export default function BookingCard({
  booking,
  onPayNow,
  onPayAtRestHouse,
  onContact,
}) {
  const { status, paymentStatus, property, bookingDetails, pricing } = booking;

  const checkIn = new Date(bookingDetails.checkIn);
  const checkOut = new Date(bookingDetails.checkOut);
  const today = new Date();

  const isCompleted =
    status === "approved" &&
    paymentStatus?.startsWith("paid") &&
    today > checkIn;

  const isCancelled = status === "rejected";
  const isUpcoming = !isCompleted && !isCancelled;

  /* ---------------- Badge text ---------------- */
  let badgeText = "";
  if (isCancelled) badgeText = "Cancelled";
  else if (isCompleted) badgeText = "Completed";
  else if (status === "pending") badgeText = "Requested (Waiting for approval)";
  else if (status === "approved" && paymentStatus === "pending")
    badgeText = "Approved — Awaiting Payment";
  else if (status === "approved" && paymentStatus?.startsWith("paid"))
    badgeText = "Payment Completed";

  const guestsText = `${bookingDetails.adults} Adult${
    bookingDetails.adults > 1 ? "s" : ""
  }${
    bookingDetails.children > 0
      ? `, ${bookingDetails.children} Child${
          bookingDetails.children > 1 ? "ren" : ""
        }`
      : ""
  }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="border-2 border-[#FF5722] rounded-2xl p-4 sm:p-6 mb-8 relative">
        {/* Left Pill (desktop only) */}
        <div className="hidden md:block absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-28 rounded-full bg-[#FF5722]" />
        </div>

        {/* Layout */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Image */}
          <div className="w-full md:w-[315px] flex-shrink-0">
            <div
              className={`relative w-full h-[200px] md:h-[185px] overflow-hidden rounded-lg ${
                !isUpcoming ? "grayscale" : ""
              }`}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${property.images?.[0]}`}
                alt={property?.name || "Property"}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b1221] mb-1">
              {property?.name}
            </h3>

            {property?.location && (
              <p className="text-sm text-gray-600 mb-2">
                📍 {property.location}
              </p>
            )}

            {badgeText && (
              <div className="inline-block text-xs sm:text-sm px-3 py-1 rounded-full bg-[#f3f4f6] text-[#0b1221] font-medium mb-3">
                {badgeText}
              </div>
            )}

            <div className="text-sm text-[#0b1221] space-y-1">
              <div>
                Booking ID :
                <span className="font-medium ml-1">{booking._id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 mt-2">
                <div>
                  Check-In :
                  <span className="font-medium ml-1">
                    {checkIn.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  Check-Out :
                  <span className="font-medium ml-1">
                    {checkOut.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  Category :
                  <span className="font-medium ml-1">
                    {bookingDetails.category}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                Guests :<span className="font-medium ml-1">{guestsText}</span>
              </div>

              <div className="mt-2">
                Amount :
                <span className="font-semibold ml-1 text-[#FF5722]">
                  ₹{pricing.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full md:w-[200px] flex-shrink-0">
            <div className="flex flex-col gap-3 mt-4 md:mt-0">
              {status === "pending" && (
                <button
                  disabled
                  className="bg-gray-200 text-gray-600 py-3 rounded-xl font-medium cursor-not-allowed"
                >
                  Requested
                </button>
              )}

              {status === "approved" && paymentStatus === "pending" && (
                <>
                  <button
                    onClick={() => onPayNow?.(booking)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium cursor-pointer"
                  >
                    Pay Now
                  </button>

                  <button
                    onClick={() => onPayAtRestHouse?.(booking)}
                    className="border border-[#FF5722] text-[#FF5722] py-3 rounded-xl font-medium hover:bg-[#FFF3EF] cursor-pointer"
                  >
                    Pay at Rest House
                  </button>
                </>
              )}

              {status === "approved" && paymentStatus?.startsWith("paid") && (
                <button
                  onClick={() => onContact?.(booking)}
                  className="bg-[#FF5722] hover:bg-[#E64A19] text-white py-3 rounded-xl font-medium"
                >
                  Contact
                </button>
              )}

              {isCancelled && (
                <div className="h-[48px] flex items-center justify-center text-sm text-gray-500 italic">
                  No actions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
