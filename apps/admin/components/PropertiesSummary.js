"use client";

import React from "react";

export default function PropertiesSummary({
  summary = { vvip: 6, vip: 18, general: 18 },
}) {
  const total = summary.vvip + summary.vip + summary.general;

  function pct(n) {
    return total ? Math.round((n / total) * 100) : 0;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-[#10375C]">
        Property Categories
      </h3>

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">VVIP</div>
            <div className="text-xs text-gray-500">Top-end rest houses</div>
          </div>
          <div className="text-sm font-bold">{summary.vvip}</div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">VIP</div>
            <div className="text-xs text-gray-500">Mid-tier rest houses</div>
          </div>
          <div className="text-sm font-bold">{summary.vip}</div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">General</div>
            <div className="text-xs text-gray-500">Standard rest houses</div>
          </div>
          <div className="text-sm font-bold">{summary.general}</div>
        </div>

        {/* Bar & Percentage Indicators */}
        <div className="mt-3">
          <div className="h-2 rounded-full bg-[#E6E6E6] overflow-hidden">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${pct(summary.vvip)}%`,
                background: "#FF5722",
              }}
            />
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#FF5722]" /> VVIP{" "}
              {pct(summary.vvip)}%
            </div>

            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#10375C]" /> VIP{" "}
              {pct(summary.vip)}%
            </div>

            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#D9D9D9]" /> General{" "}
              {pct(summary.general)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
