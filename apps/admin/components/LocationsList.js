"use client";

import React from "react";

/**
 * LocationsList
 * Simple list of locations with small meta (properties, rooms).
 * Props:
 *  - items: [{ name, properties, rooms }]
 */
export default function LocationsList({
  items = [
    { name: "Pune", properties: 12, rooms: 160 },
    { name: "Nagpur", properties: 8, rooms: 92 },
    { name: "Gondia", properties: 4, rooms: 40 },
  ],
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#10375C]">Locations</h3>
        <div className="text-sm text-gray-500">Top areas</div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((loc) => (
          <div key={loc.name} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800">
                {loc.name}
              </div>
              <div className="text-xs text-gray-500">
                {loc.properties} properties • {loc.rooms} rooms
              </div>
            </div>

            <div className="text-sm text-gray-700 font-semibold">
              {loc.rooms}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
