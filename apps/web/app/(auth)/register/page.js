// apps/web/app/(auth)/register/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+\-\s()]{7,20}$/;

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [checkingEmp, setCheckingEmp] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [employmentStatus, setEmploymentStatus] = useState("employee");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";

  // ---- 0) CLIENT SESSION CHECK: redirect to /home if logged in
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
          router.replace("/home");
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        console.warn("Client session check error (register):", err);
        if (mounted) setCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      mounted = false;
    };
  }, [API_BASE, router]);

  function setFieldTouched(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  }

  function validateField(name) {
    const v = {
      employeeId: () => (employeeId.trim() ? null : "Employee ID is required"),
      fullName: () => (fullName.trim() ? null : "Full name is required"),
      email: () =>
        email.trim()
          ? EMAIL_RE.test(email.trim())
            ? null
            : "Enter a valid email address"
          : "Email is required",
      phone: () =>
        phone.trim()
          ? PHONE_RE.test(phone.trim())
            ? null
            : "Enter a valid phone"
          : null,
      password: () =>
        password.length >= 8 ? null : "Password must be at least 8 characters",
      confirmPassword: () =>
        confirmPassword === password ? null : "Passwords do not match",
    };
    return v[name] ? v[name]() : null;
  }

  function formIsValid() {
    return (
      !validateField("employeeId") &&
      !validateField("fullName") &&
      !validateField("email") &&
      !validateField("password") &&
      !validateField("confirmPassword") &&
      !fieldErrors.employeeId
    );
  }

  // blur-check employeeId by calling API
  async function checkEmployeeIdOnBlur() {
    setFieldErrors((f) => ({ ...f, employeeId: undefined }));
    if (!employeeId.trim()) return;
    setCheckingEmp(true);
    try {
      const url = `${API_BASE}/api/auth/check-employee?employeeId=${encodeURIComponent(
        employeeId.trim()
      )}`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors((f) => ({
          ...f,
          employeeId: "Unable to validate Employee ID",
        }));
        return;
      }
      if (!data.exists) {
        setFieldErrors((f) => ({
          ...f,
          employeeId: "Please enter a valid Employee ID",
        }));
      } else {
        setFieldErrors((f) => ({ ...f, employeeId: undefined }));
      }
    } catch (err) {
      console.error("checkEmployeeIdOnBlur", err);
      setFieldErrors((f) => ({
        ...f,
        employeeId: "Unable to validate Employee ID",
      }));
    } finally {
      setCheckingEmp(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    // mark touched for validations
    setTouched({
      employeeId: true,
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!formIsValid()) {
      setGlobalError("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      // We no longer send a file; API expects same fields (password included)
      const payload = {
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: employmentStatus, // ✅ "employee" | "ex-employee"
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        // send as JSON (server currently expects multipart/form-data for idCard,
        // but will accept JSON if you changed server; if server still requires multipart,
        // switch to FormData here — let me know and I can change it)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data?.error || `Registration failed (${res.status})`;
        if (errMsg.toLowerCase().includes("employee id")) {
          setFieldErrors((f) => ({ ...f, employeeId: errMsg }));
        } else if (errMsg.toLowerCase().includes("email")) {
          setFieldErrors((f) => ({ ...f, email: errMsg }));
        } else {
          setGlobalError(errMsg);
        }
        return;
      }

      setSuccessMessage("Registration successful — redirecting to login…");
      setTimeout(() => {
        router.push("/login");
      }, 900);
    } catch (err) {
      console.error("register submit error", err);
      setGlobalError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  // while we check session, show spinner instead of form to avoid flicker
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
      <header className="pt-12 text-center w-full">
        <h1 className="text-4xl sm:text-4xl font-extrabold text-[#10375C] self-center">
          Employee / Ex-Employee Registration
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto px-6">
          Register with your official Employee ID to access full Rest House
          booking privileges. If you don&apos;t have an Employee ID, you can{" "}
          <Link href="/guest" className="font-semibold text-[#FF5722]">
            continue as a guest
          </Link>
          .
        </p>
      </header>

      <main className="w-full flex-1 flex flex-col items-center py-10">
        <div className="relative w-full max-w-3xl px-6">
          <div
            className="bg-white rounded-2xl px-8 py-8 md:py-12"
            style={{
              boxShadow:
                "0 10px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <form onSubmit={submit} className="max-w-2xl mx-auto" noValidate>
              {/* GLOBAL ERROR / SUCCESS */}
              <div aria-live="polite" className="min-h-[1.5rem]">
                {globalError && (
                  <div className="text-red-700 bg-red-50 px-4 py-2 rounded-md mb-4">
                    {globalError}
                  </div>
                )}
                {successMessage && (
                  <div className="text-green-800 bg-green-50 px-4 py-2 rounded-md mb-4">
                    {successMessage}
                  </div>
                )}
              </div>

              {/* Employee / Ex-Employee Toggle */}
              <label className="block text-sm font-semibold mb-2 text-gray-800">
                Employment Status
              </label>

              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setEmploymentStatus("employee")}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition cursor-pointer ${
                    employmentStatus === "employee"
                      ? "bg-[#FF5722] text-white border-[#FF5722]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#FF5722]"
                  }`}
                >
                  Employee
                </button>

                <button
                  type="button"
                  onClick={() => setEmploymentStatus("ex-employee")}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition cursor-pointer ${
                    employmentStatus === "ex-employee"
                      ? "bg-[#FF5722] text-white border-[#FF5722]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#FF5722]"
                  }`}
                >
                  Ex-Employee
                </button>
              </div>

              {/* Employee ID */}
              <label className="block text-sm font-semibold mb-2 text-gray-800">
                Employee ID
              </label>
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onBlur={() => {
                  setFieldTouched("employeeId");
                  checkEmployeeIdOnBlur();
                }}
                placeholder="e.g. EMP12345"
                aria-invalid={
                  !!(
                    touched.employeeId &&
                    (validateField("employeeId") || fieldErrors.employeeId)
                  )
                }
                aria-describedby="empid-error"
                required
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow ${
                  touched.employeeId &&
                  (validateField("employeeId") || fieldErrors.employeeId)
                    ? "ring-2 ring-red-200 border-red-300"
                    : "focus:ring-2 focus:ring-[#FF5722]/40"
                }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {checkingEmp && (
                <div className="text-xs text-gray-500 mt-2">
                  Checking Employee ID…
                </div>
              )}
              {touched.employeeId && validateField("employeeId") && (
                <div id="empid-error" className="text-sm text-red-600 mt-2">
                  {validateField("employeeId")}
                </div>
              )}
              {fieldErrors.employeeId && (
                <div className="text-sm text-red-600 mt-2">
                  {fieldErrors.employeeId}
                </div>
              )}

              {/* Full Name */}
              <label className="block text-sm font-semibold mt-6 mb-2 text-gray-800">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => setFieldTouched("fullName")}
                placeholder="Your full name"
                required
                aria-invalid={!!(touched.fullName && validateField("fullName"))}
                aria-describedby="fullname-error"
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow ${
                  touched.fullName && validateField("fullName")
                    ? "ring-2 ring-red-200 border-red-300"
                    : "focus:ring-2 focus:ring-[#FF5722]/40"
                }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {touched.fullName && validateField("fullName") && (
                <div id="fullname-error" className="text-sm text-red-600 mt-2">
                  {validateField("fullName")}
                </div>
              )}

              {/* Email */}
              <label className="block text-sm font-semibold mt-6 mb-2 text-gray-800">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setFieldTouched("email")}
                placeholder="email@example.com"
                type="email"
                required
                aria-invalid={
                  !!(
                    touched.email &&
                    (validateField("email") || fieldErrors.email)
                  )
                }
                aria-describedby="email-error"
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow ${
                  touched.email && (validateField("email") || fieldErrors.email)
                    ? "ring-2 ring-red-200 border-red-300"
                    : "focus:ring-2 focus:ring-[#FF5722]/40"
                }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {touched.email && validateField("email") && (
                <div id="email-error" className="text-sm text-red-600 mt-2">
                  {validateField("email")}
                </div>
              )}
              {fieldErrors.email && (
                <div className="text-sm text-red-600 mt-2">
                  {fieldErrors.email}
                </div>
              )}

              {/* Phone */}
              <label className="block text-sm font-semibold mt-6 mb-2 text-gray-800">
                Phone (optional)
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setFieldTouched("phone")}
                placeholder="+91 98765 43210"
                type="tel"
                aria-invalid={!!(touched.phone && validateField("phone"))}
                aria-describedby="phone-error"
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow ${
                  touched.phone && validateField("phone")
                    ? "ring-2 ring-red-200 border-red-300"
                    : "focus:ring-2 focus:ring-[#FF5722]/40"
                }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {touched.phone && validateField("phone") && (
                <div id="phone-error" className="text-sm text-red-600 mt-2">
                  {validateField("phone")}
                </div>
              )}

              {/* Password */}
              <label className="block text-sm font-semibold mt-6 mb-2 text-gray-800">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setFieldTouched("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Choose a strong password (min 8 chars)"
                  required
                  aria-invalid={
                    !!(touched.password && validateField("password"))
                  }
                  aria-describedby="password-error"
                  className={`w-full h-12 rounded-xl px-4 pr-14 focus:outline-none transition-shadow ${
                    touched.password && validateField("password")
                      ? "ring-2 ring-red-200 border-red-300"
                      : "focus:ring-2 focus:ring-[#FF5722]/40"
                  }`}
                  style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {touched.password && validateField("password") && (
                <div id="password-error" className="text-sm text-red-600 mt-2">
                  {validateField("password")}
                </div>
              )}

              {/* Confirm Password */}
              <label className="block text-sm font-semibold mt-6 mb-2 text-gray-800">
                Confirm Password
              </label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setFieldTouched("confirmPassword")}
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                required
                aria-invalid={
                  !!(
                    touched.confirmPassword && validateField("confirmPassword")
                  )
                }
                aria-describedby="confirm-password-error"
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow ${
                  touched.confirmPassword && validateField("confirmPassword")
                    ? "ring-2 ring-red-200 border-red-300"
                    : "focus:ring-2 focus:ring-[#FF5722]/40"
                }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {touched.confirmPassword && validateField("confirmPassword") && (
                <div
                  id="confirm-password-error"
                  className="text-sm text-red-600 mt-2"
                >
                  {validateField("confirmPassword")}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !formIsValid()}
                className="mt-8 w-full h-12 rounded-xl text-white font-semibold text-lg cursor-pointer transition-opacity disabled:cursor-default disabled:opacity-60"
                style={{
                  background: "#FF5722",
                  boxShadow: "0 6px 14px rgba(255,87,34,0.18)",
                }}
              >
                {loading ? "Registering…" : "Register & Request Verification"}
              </button>
            </form>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className="h-px w-28 bg-gray-300"></span>
            <span className="text-sm italic text-gray-600">or</span>
            <span className="h-px w-28 bg-gray-300"></span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/login"
              className="flex items-center justify-center rounded-2xl p-4 border border-gray-200 hover:shadow-md transition"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800 text-center">
                  Already registered?
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Sign in to your account
                </div>
              </div>
            </Link>

            <Link
              href="/guest"
              className="flex items-center justify-center rounded-2xl p-4 border border-dashed border-gray-300 hover:border-[#FF5722] transition"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-[#10375C] text-center">
                  Continue as Guest
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Proceed without Employee ID (limited access)
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="pb-12"></footer>
    </div>
  );
}
