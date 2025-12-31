"use client";

import React from "react";

export default function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;

  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(total, page + 1));

  return (
    <div className="flex items-center gap-3 justify-end mt-4">
      <button onClick={prev} className="px-3 py-1 border rounded">
        Prev
      </button>

      <div className="text-sm text-gray-600">
        Page {page} of {total}
      </div>

      <button onClick={next} className="px-3 py-1 border rounded">
        Next
      </button>
    </div>
  );
}
