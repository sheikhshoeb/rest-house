"use client";

import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const NAVY = "#10375C";
const ORANGE = "#FF5722";

export default function ProfilePage() {
  // form state
  const [name, setName] = useState("Sheikh Shoeb");
  const [email, setEmail] = useState("contact@sheikhshoeb.com");
  const [employeeId, setEmployeeId] = useState("NT331250");
  const [mobile, setMobile] = useState("8889844180");
  const [password, setPassword] = useState("password123");
  const [editing, setEditing] = useState(false);

  // avatar upload / preview
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    // cleanup previously created object URL when avatarUrl changes or component unmounts
    return () => {
      if (avatarUrl && avatarUrl.startsWith && avatarUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(avatarUrl);
        } catch {
          // ignore
        }
      }
    };
    // note: avatarUrl included in closure above
  }, [avatarUrl]);

  function onPickFile() {
    if (fileRef.current) fileRef.current.click();
  }
  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    // revoke previous if any (safety)
    if (avatarUrl && avatarUrl.startsWith && avatarUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(avatarUrl);
      } catch {
        // ignore
      }
    }
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  }

  function onSave(e) {
    e?.preventDefault();
    // TODO: call API to save profile
    // collect form values and call fetch/axios endpoint
    alert("Saved (this demo only updates local state)");
    setEditing(false);
  }

  return (
    <div className="w-full min-h-screen bg-white font-[Poppins]">
      <div className="mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <aside
            className="lg:col-span-4 bg-[#10375C] text-white rounded-tr-[44px] rounded-br-[44px] overflow-hidden"
            style={{ minHeight: 640 }}
          >
            <div className="px-10 py-12 flex flex-col items-center">
              <h3 className="text-xl md:text-2xl font-medium mt-4">Employee Details</h3>

              {/* subtle underline */}
              <div className="w-20 h-[2px] bg-white/30 mt-4 mb-8" />

              {/* Avatar */}
              <div className="w-44 h-44 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden">
                <img
                  src={avatarUrl ?? "/images/profile.jpg"}
                  alt="avatar"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <h4 className="mt-8 text-2xl font-medium">{name}</h4>

              <div className="mt-4">
                <span className="inline-block bg-[#6f7f94]/50 px-4 py-2 rounded-md text-sm">
                  {employeeId}
                </span>
              </div>
            </div>

            {/* contact row at bottom */}
            <div className="mt-auto border-t border-white/20">
              <div className="px-8 py-6 flex flex-col gap-4 text-sm">
                {/* Email Row */}
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="text-white text-lg" />
                  <span className="text-sm break-words">{email}</span>
                </div>

                {/* Mobile Row */}
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faPhone} className="text-white text-lg" />
                  <span className="text-sm">{mobile}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right content / form */}
          <div className="lg:col-span-8 px-6 md:px-10">
            <div className="flex items-start justify-between">
              <div />
              {/* edit avatar / profile icon */}
              <button
                onClick={() => {
                  setEditing(true);
                  onPickFile();
                }}
                title="Edit profile"
                className="p-2 border rounded-md text-[#10375C] hover:bg-gray-50"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#10375C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#10375C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={onSave} className="space-y-6 mt-2">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#0b1221] mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 rounded-xl px-6 text-gray-700 bg-white shadow-sm border border-transparent focus:outline-none focus:ring-0"
                  placeholder="Full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#0b1221] mb-2">Email Id</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 rounded-xl px-6 text-gray-700 bg-white shadow-sm border border-transparent focus:outline-none focus:ring-0"
                  placeholder="email@example.com"
                />
              </div>

              {/* Employee Id */}
              <div>
                <label className="block text-sm font-semibold text-[#0b1221] mb-2">Employee Id</label>
                <input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full h-14 rounded-xl px-6 text-gray-700 bg-white shadow-sm border border-transparent focus:outline-none focus:ring-0"
                  placeholder="Employee id"
                />
              </div>

              {/* Mobile number */}
              <div>
                <label className="block text-sm font-semibold text-[#0b1221] mb-2">Mobile Number</label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full h-14 rounded-xl px-6 text-gray-700 bg-white shadow-sm border border-transparent focus:outline-none focus:ring-0"
                  placeholder="Mobile number"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#0b1221] mb-2">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full h-14 rounded-xl px-6 text-gray-700 bg-white shadow-sm border border-transparent focus:outline-none focus:ring-0"
                    placeholder="Password"
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full mx-auto block bg-[#FF5722] text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-[#e64b1f] transition"
                >
                  Save Changes
                </button>
              </div>

              {/* hidden file input */}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
