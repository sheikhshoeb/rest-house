"use client";

import React from "react";

export default function SearchFilterBar({ query, setQuery, onToggleFilters }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400 mr-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
            clipRule="evenodd"
          />
        </svg>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by guest, booking id, property..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V16a1 1 0 01-1.447.894L7 15.118V11.414L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filter
      </button>
    </div>
  );
}
