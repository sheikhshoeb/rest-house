const express = require("express");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const Pricing = require("../models/Pricing");
const calculatePricing = require("../utils/calculatePricing");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Bookings
 *   description: Admin booking management APIs
 */

/* =======================
   GET ALL BOOKINGS
======================= */
/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       500:
 *         description: Failed to fetch bookings
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

/* =======================
   APPROVE BOOKING
======================= */
/**
 * @swagger
 * /api/admin/bookings/{id}/approve:
 *   patch:
 *     summary: Approve a booking
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking approved
 *       500:
 *         description: Failed to approve booking
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

/* =======================
   REJECT BOOKING
======================= */
/**
 * @swagger
 * /api/admin/bookings/{id}/reject:
 *   patch:
 *     summary: Reject a booking
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking rejected
 *       500:
 *         description: Failed to reject booking
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

/* =======================
   ADMIN CREATE BOOKING
======================= */
/**
 * @swagger
 * /api/admin/bookings/create:
 *   post:
 *     summary: Create a booking manually (admin)
 *     tags: [Admin Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - name
 *               - phone
 *               - propertyId
 *               - checkIn
 *               - checkOut
 *             properties:
 *               role:
 *                 type: string
 *                 example: employee
 *               employeeId:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               propertyId:
 *                 type: string
 *               category:
 *                 type: string
 *               adults:
 *                 type: number
 *               children:
 *                 type: number
 *               checkIn:
 *                 type: string
 *                 format: date
 *               checkOut:
 *                 type: string
 *                 format: date
 *               paymentStatus:
 *                 type: string
 *                 example: pending
 *     responses:
 *       200:
 *         description: Booking created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to create booking
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

      if (!role || !name || !phone || !propertyId || !checkIn || !checkOut) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
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
        role,
        pricing,
      });

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
