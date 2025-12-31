const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: {
        type: String,
        enum: ["employee", "ex-employee", "guest"],
        required: true,
      },
      employeeId: String,
      name: String,
      phone: String,
      email: String,
    },

    property: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
      name: String,
      location: String,
      upiId: String,

      officer: {
        name: String,
        designation: String,
        contact: String,
      },

      caretaker: {
        name: String,
        contact: String,
      },
    },

    bookingDetails: {
      category: String,
      adults: Number,
      children: Number,
      totalGuests: Number,
      checkIn: Date,
      checkOut: Date,
      days: Number,
    },

    pricing: {
      baseAmount: Number,
      gst: Number,
      totalAmount: Number,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid_online",
        "paid_on_rest_house",
        "pay_on_rest_house",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
