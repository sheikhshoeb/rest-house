// apps/web/app/(auth)/login/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ACCENT = "#FF5722";

export default function LoginPage() {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // 1) CHECK IF USER IS ALREADY LOGGED IN
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!mounted) return;

        if (res.ok) {
          // already authenticated -> redirect to /home
          router.replace("/home");
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        // network error -> show login UI
        console.warn("Client session check error (login):", err);
        if (mounted) setCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [API_BASE, router]);

  // helper
  function looksLikeEmail(value) {
    return /\S+@\S+\.\S+/.test(value);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { password };
      if (looksLikeEmail(identifier)) payload.email = identifier.trim();
      else payload.employeeId = identifier.trim();

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error ?? `Login failed (${res.status})`);

      // success -> redirect to home (server sets HttpOnly cookie)
      router.replace("/home");
    } catch (err) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-3 animate-pulse">Checking session…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center">
      <header className="pt-12">
        <h1 className="text-4xl sm:text-4xl font-extrabold text-[#10375C] text-center">
          Welcome Back
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Login to access your Rest House Booking Account
        </p>
      </header>

      <main className="w-full flex-1 flex flex-col items-center py-12">
        <div className="relative w-full max-w-3xl px-6">
          <div
            className="bg-white rounded-2xl px-8 py-12 md:py-16"
            style={{
              boxShadow:
                "0 10px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <form onSubmit={submit} className="max-w-xl mx-auto">
              <label className="block text-base font-semibold mb-3 text-black">
                Email or Employee ID
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your Email or Employee ID"
                className={`w-full h-12 rounded-xl px-4 focus:outline-none 
                  focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/40
                  border border-transparent transition-all 
                  ${identifier ? "text-black" : "text-gray-700"}`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.04)" }}
              />

              <label className="block text-base font-semibold mt-8 mb-3 text-black">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full h-12 rounded-xl px-4 pr-14 focus:outline-none
                    focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/40
                    border border-transparent transition-all 
                    ${password ? "text-black" : "text-gray-700"}`}
                  style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.04)" }}
                />

                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {show ? "🙈" : "👁"}
                </button>
              </div>

              <div className="text-right mt-3">
                <a
                  href="#"
                  className="text-sm font-medium text-black hover:text-[#FF5722]"
                >
                  Forgot Password?
                </a>
              </div>

              {error && (
                <div className="mt-4 text-red-600 font-medium">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full h-12 rounded-xl text-white font-semibold text-lg
                  hover:cursor-pointer transition-all disabled:opacity-70"
                style={{
                  background: ACCENT,
                  boxShadow: "0 6px 14px rgba(255,87,34,0.25)",
                }}
              >
                {loading ? "Logging In..." : "Login"}
              </button>
            </form>
          </div>

          <div className="mt-10 flex items-center justify-center space-x-6">
            <span className="h-px w-32 bg-gray-300"></span>
            <span className="text-sm italic text-gray-600">New User?</span>
            <span className="h-px w-32 bg-gray-300"></span>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/register"
              className="block rounded-2xl p-6 text-center border border-gray-300 hover:border-[#FF5722] transition-all shadow-sm hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-[#10375C]">
                Employee / Ex-Employee
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-6">
                Register using your Employee ID to book Rest House as a Current
                or Former Government Employee.
              </p>
            </Link>

            <Link
              href="/guest"
              className="block rounded-2xl p-6 text-center border border-gray-300 hover:border-[#FF5722] transition-all shadow-sm hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-[#10375C]">
                Continue as Guest
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-6">
                No Employee ID? Register as a Guest and continue with limited
                booking privileges.
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="pb-12"></footer>
    </div>
  );
}
