const express = require("express");
const Pricing = require("../models/Pricing");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * GET pricing
 */
router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    let pricing = await Pricing.findOne();

    // Create default row if missing
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

/**
 * UPDATE pricing
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
