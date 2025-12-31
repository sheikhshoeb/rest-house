const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },

    rooms: {
      vvip: { type: Number, default: 0 },
      vip: { type: Number, default: 0 },
      general: { type: Number, default: 0 },
    },

    officer: {
      name: String,
      designation: String,
      contact: String,
    },

    caretaker: {
      name: String,
      contact: String,
    },

    upiId: String,
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
