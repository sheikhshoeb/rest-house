"use client";

import React from "react";

export default function BookingsTable({ bookings, onView, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[900px] text-left">
        <thead>
          <tr className="text-sm text-gray-500">
            <th className="py-4 pr-6">Location</th>
            <th className="py-4 pr-6">Booking ID</th>
            <th className="py-4 pr-6">Guest Name</th>
            <th className="py-4 pr-6">Check In</th>
            <th className="py-4 pr-6">Check Out</th>
            <th className="py-4 pr-6">Status</th>
            <th className="py-4 pr-6">No Of People</th>
            <th className="py-4 pr-6">Room Type</th>
            <th className="py-4 pr-6"></th>
          </tr>
        </thead>

        <tbody>
          {bookings.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-gray-400">
                No bookings found
              </td>
            </tr>
          )}

          {bookings.map((b, i) => (
            <tr key={i} className="border-t last:border-b">
              <td className="py-5 pr-6 text-gray-700">{b.location}</td>
              <td className="py-5 pr-6 text-gray-700 font-medium">
                {b.bookingId}
              </td>
              <td className="py-5 pr-6 text-gray-700">{b.guestName}</td>
              <td className="py-5 pr-6 text-gray-700">{b.checkIn}</td>
              <td className="py-5 pr-6 text-gray-700">{b.checkOut}</td>

              <td className="py-5 pr-6">
                <span
                  className="px-3 py-1 text-sm rounded-md inline-block"
                  style={{
                    background:
                      b.status === "Confirmed"
                        ? "#dff7e0"
                        : b.status === "Pending"
                        ? "#FFF8E6"
                        : "#FEEAEA",
                    color:
                      b.status === "Confirmed"
                        ? "#1b5e20"
                        : b.status === "Pending"
                        ? "#FFB020"
                        : "#E11D48",
                  }}
                >
                  {b.status}
                </span>
              </td>

              <td className="py-5 pr-6 text-gray-700">{b.people}</td>
              <td className="py-5 pr-6 text-gray-700">{b.roomType}</td>

              <td className="py-5 pr-6 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onView && onView(b)}
                    className="text-sm text-[#10375C] hover:text-[#FF5722]"
                  >
                    View
                  </button>

                  <button
                    onClick={() => onDelete && onDelete(b)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
