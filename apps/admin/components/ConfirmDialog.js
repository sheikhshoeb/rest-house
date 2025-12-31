"use client";

import React from "react";

export default function ConfirmDialog({
  open,
  title,
  body,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog Box */}
      <div className="bg-white rounded-xl p-6 z-10 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title ?? "Are you sure?"}</h3>

        <p className="text-sm text-gray-600 mt-2">
          {body ?? "This action cannot be undone."}
        </p>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
