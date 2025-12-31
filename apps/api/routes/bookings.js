const express = require("express");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const Pricing = require("../models/Pricing");
const calculatePricing = require("../utils/calculatePricing");
const { authMiddleware } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /api/bookings
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { propertyId, category, adults, children, checkIn, checkOut } =
      req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const pricing = await Pricing.findOne().sort({ createdAt: -1 });
    if (!pricing) {
      return res.status(500).json({ error: "Pricing not configured" });
    }

    const priceResult = calculatePricing({
      checkIn,
      checkOut,
      adults,
      children,
      role: user.role,
      pricing,
    });

    const booking = await Booking.create({
      user: {
        id: user._id,
        role: user.role,
        employeeId: user.employeeId,
        name: user.fullName,
        phone: user.phone,
        email: user.email,
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
    });

    res.json({
      success: true,
      bookingId: booking._id,
    });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/**
 * GET /api/bookings/my
 * Fetch bookings for logged-in user
 */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      "user.id": req.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Collect propertyIds
    const propertyIds = bookings.map((b) => b.property?.id).filter(Boolean);

    // Fetch properties in one query
    const properties = await Property.find({
      _id: { $in: propertyIds },
    }).lean();

    const propertyMap = {};
    properties.forEach((p) => {
      propertyMap[p._id.toString()] = p;
    });

    // Attach latest property data
    const enrichedBookings = bookings.map((b) => {
      const prop = propertyMap[b.property?.id?.toString()];

      return {
        ...b,
        property: {
          ...b.property,
          images: prop?.images || [],
          location: prop?.location || b.property.location,
        },
      };
    });

    res.json({ success: true, bookings: enrichedBookings });
  } catch (err) {
    console.error("FETCH BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/**
 * PATCH /api/bookings/:id/pay-at-rest-house
 * Mark booking as "pay on rest house"
 */
router.patch("/:id/pay-at-rest-house", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      "user.id": req.user.id, // security check
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Optional safety: allow only if approved
    if (booking.status !== "approved") {
      return res.status(400).json({
        error: "Booking must be approved before payment",
      });
    }

    booking.paymentStatus = "pay_on_rest_house";
    await booking.save();

    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
    });
  } catch (err) {
    console.error("PAY AT REST HOUSE ERROR:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

module.exports = router;
