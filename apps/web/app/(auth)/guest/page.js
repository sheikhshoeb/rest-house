"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEFAULT_FILE_LABEL = "No file chosen";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+\-\s()]{7,20}$/;

export default function GuestRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [touched, setTouched] = useState({});
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  function openFilePicker() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function onFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview(URL.createObjectURL(f));
    } else {
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  }

  function fileNameLabel() {
    return file ? file.name : DEFAULT_FILE_LABEL;
  }

  function setFieldTouched(name) {
    setTouched((t) => ({ ...t, [name]: true }));
  }

  function validateField(name) {
    const v = {
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
    };

    return v[name] ? v[name]() : null;
  }

  function formIsValid() {
    return (
      !validateField("fullName") &&
      !validateField("email") &&
      !validateField("password")
    );
  }

  async function submit(e) {
    e.preventDefault();
    setGlobalError(null);

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
    });

    if (!formIsValid()) {
      setGlobalError("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("fullName", fullName.trim());
      fd.append("email", email.trim());
      fd.append("phone", phone.trim());
      fd.append("password", password);
      if (file) fd.append("idCard", file);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
        }/api/auth/register-guest`,
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");

      setSuccessMessage("Registration successful — redirecting to login…");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      const msg = err?.message ? err.message : String(err);
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-[Poppins] flex flex-col items-center">
      <header className="pt-12 text-center w-full">
        <h1 className="text-4xl sm:text-4xl font-extrabold text-[#10375C] self-center">
          Guest Registration
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto px-6">
          Register as a guest to make bookings with limited privileges. If you
          do have an Employee ID, please register via the{" "}
          <Link href="/register" className="font-semibold text-[#FF5722]">
            Employee registration
          </Link>{" "}
          form.
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
            <form
              onSubmit={submit}
              className="max-w-2xl mx-auto"
              encType="multipart/form-data"
              noValidate
            >
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

              {/* Full Name */}
              <label className="block text-sm font-semibold mb-2 text-gray-800">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => setFieldTouched("fullName")}
                placeholder="Your full name"
                required
                aria-invalid={!!(touched.fullName && validateField("fullName"))}
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow
                  ${
                    touched.fullName && validateField("fullName")
                      ? "ring-2 ring-red-200 border-red-300"
                      : "focus:ring-2 focus:ring-[#FF5722]/40"
                  }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {touched.fullName && validateField("fullName") && (
                <div className="text-sm text-red-600 mt-2">
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
                aria-invalid={!!(touched.email && validateField("email"))}
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow
                  ${
                    touched.email && validateField("email")
                      ? "ring-2 ring-red-200 border-red-300"
                      : "focus:ring-2 focus:ring-[#FF5722]/40"
                  }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {touched.email && validateField("email") && (
                <div className="text-sm text-red-600 mt-2">
                  {validateField("email")}
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
                className={`w-full h-12 rounded-xl px-4 focus:outline-none transition-shadow
                  ${
                    touched.phone && validateField("phone")
                      ? "ring-2 ring-red-200 border-red-300"
                      : "focus:ring-2 focus:ring-[#FF5722]/40"
                  }`}
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              />
              {touched.phone && validateField("phone") && (
                <div className="text-sm text-red-600 mt-2">
                  {validateField("phone")}
                </div>
              )}

              {/* Upload ID */}
              <label className="block text-sm font-semibold mt-6 mb-2 text-gray-800">
                Upload ID (image or PDF, optional)
              </label>
              <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFilePicker();
                  }
                }}
                className="w-full h-12 rounded-xl px-4 flex items-center justify-between cursor-pointer border transition-shadow focus-within:ring-2 focus-within:ring-[#FF5722]/40"
                style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
              >
                <span
                  className={`${
                    file ? "text-gray-900" : "text-gray-500"
                  } text-sm truncate`}
                >
                  {fileNameLabel()}
                </span>
                <span className="text-[#FF5722] font-semibold text-sm select-none">
                  Browse
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={onFileChange}
                style={{ display: "none" }}
                tabIndex={-1}
              />
              {filePreview && (
                <div className="mt-3">
                  <img
                    src={filePreview}
                    alt="ID preview"
                    className="h-28 object-contain rounded-md shadow-sm"
                  />
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
                  className={`w-full h-12 rounded-xl px-4 pr-14 focus:outline-none transition-shadow
                    ${
                      touched.password && validateField("password")
                        ? "ring-2 ring-red-200 border-red-300"
                        : "focus:ring-2 focus:ring-[#FF5722]/40"
                    }`}
                  style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.03)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {touched.password && validateField("password") && (
                <div className="text-sm text-red-600 mt-2">
                  {validateField("password")}
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
                {loading ? "Registering…" : "Register & Continue"}
              </button>
            </form>
          </div>

          {/* OR / Other options */}
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
                <div className="text-sm font-medium text-gray-800">
                  Already registered?
                </div>
                <div className="text-xs text-gray-500">
                  Sign in to your account
                </div>
              </div>
            </Link>

            <Link
              href="/register"
              className="flex items-center justify-center rounded-2xl p-4 border border-dashed border-gray-300 hover:border-[#FF5722] transition"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-[#10375C]">
                  Employee Registration
                </div>
                <div className="text-xs text-gray-500">
                  Register with your Employee ID (full access)
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
