"use client";

import React from "react";

export default function QuickActions({
  onCancel,
  onDownload,
  title = "Quick Actions",
  subtitlePrefix = "Your Booking Is",
  subtitleHighlight = "Confirmed!",
}) {
  return (
    <section
      className="w-full py-20 px-6"
      style={{
        background: "#FFF3EF",
        fontFamily:
          "Poppins, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Top title */}
        <h3 className="text-center text-3xl md:text-4xl font-extrabold leading-tight text-[#000000]">
          {title}
        </h3>

        {/* subtitle */}
        <h2
          className="text-center text-3xl md:text-4xl font-medium leading-tight mt-2"
          style={{ color: "#000000" }}
        >
          <span className="mr-2">{subtitlePrefix}</span>
          <span style={{ color: "#FF5722" }}>{subtitleHighlight}</span>
        </h2>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Cancel / Update */}
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold transition"
            style={{
              background: "#D9D9D9",
              color: "#10375C",
              boxShadow: "none",
              minWidth: 220,
            }}
            aria-label="Cancel or update booking"
            onKeyDown={(e) => {
              if (e.key === "Enter" && onCancel) onCancel();
            }}
          >
            Cancel / Update Booking
          </button>

          {/* Download button */}
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center justify-center px-6 py-3 rounded-md font-semibold text-white transition hover:brightness-95 active:translate-y-0.5"
            style={{
              background: "#FF5722",
              color: "#ffffff",
              minWidth: 220,
            }}
            aria-label="Download confirmation pdf"
          >
            Download Confirmation Pdf
          </button>
        </div>
      </div>
    </section>
  );
}
