// api/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  employeeId: { type: String, trim: true, index: true, sparse: true }, // only for employees
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["guest", "employee", "ex-employee", "admin"],
    default: "guest",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  }, // for guests, and for employees you can set approved on creation
  idCardPath: { type: String }, // path to uploaded file
  createdAt: { type: Date, default: Date.now },
});

// ensure unique employeeId only when present (unique+ sparse or manual check)
UserSchema.index({ employeeId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", UserSchema);
