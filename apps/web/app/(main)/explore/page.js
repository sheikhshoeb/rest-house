"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

/* ================= INNER COMPONENT ================= */
function ExploreContent() {
  const params = useSearchParams();

  const zone = params.get("location");
  const category = params.get("category") || "General";
  const adults = Number(params.get("adults") || 1);
  const children = Number(params.get("children") || 0);
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (!zone) return;

    async function load() {
      const res = await fetch(
        `${API_BASE}/api/properties?zone=${encodeURIComponent(zone)}`
      );
      const data = await res.json();
      setProperties(data);
    }

    load();
  }, [zone, API_BASE]);

  function getCategories(rooms = {}) {
    const labels = [];
    if (rooms.vvip > 0) labels.push("VVIP");
    if (rooms.vip > 0) labels.push("VIP");
    if (rooms.general > 0) labels.push("General");
    return labels;
  }

  return (
    <div className="w-full bg-white font-[Poppins] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-[#10375C]">
          Properties in {zone}
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {properties.map((prop) => {
            const categories = getCategories(prop.rooms);

            return (
              <div
                key={prop._id}
                className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative w-full h-56">
                  <Image
                    src={`http://localhost:5001${prop.images?.[0]}`}
                    alt={prop.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#10375C]">
                    {prop.name}
                  </h3>

                  {prop.location && (
                    <p className="mt-1 text-sm text-gray-600">
                      📍 {prop.location}
                    </p>
                  )}

                  {categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-[#FFF3EF] text-[#FF5722]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      onClick={async () => {
                        const payload = {
                          propertyId: prop._id,
                          category,
                          adults,
                          children,
                          checkIn,
                          checkOut,
                        };

                        const res = await fetch(`${API_BASE}/api/bookings`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify(payload),
                        });

                        const data = await res.json();

                        if (data.success) {
                          window.location.href = `/booking?id=${data.bookingId}`;
                        } else {
                          alert(data.error || "Booking failed");
                        }
                      }}
                      className="w-full rounded-xl px-6 py-3 bg-[#FF5722] text-white font-semibold hover:bg-[#e64b1f] transition"
                    >
                      Request For Booking
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {properties.length === 0 && (
            <p className="text-center col-span-full text-gray-500">
              No properties available for this location.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE EXPORT ================= */
export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
