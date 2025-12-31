"use client";

import React, { useState, useEffect } from "react";

import Sidebar from "../../../components/Sidebar";
import useAdminAuth from "../../../components/useAdminAuth";

const GST_RATE = 0.18;

export default function PricingPage() {
  const authStatus = useAdminAuth();

  const [prices, setPrices] = useState({
    employee: 100,
    "ex-employee": 500,
    guest: 1000,
  });

  const [editingKey, setEditingKey] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    if (authStatus !== "authed") return;

    const fetchPricing = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        setPrices({
          employee: data.employee,
          "ex-employee": data.exEmployee,
          guest: data.guest,
        });
      } catch (err) {
        alert("Failed to load pricing");
      }
    };

    fetchPricing();
  }, [authStatus]);

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking admin session…
      </div>
    );
  }
  if (authStatus === "unauth") return null;

  const gstAmount = (base) => Math.round(base * GST_RATE);
  const totalAmount = (base) => base + gstAmount(base);

  const handleChange = (key, value) => {
    setPrices((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSavingKey("saving");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pricing`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee: prices.employee,
            exEmployee: prices["ex-employee"],
            guest: prices.guest,
          }),
        }
      );

      if (!res.ok) throw new Error();

      setEditingKey(null);
      alert("Pricing updated successfully");
    } catch {
      alert("Failed to save pricing");
    } finally {
      setSavingKey(null);
    }
  };

  const renderCard = (label, key) => (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1">₹ {prices[key]}</p>
      <p className="text-xs text-gray-400 mt-1">
        Final: ₹ {totalAmount(prices[key])} (incl. GST)
      </p>
    </div>
  );

  const renderRow = (label, key) => (
    <tr className="border-b last:border-none">
      <td className="py-4 font-medium">{label}</td>

      <td>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={prices[key]}
          disabled={editingKey !== key}
          onKeyDown={(e) => {
            if (["-", "e", "E", "+"].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const paste = e.clipboardData.getData("text");
            if (!/^\d+$/.test(paste)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const value = Math.max(0, Number(e.target.value));
            handleChange(key, value);
          }}
          className={`w-32 border rounded-lg px-3 py-1.5 transition
    ${
      editingKey === key
        ? "bg-white"
        : "bg-gray-100 cursor-not-allowed text-gray-600"
    }`}
        />
      </td>

      <td className="text-gray-600">18%</td>

      <td className="font-semibold">₹ {totalAmount(prices[key])}</td>

      <td className="text-right">
        <div className="inline-flex justify-end min-w-[110px]">
          {editingKey === key ? (
            <button
              disabled={savingKey === key}
              onClick={handleSave}
              className={`cursor-pointer w-[100px] px-4 py-1.5 rounded-lg text-sm border
    ${
      savingKey === key
        ? "opacity-50 cursor-not-allowed"
        : "bg-green-50 text-green-700"
    }`}
            >
              {savingKey === key ? "Saving…" : "Save"}
            </button>
          ) : (
            <button
              onClick={() => {
                if (editingKey) return;
                setEditingKey(key);
              }}
              className="cursor-pointer w-[100px] px-4 py-1.5 rounded-lg text-sm border bg-blue-50 text-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div
      className="min-h-screen bg-white text-[14px]"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="flex pt-4 md:pt-8 px-4 md:px-8 gap-4 md:gap-8">
        {/* Sidebar unchanged */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 space-y-6">
          {/* HEADER */}
          <div>
            <h1 className="text-2xl font-semibold text-[#10375C]">
              Booking Pricing
            </h1>
            <p className="text-gray-500 mt-1">
              Manage booking prices per user category.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderCard("Employee", "employee")}
            {renderCard("Ex-Employee", "ex-employee")}
            {renderCard("Guest", "guest")}
          </div>

          {/* PRICING TABLE */}
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="hidden md:block">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="w-[20%]">User Type</th>
                    <th className="w-[20%]">Base Price (₹)</th>
                    <th className="w-[10%]">GST</th>
                    <th className="w-[20%]">Total Price</th>
                    <th className="w-[30%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {renderRow("Employee", "employee")}
                  {renderRow("Ex-Employee", "ex-employee")}
                  {renderRow("Guest", "guest")}
                </tbody>
              </table>
            </div>
            {/* ---------- MOBILE PRICING CARDS ---------- */}
            <div className="md:hidden space-y-4">
              {[
                { label: "Employee", key: "employee" },
                { label: "Ex-Employee", key: "ex-employee" },
                { label: "Guest", key: "guest" },
              ].map(({ label, key }) => (
                <div
                  key={key}
                  className="border rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{label}</p>
                    <span className="text-xs text-gray-500">GST 18%</span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Base Price:</strong> ₹ {prices[key]}
                    </p>
                    <p className="text-gray-600">
                      <strong>Total:</strong> ₹ {totalAmount(prices[key])}
                    </p>
                  </div>

                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={prices[key]}
                    disabled={editingKey !== key}
                    onKeyDown={(e) => {
                      if (["-", "e", "E", "+"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData("text");
                      if (!/^\d+$/.test(paste)) e.preventDefault();
                    }}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      handleChange(key, value);
                    }}
                    className={`w-full border rounded-lg px-3 py-2 transition
          ${
            editingKey === key
              ? "bg-white"
              : "bg-gray-100 cursor-not-allowed text-gray-600"
          }`}
                  />

                  {editingKey === key ? (
                    <button
                      disabled={savingKey === key}
                      onClick={handleSave}
                      className={`w-full px-4 py-2 rounded-lg text-sm border
            ${
              savingKey === key
                ? "opacity-50 cursor-not-allowed"
                : "bg-green-50 text-green-700"
            }`}
                    >
                      {savingKey === key ? "Saving…" : "Save"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (editingKey) return;
                        setEditingKey(key);
                      }}
                      className="w-full px-4 py-2 rounded-lg text-sm border bg-blue-50 text-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <p className="text-xs text-gray-500">
            * Click <strong>Edit</strong> to modify a price. * GST is applied
            automatically at 18%.
          </p>
        </main>
      </div>
    </div>
  );
}
