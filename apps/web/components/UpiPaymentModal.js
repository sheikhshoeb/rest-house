"use client";
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function UpiPaymentModal({ open, onClose, booking }) {
  if (!open || !booking) return null;

  const upiId = booking.property?.upiId;
  const amount = booking.pricing?.totalAmount;
  const propertyName = booking.property?.name || "Rest House";

  if (!upiId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl w-full max-w-md p-6">
          <p className="text-red-600 font-medium">
            UPI ID not configured for this property.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 border rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ✅ Generate UPI payment URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(
    propertyName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent("Booking Payment")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-extrabold text-[#0b1221] mb-4">
          Pay via UPI
        </h2>

        {/* Amount */}
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-500">Amount to Pay</div>
          <div className="text-2xl font-bold text-[#FF5722]">₹{amount}</div>
        </div>

        {/* QR CODE */}
        <div className="flex justify-center my-4">
          <div className="p-4 rounded-xl bg-white shadow-sm">
            <QRCodeCanvas
              value={upiUri}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin
            />
          </div>
        </div>

        {/* UPI ID */}
        <div className="rounded-xl p-3 bg-gray-50 text-center">
          <div className="text-xs text-gray-500 mb-1">UPI ID</div>
          <div className="font-mono text-sm break-all">{upiId}</div>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          Scan using Google Pay / PhonePe / Paytm.
          <br />
          After payment, booking will be verified by admin.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(upiId);
              alert("UPI ID copied");
            }}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium cursor-pointer"
          >
            Copy UPI ID
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-3 rounded-xl font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
