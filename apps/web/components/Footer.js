"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLocationDot, faPhone } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleSubscribe(e) {
    e.preventDefault();
    setEmail("");
    alert("Thanks — subscription received (demo).");
  }

  return (
    <footer className="bg-[#10375C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* LEFT: Logo + Contact */}
          <div className="space-y-6">
            <div className="w-48">
              <Image
                src="/images/govt-of-india.png"
                alt="Government of India"
                width={220}
                height={80}
                priority
              />
            </div>

            <div className="mt-2 space-y-4 text-sm">

              {/* Email */}
              <div className="flex items-center gap-4">
                <FontAwesomeIcon icon={faEnvelope} className="text-white text-lg" />
                <span>support@govbooking.maharashtra.in</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <FontAwesomeIcon icon={faLocationDot} className="text-white text-lg" />
                <span>5411 Pine Place, Mumbai, MH 400162</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <FontAwesomeIcon icon={faPhone} className="text-white text-lg" />
                <span>+91 2456845693</span>
              </div>

            </div>
          </div>

          {/* CENTER: Support Links */}
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-semibold mb-4">Support</h3>

            <div className="h-0.5 bg-[#FF5722] w-full max-w-[80px] mb-6"></div>

            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/help" className="hover:text-[#FF5722]">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FF5722]">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-[#FF5722]">
                  Legal
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FF5722]">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-[#FF5722]">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* RIGHT: QR + Subscribe */}
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <div className="w-28 h-28 bg-white p-2 rounded">
                <Image
                  src="/images/qr.jpg"
                  alt="QR code"
                  width={112}
                  height={112}
                />
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-4">Stay up to date</h4>

            <div className="w-full md:w-80">
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-[#26455f] placeholder:text-gray-300 text-white px-4 py-3 focus:outline-none"
                  required
                />

                <button
                  aria-label="subscribe"
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF5722] rounded px-3 py-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>

        </div>

        <div className="mt-10 text-sm text-gray-200 text-center">
          © {new Date().getFullYear()} Rest House — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
