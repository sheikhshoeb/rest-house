"use client";

import React from "react";

export default function AvailabilityList({
  items = [
    { name: "Royal Heritage (Pune)", vvip: 1, vip: 3, general: 5 },
    { name: "Green Valley (Nagpur)", vvip: 0, vip: 2, general: 4 },
    { name: "Hilltop Lodge (Gondia)", vvip: 0, vip: 1, general: 2 },
  ],
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-[#10375C]">
        Availability Snapshot
      </h3>

      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <div key={it.name} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800">
                {it.name}
              </div>
              <div className="text-xs text-gray-500">
                {it.vvip + it.vip + it.general} rooms available
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="px-3 py-1 rounded-md bg-[#FF5722] text-white text-xs">
                {it.vvip} VVIP
              </div>
              <div className="px-3 py-1 rounded-md bg-[#10375C] text-white text-xs">
                {it.vip} VIP
              </div>
              <div className="px-3 py-1 rounded-md bg-[#D9D9D9] text-[#111827] text-xs">
                {it.general} GEN
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
