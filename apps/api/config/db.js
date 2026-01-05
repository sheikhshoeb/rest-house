// apps/api/config/db.js
const mongoose = require("mongoose");

// Load .env ONLY in local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error("❌ MONGO_URI not found in environment variables");
      process.exit(1); // stop server properly
    }

    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message || error);
    process.exit(1); // prevent restart loop with bad state
  }
}

module.exports = connectDB;
