"use client";

import React from "react";

/**
 * Simple StatCard used in admin dashboard
 * Props:
 *  - title: string
 *  - value: string | number
 *  - hint: optional small text shown below value
 */
export default function StatCard({ title = "", value = "", hint = "" }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 w-full md:min-w-[160px]">
      <div className="text-sm text-[#676767]">{title}</div>
      <div className="mt-2 text-2xl font-bold text-[#10375C]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}
