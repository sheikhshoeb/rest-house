"use client";

import React from "react";

export default function DashboardStats({
  locations = 124,
  properties = 42,
  rooms = 532,
  activeBookings = 312,
}) {
  const items = [
    { label: "Locations", value: locations },
    { label: "Properties", value: properties },
    { label: "Total Rooms", value: rooms },
    { label: "Active Bookings", value: activeBookings },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="text-sm text-[#676767]">{it.label}</div>
          <div className="mt-2 text-2xl font-bold text-[#10375C]">
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
