"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar"; // ✅ reuse existing sidebar

export default function Header({ title = "Admin Portal" }) {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [admin, setAdmin] = useState(null);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // ✅ NEW

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch(`${API_BASE}/api/admin-auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAdmin();
  }, [API_BASE]);

  async function logout() {
    await fetch(`${API_BASE}/api/admin-auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="bg-[#10375C] text-white py-4 px-6 flex items-center justify-between">
        {/* LEFT: Hamburger (mobile only) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="text-xl font-semibold">{title}</div>
        </div>

        {/* RIGHT: Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-full bg-white/90 flex items-center justify-center">
              {admin?.avatarUrl ? (
                <Image
                  src={admin.avatarUrl}
                  alt="avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <span className="text-[#10375C] font-bold">
                  {admin?.fullName?.[0] || "A"}
                </span>
              )}
            </div>
            <span className="hidden md:block text-sm">{admin?.role}</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 bg-white text-[#10375C] rounded-md shadow-lg w-44 py-2 z-50">
              <div className="px-4 py-2 text-sm border-b">
                <div className="font-semibold">{admin?.fullName}</div>
                <div className="text-xs opacity-70">{admin?.role}</div>
              </div>

              <button
                onClick={() => router.push("/profile")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Profile
              </button>

              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 md:hidden shadow-xl animate-slide-in">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <span className="font-semibold text-[#10375C]">Menu</span>
              <button onClick={() => setMobileOpen(false)}>✕</button>
            </div>

            {/* ✅ SAME SIDEBAR COMPONENT */}
            <Sidebar />
          </div>
        </>
      )}
    </>
  );
}
