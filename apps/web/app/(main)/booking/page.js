"use client";
import React, { useEffect, useMemo, useState } from "react";
import BookingTabs from "../../../components/BookingTabs";
import BookingCard from "../../../components/BookingCard";
import UpiPaymentModal from "../../../components/UpiPaymentModal";

export default function BookingsPage() {
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch(`${API_BASE}/api/bookings/my`, {
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) setBookings(data.bookings);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [API_BASE]);

  /** -------- STATUS MAPPING -------- */
  const today = new Date();

  function mapBookingToUI(b) {
    const checkIn = new Date(b.bookingDetails.checkIn);

    // CANCELLED
    if (b.status === "rejected") {
      return { ...b, uiStatus: "cancelled" };
    }

    // COMPLETED
    if (
      b.status === "approved" &&
      b.paymentStatus.startsWith("paid") &&
      today > checkIn
    ) {
      return { ...b, uiStatus: "completed" };
    }

    // UPCOMING
    return { ...b, uiStatus: "upcoming" };
  }

  const mappedBookings = useMemo(
    () => bookings.map(mapBookingToUI),
    [bookings]
  );

  const filtered = useMemo(
    () => mappedBookings.filter((b) => b.uiStatus === tab),
    [mappedBookings, tab]
  );

  function handlePayNow(b) {
    setSelectedBooking(b);
    setUpiModalOpen(true);
  }

  async function handlePayAtRestHouse(b) {
    try {
      const res = await fetch(
        `${API_BASE}/api/bookings/${b._id}/pay-at-rest-house`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to update payment status");
        return;
      }

      // ✅ Update UI instantly (no refresh)
      setBookings((prev) =>
        prev.map((x) =>
          x._id === b._id ? { ...x, paymentStatus: "pay_on_rest_house" } : x
        )
      );
    } catch (err) {
      console.error("Pay at rest house failed", err);
      alert("Something went wrong");
    }
  }

  function handleContact(b) {
    alert(
      `Caretaker: ${b.property.caretaker?.contact || "N/A"}\nOfficer: ${
        b.property.officer?.contact || "N/A"
      }`
    );
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <BookingTabs value={tab} onChange={setTab} />

      <div className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1221] mb-6">
          {tab === "upcoming"
            ? "Upcoming Bookings"
            : tab === "cancelled"
            ? "Cancelled Bookings"
            : "Completed Bookings"}
        </h2>

        {loading ? (
          <p>Loading bookings…</p>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-600">
            No {tab} bookings found.
          </div>
        ) : (
          filtered.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              onPayNow={handlePayNow}
              onPayAtRestHouse={handlePayAtRestHouse}
              onContact={handleContact}
            />
          ))
        )}
      </div>

      <UpiPaymentModal
        open={upiModalOpen}
        booking={selectedBooking}
        onClose={() => {
          setUpiModalOpen(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
}
