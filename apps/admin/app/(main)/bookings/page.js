"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import useAdminAuth from "../../../components/useAdminAuth";
import StatCard from "../../../components/StatCard";

/* ---------- COMMON BUTTON ---------- */
const ActionBtn = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-3 py-1.5 text-xs rounded-lg border whitespace-nowrap cursor-pointer transition hover:brightness-95 ${className}`}
  >
    {children}
  </button>
);

export default function AdminBookingsPage() {
  const authStatus = useAdminAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [viewBooking, setViewBooking] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [form, setForm] = useState({
    role: "employee",
    employeeId: "",
    name: "",
    phone: "",
    email: "",
    zoneId: "",
    propertyId: "",
    category: "general",
    adults: 1,
    children: 0,
    checkIn: "",
    checkOut: "",
    paymentStatus: "pending",
  });

  const [zones, setZones] = useState([]);
  const [properties, setProperties] = useState([]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => p.zoneId === form.zoneId);
  }, [properties, form.zoneId]);

  const totalGuests = form.adults + form.children;

  /* ---------- FETCH BOOKINGS ---------- */
  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    }
    load();
  }, [API_BASE]);

  useEffect(() => {
    async function loadMeta() {
      const [zonesRes, propsRes] = await Promise.all([
        fetch(`${API_BASE}/api/zones`, { credentials: "include" }),
        fetch(`${API_BASE}/api/properties`, { credentials: "include" }),
      ]);

      const zonesData = await zonesRes.json();
      const propsData = await propsRes.json();

      if (zonesData.success) setZones(zonesData.zones);
      if (propsData.success) setProperties(propsData.properties);
    }

    loadMeta();
  }, [API_BASE]);

  /* ---------- UPDATE STATUS (NO REFRESH) ---------- */
  async function updateBookingStatus(id, status) {
    const endpoint =
      status === "approved"
        ? "approve"
        : status === "rejected"
        ? "reject"
        : null;

    if (!endpoint) return;

    const res = await fetch(
      `${API_BASE}/api/admin/bookings/${id}/${endpoint}`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

    if (!res.ok) {
      alert("Failed to update booking status");
      return;
    }

    // ✅ update table instantly
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status } : b))
    );

    // ✅ update modal instantly
    setViewBooking((prev) =>
      prev && prev._id === id ? { ...prev, status } : prev
    );
  }

  /* ---------- DERIVED ---------- */
  const today = new Date();

  const bookingRequests = useMemo(
    () => bookings.filter((b) => b.status === "pending"),
    [bookings]
  );

  const tabBookings = useMemo(() => {
    if (activeTab === "rejected")
      return bookings.filter((b) => b.status === "rejected");

    if (activeTab === "past")
      return bookings.filter(
        (b) =>
          b.status === "approved" && new Date(b.bookingDetails.checkOut) < today
      );

    return bookings.filter(
      (b) =>
        b.status === "approved" && new Date(b.bookingDetails.checkOut) >= today
    );
  }, [bookings, activeTab, today]);

  if (authStatus !== "authed") return null;

  return (
    <div
      style={{ fontFamily: "Poppins, sans-serif" }}
      className="min-h-screen bg-[#F8FAFC] text-[14px]"
    >
      <div className="flex pt-4 md:pt-8 px-4 md:px-8 gap-8">
        {/* Sidebar unchanged */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 space-y-8">
          {/* ---------- STATS ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Bookings" value={bookings.length} />
            <StatCard title="Pending Requests" value={bookingRequests.length} />
            <StatCard
              title="Approved Bookings"
              value={bookings.filter((b) => b.status === "approved").length}
            />
          </div>

          {/* ---------- BOOKING REQUESTS ---------- */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-[#10375C]">
                Booking Requests
              </h3>

              <ActionBtn
                className="cursor-pointer bg-[#FF5722] text-white px-6 py-2 rounded-lg"
                onClick={() => setCreateOpen(true)}
              >
                + Create Booking
              </ActionBtn>
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="overflow-x-auto -mx-4 md:mx-0 hidden md:block">
              <table className="min-w-[720px] md:min-w-full w-full text-sm">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b text-gray-500">
                    <th className="py-3 text-left">Property</th>
                    <th className="text-left">User</th>
                    <th className="text-left">Dates</th>
                    <th className="text-left">Amount</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingRequests.map((b) => (
                    <tr key={b._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{b.property.name}</td>
                      <td>{b.user.name}</td>
                      <td>
                        {new Date(
                          b.bookingDetails.checkIn
                        ).toLocaleDateString()}{" "}
                        →{" "}
                        {new Date(
                          b.bookingDetails.checkOut
                        ).toLocaleDateString()}
                      </td>
                      <td className="font-semibold text-[#FF5722]">
                        ₹{b.pricing.totalAmount}
                      </td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <ActionBtn
                            className="bg-blue-50 text-blue-700"
                            onClick={() => setViewBooking(b)}
                          >
                            View
                          </ActionBtn>
                          <ActionBtn
                            className="bg-green-50 text-green-700"
                            onClick={() =>
                              updateBookingStatus(b._id, "approved")
                            }
                          >
                            Approve
                          </ActionBtn>
                          <ActionBtn
                            className="bg-red-50 text-red-700"
                            onClick={() =>
                              updateBookingStatus(b._id, "rejected")
                            }
                          >
                            Reject
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ================= MOBILE CARDS ================= */}
            <div className="md:hidden space-y-4">
              {bookingRequests.map((b) => (
                <div
                  key={b._id}
                  className="bg-white border rounded-xl p-4 shadow-sm space-y-2"
                >
                  <p>
                    <strong>Property:</strong> {b.property.name}
                  </p>
                  <p>
                    <strong>User:</strong> {b.user.name}
                  </p>
                  <p>
                    <strong>Dates:</strong>{" "}
                    {new Date(b.bookingDetails.checkIn).toLocaleDateString()} →{" "}
                    {new Date(b.bookingDetails.checkOut).toLocaleDateString()}
                  </p>
                  <p className="font-semibold text-[#FF5722]">
                    Amount: ₹{b.pricing.totalAmount}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <ActionBtn
                      className="bg-blue-50 text-blue-700"
                      onClick={() => setViewBooking(b)}
                    >
                      View
                    </ActionBtn>
                    <ActionBtn
                      className="bg-green-50 text-green-700"
                      onClick={() => updateBookingStatus(b._id, "approved")}
                    >
                      Approve
                    </ActionBtn>
                    <ActionBtn
                      className="bg-red-50 text-red-700"
                      onClick={() => updateBookingStatus(b._id, "rejected")}
                    >
                      Reject
                    </ActionBtn>
                  </div>
                </div>
              ))}

              {bookingRequests.length === 0 && (
                <p className="text-center text-gray-400 italic py-6">
                  No pending booking requests
                </p>
              )}
            </div>
          </section>

          {/* ---------- BOOKINGS TABS ---------- */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex gap-6 mb-4 border-b">
              {["upcoming", "past", "rejected"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`pb-3 font-medium cursor-pointer ${
                    activeTab === t
                      ? "border-b-2 border-[#FF5722] text-[#FF5722]"
                      : "text-gray-500"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="overflow-x-auto -mx-4 md:mx-0 hidden md:block">
              <table className="min-w-[720px] md:min-w-full w-full text-sm">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b text-gray-500">
                    <th className="py-3 text-left">Property</th>
                    <th className="text-left">User</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tabBookings.map((b) => (
                    <tr key={b._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{b.property.name}</td>
                      <td>{b.user.name}</td>
                      <td className="font-semibold">
                        ₹{b.pricing.totalAmount}
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs capitalize ${
                            b.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <ActionBtn
                          className="bg-blue-50 text-blue-700"
                          onClick={() => setViewBooking(b)}
                        >
                          View
                        </ActionBtn>
                      </td>
                    </tr>
                  ))}

                  {tabBookings.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400 italic"
                      >
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= MOBILE CARDS ================= */}
            <div className="md:hidden space-y-4">
              {tabBookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-white border rounded-xl p-4 shadow-sm space-y-2"
                >
                  <p>
                    <strong>Property:</strong> {b.property.name}
                  </p>
                  <p>
                    <strong>User:</strong> {b.user.name}
                  </p>
                  <p className="font-semibold">
                    Amount: ₹{b.pricing.totalAmount}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="capitalize">{b.status}</span>
                  </p>

                  <div className="pt-2">
                    <ActionBtn
                      className="bg-blue-50 text-blue-700"
                      onClick={() => setViewBooking(b)}
                    >
                      View
                    </ActionBtn>
                  </div>
                </div>
              ))}

              {tabBookings.length === 0 && (
                <p className="text-center text-gray-400 italic py-6">
                  No bookings found
                </p>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* ---------- VIEW MODAL ---------- */}
      {viewBooking && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setViewBooking(null)}
        >
          <div
            className="bg-white w-full md:w-[720px] h-full md:h-auto max-h-[100vh] md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-2xl p-4 md:p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold text-[#10375C]">
                Booking Details
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-xs capitalize ${
                  viewBooking.status === "approved"
                    ? "bg-green-50 text-green-700"
                    : viewBooking.status === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-orange-50 text-orange-700"
                }`}
              >
                {viewBooking.status}
              </span>
            </div>

            {/* PROPERTY INFO */}
            <section>
              <h4 className="font-semibold text-[#10375C] mb-2">
                Property Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Name:</strong> {viewBooking.property.name}
                </p>
                <p>
                  <strong>Location:</strong> {viewBooking.property.location}
                </p>
                <p className="col-span-2">
                  <strong>UPI ID:</strong> {viewBooking.property.upiId || "-"}
                </p>
              </div>
            </section>

            {/* USER INFO */}
            <section>
              <h4 className="font-semibold text-[#10375C] mb-2">
                User Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Name:</strong> {viewBooking.user.name}
                </p>
                <p>
                  <strong>Role:</strong> {viewBooking.user.role}
                </p>
                <p>
                  <strong>Phone:</strong> {viewBooking.user.phone || "-"}
                </p>
                <p>
                  <strong>Email:</strong> {viewBooking.user.email || "-"}
                </p>
              </div>
            </section>

            {/* BOOKING DETAILS */}
            <section>
              <h4 className="font-semibold text-[#10375C] mb-2">
                Booking Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>From:</strong>{" "}
                  {new Date(
                    viewBooking.bookingDetails.checkIn
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>To:</strong>{" "}
                  {new Date(
                    viewBooking.bookingDetails.checkOut
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Days:</strong> {viewBooking.bookingDetails.days}
                </p>
                <p>
                  <strong>Guests:</strong> {viewBooking.bookingDetails.adults}{" "}
                  Adults, {viewBooking.bookingDetails.children} Children
                </p>
                <p className="col-span-2">
                  <strong>Category:</strong>{" "}
                  {viewBooking.bookingDetails.category}
                </p>
              </div>
            </section>

            {/* OFFICER DETAILS */}
            <section>
              <h4 className="font-semibold text-[#10375C] mb-2">
                Regarding Officer
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Name:</strong>{" "}
                  {viewBooking.property.officer?.name || "-"}
                </p>
                <p>
                  <strong>Designation:</strong>{" "}
                  {viewBooking.property.officer?.designation || "-"}
                </p>
                <p className="col-span-2">
                  <strong>Contact:</strong>{" "}
                  {viewBooking.property.officer?.contact || "-"}
                </p>
              </div>
            </section>

            {/* CARETAKER */}
            <section>
              <h4 className="font-semibold text-[#10375C] mb-2">
                Caretaker Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Name:</strong>{" "}
                  {viewBooking.property.caretaker?.name || "-"}
                </p>
                <p>
                  <strong>Contact:</strong>{" "}
                  {viewBooking.property.caretaker?.contact || "-"}
                </p>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="bg-[#F9FAFB] rounded-xl p-4">
              <h4 className="font-semibold text-[#10375C] mb-2">
                Payment Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Base Amount:</strong> ₹
                  {viewBooking.pricing.baseAmount}
                </p>
                <p>
                  <strong>GST:</strong> ₹{viewBooking.pricing.gst}
                </p>
                <p className="col-span-2 font-semibold text-[#FF5722]">
                  Total Amount: ₹{viewBooking.pricing.totalAmount}
                </p>
                <p className="col-span-2">
                  <strong>Payment Status:</strong>{" "}
                  <span className="capitalize">
                    {viewBooking.paymentStatus.replaceAll("_", " ")}
                  </span>
                </p>
              </div>
            </section>

            {/* FOOTER ACTIONS */}
            <div className="pt-4 border-t flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row gap-3">
                {" "}
                <button
                  onClick={() =>
                    updateBookingStatus(viewBooking._id, "approved")
                  }
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    updateBookingStatus(viewBooking._id, "rejected")
                  }
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                >
                  Reject
                </button>
              </div>

              <button
                onClick={() => setViewBooking(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full md:w-[600px] h-full md:h-auto rounded-none md:rounded-2xl p-4 md:p-6 space-y-4 overflow-y-auto">
            <h3 className="text-lg font-semibold">Create Booking</h3>

            {/* ROLE */}
            <div className="flex gap-2">
              {["employee", "ex-employee", "guest"].map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2 rounded-lg border ${
                    form.role === r ? "bg-[#FF5722] text-white" : ""
                  }`}
                >
                  {r.replace("-", " ").toUpperCase()}
                </button>
              ))}
            </div>

            {form.role !== "guest" && (
              <input
                placeholder="Employee ID"
                className="w-full border rounded-lg px-4 py-2"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
              />
            )}

            <input
              placeholder="Name"
              className="input"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Phone"
              className="input"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Email"
              className="input"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* ZONE */}
            <select
              className="input"
              value={form.zoneId}
              onChange={(e) =>
                setForm({ ...form, zoneId: e.target.value, propertyId: "" })
              }
            >
              <option value="">Select Zone</option>
              {zones.map((z) => (
                <option key={z._id} value={z._id}>
                  {z.name}
                </option>
              ))}
            </select>

            {/* PROPERTY */}
            <select
              className="input"
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
            >
              <option value="">Select Property</option>
              {filteredProperties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* BOOKING DETAILS */}
            <select
              className="input"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="vip">VIP</option>
              <option value="vvip">VVIP</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                placeholder="Adults"
                className="input"
                onChange={(e) => setForm({ ...form, adults: +e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="Children"
                className="input"
                onChange={(e) =>
                  setForm({ ...form, children: +e.target.value })
                }
              />
            </div>

            <p className="text-sm text-gray-500">Total Guests: {totalGuests}</p>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="input"
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              />
              <input
                type="date"
                className="input"
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              />
            </div>

            {/* PAYMENT STATUS */}
            <select
              className="input"
              onChange={(e) =>
                setForm({ ...form, paymentStatus: e.target.value })
              }
            >
              {[
                "pending",
                "paid_online",
                "paid_on_rest_house",
                "pay_on_rest_house",
                "failed",
                "refunded",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <button
              className="w-full bg-[#FF5722] text-white py-2 rounded-lg"
              onClick={async () => {
                const res = await fetch(
                  `${API_BASE}/api/admin/bookings/create`,
                  {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  }
                );

                if (!res.ok) return alert("Failed to create booking");

                const data = await res.json();
                setBookings((prev) => [data.booking, ...prev]);
                setCreateOpen(false);
              }}
            >
              Create Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
