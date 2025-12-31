"use client";

import React, { useState } from "react";

export default function CreateBookingModal({ open, onClose, onCreate }) {
  const [location, setLocation] = useState("");
  const [guestName, setGuestName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [people, setPeople] = useState("1 Person");
  const [roomType, setRoomType] = useState("Single");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal Box */}
      <div className="bg-white rounded-xl p-6 z-10 w-full max-w-2xl mx-4">
        <h3 className="text-lg font-semibold text-[#10375C]">Create Booking</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="h-12 px-4 rounded-lg border"
          />

          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Guest name"
            className="h-12 px-4 rounded-lg border"
          />

          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-12 px-4 rounded-lg border"
          />

          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-12 px-4 rounded-lg border"
          />

          <select
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="h-12 px-4 rounded-lg border"
          >
            <option>1 Person</option>
            <option>2 Person</option>
            <option>3 Person</option>
          </select>

          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="h-12 px-4 rounded-lg border"
          >
            <option>Single</option>
            <option>Double</option>
            <option>Suite</option>
          </select>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>

          <button
            onClick={() => {
              const newBooking = {
                location,
                bookingId: "BK" + Math.floor(Math.random() * 90000 + 1000),
                guestName,
                checkIn,
                checkOut,
                status: "Pending",
                people,
                roomType,
              };

              onCreate(newBooking);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-[#FF5722] text-white"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
