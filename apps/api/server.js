// apps/api/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

/**
 * CORS origins:
 * - USER_ORIGINS: comma-separated origins for user frontend (main website)
 * - ADMIN_ORIGINS: comma-separated origins for admin frontend (admin subdomain)
 *
 * Fallback dev defaults are provided below.
 */
const userOriginsEnv = process.env.USER_ORIGINS || "http://localhost:3000";
const adminOriginsEnv = process.env.ADMIN_ORIGINS || "http://localhost:3001";
const USER_ORIGINS = userOriginsEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ADMIN_ORIGINS = adminOriginsEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = Array.from(
  new Set([...USER_ORIGINS, ...ADMIN_ORIGINS])
);

/* ---------------------------
   Middlewares
---------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files (make sure /uploads exists)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---------------------------
   CORS
---------------------------- */
app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser requests (curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
      // explicit error for denied origins (helps debugging)
      const msg = `CORS origin not allowed: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    },
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

/* Optional: simple request logging in dev */
if (process.env.NODE_ENV !== "production") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

/* ---------------------------
   Route mounts
   - /api/auth       -> user auth (register/login/me/logout)
   - /api/admin-auth -> admin auth (register/login/me/logout)
   - /api/admin      -> admin-only actions (approve/reject etc) — protected by middleware
---------------------------- */
const authRoutes = require("./routes/auth"); // user auth
const adminAuthRoutes = require("./routes/adminAuth"); // admin auth (separate)
const adminRoutes = require("./routes/admin"); // admin actions
const adminEmployeeIdRoutes = require("./routes/adminEmployeeIds");
const adminRestHouseRoutes = require("./routes/adminRestHouses");
const adminPricingRoutes = require("./routes/adminPricing");
const zoneRoutes = require("./routes/zones");
const propertyRoutes = require("./routes/properties");
const bookingRoutes = require("./routes/bookings");
const adminBookingRoutes = require("./routes/adminBookings");

app.use("/api/auth", authRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/employee-ids", adminEmployeeIdRoutes);
app.use("/api/admin/rest-houses", adminRestHouseRoutes);
app.use("/api/admin/pricing", adminPricingRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);

/* ---------------------------
   Health and 404
---------------------------- */
app.get("/", (req, res) => res.send("API is working 🚀"));

// 404 for unknown API routes (helps debugging)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Generic 404 for other routes
app.use((req, res) => {
  res.status(404).send("Not Found");
});

/* ---------------------------
   Central error handler
---------------------------- */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ error: message });
});

/* ---------------------------
   Start server after DB connect
---------------------------- */
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () =>
      console.log(`API running on port ${PORT}`)
    );

    // graceful shutdown
    const shutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log("HTTP server closed.");
        // if you have other cleanup (DB disconnect) do here
        process.exit(0);
      });
      // force shutdown after 10s
      setTimeout(() => {
        console.warn("Forcing shutdown.");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error(
      "Failed to start server due to DB error:",
      err.message || err
    );
    process.exit(1);
  }
};

startServer();

module.exports = app;
