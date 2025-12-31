const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema(
  {
    employee: { type: Number, required: true, min: 0 },
    exEmployee: { type: Number, required: true, min: 0 },
    guest: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pricing", PricingSchema);
