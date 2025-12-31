// apps/api/models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Super Admin', 'Admin', 'Manager'], default: 'Admin' },
  phone: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  // optional fields you might want for admin audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

module.exports = mongoose.model('Admin', AdminSchema);
