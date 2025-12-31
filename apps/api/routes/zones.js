const express = require("express");
const Zone = require("../models/Zone");

const router = express.Router();

/**
 * GET /api/zones
 * Alphabetical list of zones
 */
router.get("/", async (req, res) => {
  try {
    const zones = await Zone.find({}).sort({ name: 1 }).select("name");

    res.json(zones.map((z) => z.name));
  } catch (err) {
    console.error("ZONE FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch zones" });
  }
});

module.exports = router;
