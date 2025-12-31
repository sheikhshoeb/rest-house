"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Admin Register Page — temporary demo
 * Path: apps/admin/app/(auth)/register/page.js
 *
 * - Matches visual style of your login page
 * - Roles: Super Admin, Admin, Manager
 * - Basic client-side validation (required fields, password match)
 * - Replace handleSubmit with real API call
 */

const NAVY = "#10375C";
const ACCENT = "#FF5722";

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // language dropdown (copied minimal behavior from login)
  const [lang, setLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

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

  function validate() {
    const err = {};
    if (!fullName.trim()) err.fullName = "Full name is required";
    if (!email.trim()) err.email = "Email is required";
    else {
      // simple email regex
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) err.email = "Invalid email";
    }
    if (!password) err.password = "Password is required";
    if (!confirm) err.confirm = "Please confirm password";
    if (password && confirm && password !== confirm) err.confirm = "Passwords do not match";
    if (!role) err.role = "Role is required";
    return err;
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setErrors({});
  const err = validate();
  if (Object.keys(err).length) {
    setErrors(err);
    return;
  }

  setSubmitting(true);
  try {
    // Build form data (use FormData to support file upload in future)
    const form = new FormData();
    form.append('fullName', fullName.trim());
    form.append('email', email.trim());
    form.append('password', password);
    form.append('role', role);
    // if you add file input later: form.append('idCard', fileInput.files[0]);

    // ----- Choose the correct URL for your API -----
    // If your Express API runs on a separate port (recommended for dev):
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';
    const url = `${API_BASE}/api/admin-auth/register`;

    const res = await fetch(url, {
      method: 'POST',
      body: form,
      // DO NOT set Content-Type header with FormData — browser will set correct boundary
      credentials: 'include', // optional, sends cookies if same-site/allowed
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // prefer explicit error message from backend
      const msg = data.error || data.message || `Server returned ${res.status}`;
      alert('Registration failed: ' + msg);
      console.error('REGISTER ADMIN ERROR:', msg, data);
      setSubmitting(false);
      return;
    }

    // success
    alert(data.message || 'Admin created successfully');
    // optionally redirect to admin list or login page:
    // window.location.href = '/admin'; // or use Next router push
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setRole('Admin');
  } catch (networkErr) {
    console.error('Network error during register-admin', networkErr);
    alert('Network error. See console for details.');
  } finally {
    setSubmitting(false);
  }
}



  const inputBaseStyle = {
    boxShadow: "0 6px 10px rgba(2,6,23,0.08)",
    border: "1px solid rgba(0,0,0,0.06)",
    fontFamily: "Poppins, sans-serif",
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{ backgroundColor: NAVY, fontFamily: "Poppins, sans-serif" }}
    >
      <header className="absolute top-20 w-full flex justify-center pointer-events-none">
        <h1 className="text-5xl md:text-6xl font-semibold italic text-white select-none">Register Admin</h1>
      </header>

      <main className="w-full max-w-xl px-6 mt-20 md:mt-28">
        <div
          className="bg-white rounded-[28px] p-10 md:p-12 mx-auto"
          style={{ boxShadow: "0 18px 30px rgba(2,6,23,0.35), inset 0 2px 0 rgba(255,255,255,0.6)" }}
        >
          <form className="max-w-lg mx-auto" onSubmit={handleSubmit} noValidate>
            {/* Full name */}
            <label className="block text-sm font-semibold text-black mb-3">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className={`w-full h-12 md:h-14 rounded-[12px] px-6 placeholder:text-gray-400 focus:outline-none ${fullName ? "text-[#0b1221]" : "text-gray-700"}`}
              style={inputBaseStyle}
            />
            {errors.fullName && <div className="text-sm text-red-600 mt-2">{errors.fullName}</div>}

            {/* Email */}
            <label className="block text-sm font-semibold text-black mt-6 mb-3">Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              inputMode="email"
              autoComplete="email"
              className={`w-full h-12 md:h-14 rounded-[12px] px-6 placeholder:text-gray-400 focus:outline-none ${email ? "text-[#0b1221]" : "text-gray-700"}`}
              style={inputBaseStyle}
            />
            {errors.email && <div className="text-sm text-red-600 mt-2">{errors.email}</div>}

            {/* Role */}
            <label className="block text-sm font-semibold text-black mt-6 mb-3">Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 md:h-14 rounded-[12px] px-6 pr-10 placeholder:text-gray-400 focus:outline-none appearance-none"
                style={inputBaseStyle}
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>

              <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M5.25 7.5L10 12.25 14.75 7.5z" />
              </svg>
            </div>
            {errors.role && <div className="text-sm text-red-600 mt-2">{errors.role}</div>}

            {/* Password */}
            <label className="block text-sm font-semibold text-black mt-6 mb-3">Password</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                className={`w-full h-12 md:h-14 rounded-[12px] px-6 pr-16 placeholder:text-gray-400 focus:outline-none ${password ? "text-[#0b1221]" : "text-gray-700"}`}
                style={inputBaseStyle}
              />

              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm px-2 py-1 rounded"
                aria-label={showPwd ? "Hide password" : "Show password"}
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <div className="text-sm text-red-600 mt-2">{errors.password}</div>}

            {/* Confirm Password */}
            <label className="block text-sm font-semibold text-black mt-6 mb-3">Confirm password</label>
            <div className="relative">
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                autoComplete="new-password"
                className={`w-full h-12 md:h-14 rounded-[12px] px-6 pr-16 placeholder:text-gray-400 focus:outline-none ${confirm ? "text-[#0b1221]" : "text-gray-700"}`}
                style={inputBaseStyle}
              />

              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm px-2 py-1 rounded"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirm && <div className="text-sm text-red-600 mt-2">{errors.confirm}</div>}

            {/* Register Button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full h-12 md:h-14 rounded-full text-white font-semibold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: ACCENT, boxShadow: "0 10px 20px rgba(255,87,34,0.25)", fontFamily: "Poppins, sans-serif" }}
            >
              {submitting ? "Registering..." : "Create Admin"}
            </button>
          </form>
        </div>
      </main>

      {/* Bottom language selector (same pattern as login) */}
      <div ref={langRef} className="absolute right-6 bottom-6 text-white text-sm opacity-95" style={{ fontFamily: "Poppins, sans-serif", zIndex: 60 }}>
        <div className="relative inline-block">
          {/* Toggle */}
          <button
            type="button"
            onClick={() => setLangOpen((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={langOpen}
            className="flex items-center gap-2 rounded px-3 py-2 bg-white/10 hover:bg-white/20 transition"
          >
            <span className="font-medium">{lang}</span>
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M5.25 7.5L10 12.25 14.75 7.5z" />
            </svg>
          </button>

          <div
            role="menu"
            aria-label="Language"
            style={{
              minWidth: 140,
              transformOrigin: "bottom right",
              transition: "transform 140ms ease-out, opacity 140ms ease-out",
              transform: langOpen ? "translateY(0) scale(1)" : "translateY(6px) scale(0.98)",
              opacity: langOpen ? 1 : 0,
            }}
            className={`absolute right-0 bottom-full mb-3 rounded bg-white text-[#0b1221] shadow-lg overflow-hidden ${langOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <button
              role="menuitem"
              onClick={() => {
                setLang("EN");
                setLangOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#FFF3EF]"
            >
              English (EN)
            </button>

            <button
              role="menuitem"
              onClick={() => {
                setLang("MR");
                setLangOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#FFF3EF]"
            >
              Marathi (MR)
            </button>

            <button
              role="menuitem"
              onClick={() => {
                setLang("HI");
                setLangOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[#FFF3EF]"
            >
              Hindi (HI)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
