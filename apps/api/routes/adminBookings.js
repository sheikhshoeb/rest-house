const express = require("express");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const Pricing = require("../models/Pricing");
const calculatePricing = require("../utils/calculatePricing");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/admin/bookings
 */
router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("ADMIN FETCH BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/**
 * PATCH /api/admin/bookings/:id/approve
 */
router.patch(
  "/:id/approve",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      await Booking.findByIdAndUpdate(req.params.id, { status: "approved" });
      res.json({ success: true });
    } catch (err) {
      console.error("APPROVE ERROR:", err);
      res.status(500).json({ error: "Failed to approve booking" });
    }
  }
);

/**
 * PATCH /api/admin/bookings/:id/reject
 */
router.patch(
  "/:id/reject",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      await Booking.findByIdAndUpdate(req.params.id, { status: "rejected" });
      res.json({ success: true });
    } catch (err) {
      console.error("REJECT ERROR:", err);
      res.status(500).json({ error: "Failed to reject booking" });
    }
  }
);

/**
 * POST /api/admin/bookings/create
 * Admin-created booking (manual user)
 */
router.post(
  "/create",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        role,
        employeeId,
        name,
        phone,
        email,
        propertyId,
        category,
        adults,
        children,
        checkIn,
        checkOut,
        paymentStatus,
      } = req.body;

      // ---- Validate ----
      if (!role || !name || !phone || !propertyId || !checkIn || !checkOut) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // ---- Fetch Property ----
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      // ---- Fetch Pricing ----
      const pricing = await Pricing.findOne().sort({ createdAt: -1 });
      if (!pricing) {
        return res.status(500).json({ error: "Pricing not configured" });
      }

      // ---- Calculate Pricing ----
      const priceResult = calculatePricing({
        checkIn,
        checkOut,
        adults,
        children,
        role,
        pricing,
      });

      // ---- Create Booking ----
      const booking = await Booking.create({
        user: {
          role,
          employeeId: role !== "guest" ? employeeId : null,
          name,
          phone,
          email,
        },
        property: {
          id: property._id,
          name: property.name,
          location: property.location,
          upiId: property.upiId,
          officer: property.officer,
          caretaker: property.caretaker,
        },
        bookingDetails: {
          category,
          adults,
          children,
          totalGuests: priceResult.totalGuests,
          checkIn,
          checkOut,
          days: priceResult.days,
        },
        pricing: {
          baseAmount: priceResult.baseAmount,
          gst: priceResult.gst,
          totalAmount: priceResult.totalAmount,
        },
        paymentStatus: paymentStatus || "pending",
        status: "approved",
      });

      res.json({ success: true, booking });
    } catch (err) {
      console.error("ADMIN CREATE BOOKING ERROR:", err);
      res.status(500).json({ error: "Failed to create booking" });
    }
  }
);

module.exports = router;
