"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import StatCard from "../../../components/StatCard";
import SearchFilterBar from "../../../components/SearchFilterBar";
import BookingsTable from "../../../components/BookingsTable";
import CreateBookingModal from "../../../components/CreateBookingModal";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Pagination from "../../../components/Pagination";

import DashboardStats from "../../../components/DashboardStats";
import LocationsList from "../../../components/LocationsList";
import PropertiesSummary from "../../../components/PropertiesSummary";
import AvailabilityList from "../../../components/AvailabilityList";
import QuickActions from "../../../components/QuickActions";

import useAdminAuth from "../../../components/useAdminAuth";

const MOCK = [
  {
    location: "Pune",
    bookingId: "Gk00111",
    guestName: "Riddhi Gupta",
    checkIn: "01/02/2025",
    checkOut: "02/02/2025",
    status: "Confirmed",
    people: "2 Person",
    roomType: "Double",
  },
  {
    location: "Nagpur",
    bookingId: "Re43289",
    guestName: "Arun Kadam",
    checkIn: "13/02/2025",
    checkOut: "14/02/2025",
    status: "Confirmed",
    people: "1 Person",
    roomType: "Single",
  },
  {
    location: "Gondia",
    bookingId: "Lh88123",
    guestName: "Pankaj More",
    checkIn: "23/02/2025",
    checkOut: "24/02/2025",
    status: "Confirmed",
    people: "4 Person",
    roomType: "Suite",
  },
  {
    location: "Bhandara",
    bookingId: "Bk87651",
    guestName: "Neha Borkar",
    checkIn: "04/03/2025",
    checkOut: "05/03/2025",
    status: "Confirmed",
    people: "2 Person",
    roomType: "Double",
  },
  {
    location: "Nagpur",
    bookingId: "Bk87651",
    guestName: "Simran Wankar",
    checkIn: "25/03/2025",
    checkOut: "26/03/2025",
    status: "Confirmed",
    people: "1 Person",
    roomType: "Single",
  },
  {
    location: "Nashik",
    bookingId: "Nd321454",
    guestName: "Somesh Diwate",
    checkIn: "05/04/2025",
    checkOut: "06/04/2025",
    status: "Confirmed",
    people: "1 Person",
    roomType: "Single",
  },
];

export default function AdminHomePage() {
  // 1) auth hook must be first (it is a hook)
  const authStatus = useAdminAuth();

  // 2) declare ALL other hooks (useState/useMemo) BEFORE any early return
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [bookings, setBookings] = useState(MOCK);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modal / confirm dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        (b.location && b.location.toLowerCase().includes(q)) ||
        (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
        (b.guestName && b.guestName.toLowerCase().includes(q))
    );
  }, [query, bookings]);

  // paging (simple)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const shown = filtered.slice((page - 1) * perPage, page * perPage);

  // 3) Now it's safe to early-return based on authStatus
  if (authStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">Checking admin session…</div>
      </div>
    );
  }

  if (authStatus === "unauth") {
    // useAdminAuth already redirects; return null to avoid rendering
    return null;
  }

  // 4) handlers and rendering (authStatus === 'authed')
  function handleCreate(b) {
    setBookings((s) => [b, ...s]);
    setPage(1);
  }

  function handleView(b) {
    alert(`Viewing booking ${b.bookingId}`);
  }

  function handleDeleteRequest(b) {
    setToDelete(b);
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!toDelete) return;
    setBookings((s) => s.filter((x) => x.bookingId !== toDelete.bookingId));
    setConfirmOpen(false);
    setToDelete(null);
  }

  // sample handlers for QuickActions
  function handleAddProperty() {
    alert("Add Property - open form");
  }
  function handleSync() {
    alert("Syncing offline data...");
  }
  function handleExport() {
    alert("Exporting PDF...");
  }

  return (
    <div
      style={{ fontFamily: "Poppins, sans-serif" }}
      className="min-h-screen bg-white text-[14px]"
    >
      <div className="flex flex-col md:flex-row pt-4 md:pt-8 px-4 md:px-8 gap-4 md:gap-8">
        {/* Sidebar unchanged */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 space-y-6">
          {/* Top KPI row */}
          <DashboardStats
            locations={124}
            properties={42}
            rooms={532}
            activeBookings={312}
          />

          {/* Top small stat cards (keeps your StatCard usage) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Total Booking Today" value="45" />
                <StatCard title="Occupency Rate" value="72 %" />
                <StatCard title="Pending Approvals" value="18" />
              </div>
            </div>

            <div>
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full md:w-auto bg-[#FF5722] text-white px-5 py-3 rounded-xl shadow-lg hover:brightness-95 flex items-center gap-2"
              >
                Create Booking <span className="text-2xl leading-none">+</span>
              </button>
            </div>
          </div>

          {/* Two-column summary area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Bookings list card */}
              <section
                className="bg-white rounded-2xl p-6 shadow-lg border border-white"
                style={{ boxShadow: "0 10px 24px rgba(2,6,23,0.06)" }}
              >
                <SearchFilterBar
                  query={query}
                  setQuery={setQuery}
                  onToggleFilters={() => setFilterOpen((s) => !s)}
                />

                <BookingsTable
                  bookings={shown}
                  onView={handleView}
                  onDelete={handleDeleteRequest}
                />

                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={(p) => setPage(p)}
                />
              </section>
            </div>

            <div className="space-y-4">
              <PropertiesSummary summary={{ vvip: 6, vip: 18, general: 18 }} />
              <LocationsList />
              <QuickActions
                onCreateProperty={handleAddProperty}
                onSync={handleSync}
                onExport={handleExport}
              />
            </div>
          </div>

          {/* Availability snapshot row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AvailabilityList />
            {/* you can add another component here (map, calendar, etc.) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-[#10375C]">
                Notes / Announcements
              </h3>
              <div className="mt-4 text-sm text-gray-700">
                Use this area to show recent sync status, policy notes or
                reminders for staff.
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateBookingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete booking?"
        body={`Delete booking ${toDelete?.bookingId ?? ""}?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
