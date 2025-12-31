"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (path) =>
    `px-4 py-3 rounded-md font-medium transition ${
      pathname === path
        ? "bg-[#FF5722] bg-opacity-90 text-white"
        : "hover:bg-white/5 text-white"
    }`;

  return (
    <div
      className="flex flex-col items-stretch w-64"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Logo */}
      <div
        className="bg-white rounded-2xl mb-4"
        style={{
          minHeight: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/images/mahavitaran.png"
          alt="logo"
          width={160}
          height={64}
          className="object-contain"
        />
      </div>

      {/* Sidebar */}
      <aside
        className="bg-[#10375C] rounded-2xl p-6 text-white flex-shrink-0"
        style={{ minHeight: "72vh" }}
      >
        <nav className="flex flex-col gap-3 mt-2">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>

          <Link href="/bookings" className={linkClass("/bookings")}>
            Bookings
          </Link>

          <Link href="/users" className={linkClass("/users")}>
            User Management
          </Link>

          <Link href="/rest-houses" className={linkClass("/rest-houses")}>
            Rest House Management
          </Link>

          <Link href="/price" className={linkClass("/price")}>
            Price Management
          </Link>

          <Link href="/reports" className={linkClass("/reports")}>
            Analytics & Reports
          </Link>

          <Link
            href="/logout"
            className="px-4 py-3 rounded-md hover:bg-red-500/20 text-red-300"
          >
            Logout
          </Link>
        </nav>
      </aside>
    </div>
  );
}
