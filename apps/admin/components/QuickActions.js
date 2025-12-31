"use client";

import React from "react";

export default function QuickActions({ onCreateProperty, onSync, onExport }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-[#10375C]">Quick Actions</h3>

      <div className="mt-4 grid gap-3">
        <button
          onClick={onCreateProperty}
          className="w-full text-left px-4 py-3 rounded-lg bg-[#FF5722] text-white font-medium"
        >
          Add Property
        </button>

        <button
          onClick={onSync}
          className="w-full text-left px-4 py-3 rounded-lg bg-white border border-gray-200"
        >
          Sync Offline
        </button>

        <button
          onClick={onExport}
          className="w-full text-left px-4 py-3 rounded-lg bg-white border border-gray-200"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
