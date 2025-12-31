"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#10375C";
const ACCENT = "#FF5722";

export default function LoginPage() {
  const router = useRouter();

  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  // -------------------------------
  // 🔥 1. CHECK IF ADMIN IS ALREADY LOGGED IN
  // -------------------------------
  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

        const res = await fetch(`${API_BASE}/api/admin-auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!mounted) return;

        if (res.ok) {
          // Admin is already authenticated → redirect
          router.replace("/dashboard");
        } else {
          setCheckingSession(false); // show login page
        }
      } catch (err) {
        if (mounted) setCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Dropdown close handlers
  useEffect(() => {
    function onDocClick(e) {
      if (!langRef.current) return;
      if (!langRef.current.contains(e.target)) setLangOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setLangOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // -------------------------------
  // 🔥 2. HANDLE ADMIN LOGIN
  // -------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Provide email and password.");
      return;
    }

    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

      const res = await fetch(`${API_BASE}/api/admin-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || data.message || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Admin login error", err);
      setError("Network error during login.");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // 🔥 3. UI: Show "Checking session…" instead of flicker
  // -------------------------------
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ backgroundColor: NAVY }}>
        <div className="animate-pulse text-lg">Checking session…</div>
      </div>
    );
  }

  // Dropdown animation style
  const dropdownStyle = {
    minWidth: 140,
    transformOrigin: "bottom right",
    transition: "transform 140ms ease-out, opacity 140ms ease-out",
    transform: langOpen ? "translateY(0) scale(1)" : "translateY(6px) scale(0.98)",
    opacity: langOpen ? 1 : 0,
  };

  // -------------------------------
  // 🔥 4. ACTUAL LOGIN PAGE UI
  // -------------------------------
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative" style={{ backgroundColor: NAVY, fontFamily: "Poppins, sans-serif" }}>
      <header className="absolute top-20 w-full flex justify-center pointer-events-none">
        <h1 className="text-5xl md:text-6xl font-semibold italic text-white select-none">Welcome!</h1>
      </header>

      <main className="w-full max-w-xl px-6 mt-20 md:mt-28">
        <div className="bg-white rounded-[28px] p-10 md:p-12 mx-auto" style={{ boxShadow: "0 18px 30px rgba(2,6,23,0.35), inset 0 2px 0 rgba(255,255,255,0.6)" }}>
          <form className="max-w-lg mx-auto" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-black mb-3">Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              inputMode="email"
              autoComplete="email"
              className="w-full h-12 md:h-14 rounded-[12px] px-6 placeholder:text-gray-400 focus:outline-none"
              style={{ boxShadow: "0 6px 10px rgba(2,6,23,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}
            />

            <label className="block text-sm font-semibold text-black mt-8 mb-3">Password</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full h-12 md:h-14 rounded-[12px] px-6 pr-16 placeholder:text-gray-400 focus:outline-none"
                style={{ boxShadow: "0 6px 10px rgba(2,6,23,0.08)", border: "1px solid rgba(0,0,0,0.06)" }}
              />
              <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm px-2 py-1 rounded">
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>

            <div className="text-right mt-3">
              <a href="#" className="text-sm font-medium text-black hover:text-[#FF5722]" onClick={(e) => e.preventDefault()}>Forget Password?</a>
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <button type="submit" disabled={loading} className="mt-8 w-full h-12 md:h-14 rounded-full text-white font-semibold text-lg transition-all" style={{ background: ACCENT, boxShadow: "0 10px 20px rgba(255,87,34,0.25)" }}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </main>

      <div ref={langRef} className="absolute right-6 bottom-6 text-white text-sm opacity-95" style={{ fontFamily: "Poppins, sans-serif", zIndex: 60 }}>
        <div className="relative inline-block">
          <button type="button" onClick={() => setLangOpen(s => !s)} aria-haspopup="menu" aria-expanded={langOpen} className="flex items-center gap-2 rounded px-3 py-2 bg-white/10 hover:bg-white/20 transition">
            <span className="font-medium">{lang}</span>
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 7.5L10 12.25 14.75 7.5z" /></svg>
          </button>

          <div role="menu" aria-label="Language" style={dropdownStyle} className={`absolute right-0 bottom-full mb-3 rounded bg-white text-[#0b1221] shadow-lg overflow-hidden ${langOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <button role="menuitem" onClick={() => { setLang("EN"); setLangOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[#FFF3EF]">English (EN)</button>
            <button role="menuitem" onClick={() => { setLang("MR"); setLangOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[#FFF3EF]">Marathi (MR)</button>
            <button role="menuitem" onClick={() => { setLang("HI"); setLangOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[#FFF3EF]">Hindi (HI)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
