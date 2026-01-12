const express = require("express");
const Pricing = require("../models/Pricing");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Pricing
 *   description: Admin pricing configuration APIs
 */

/* =======================
   GET PRICING
======================= */
/**
 * @swagger
 * /api/admin/pricing:
 *   get:
 *     summary: Get current pricing configuration
 *     tags: [Admin Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pricing configuration
 *       500:
 *         description: Failed to fetch pricing
 */
router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    let pricing = await Pricing.findOne();

    if (!pricing) {
      pricing = await Pricing.create({
        employee: 100,
        exEmployee: 500,
        guest: 1000,
      });
    }

    res.json(pricing);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pricing" });
  }
});

/* =======================
   UPDATE PRICING
======================= */
/**
 * @swagger
 * /api/admin/pricing:
 *   put:
 *     summary: Update pricing configuration
 *     tags: [Admin Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee
 *               - exEmployee
 *               - guest
 *             properties:
 *               employee:
 *                 type: number
 *                 example: 100
 *               exEmployee:
 *                 type: number
 *                 example: 500
 *               guest:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Pricing updated successfully
 *       400:
 *         description: Invalid price value
 *       500:
 *         description: Failed to update pricing
 */
router.put("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { employee, exEmployee, guest } = req.body;

    if (
      [employee, exEmployee, guest].some((v) => typeof v !== "number" || v < 0)
    ) {
      return res.status(400).json({ error: "Invalid price value" });
    }

    const pricing = await Pricing.findOneAndUpdate(
      {},
      { employee, exEmployee, guest },
      { new: true, upsert: true }
    );

    res.json(pricing);
  } catch (err) {
    res.status(500).json({ error: "Failed to update pricing" });
  }
});

module.exports = router;
