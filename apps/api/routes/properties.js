const express = require("express");
const Property = require("../models/Property");
const Zone = require("../models/Zone");

const router = express.Router();

/**
 * GET /api/properties?zone=Delhi
 */
router.get("/", async (req, res) => {
  try {
    const { zone } = req.query;
    if (!zone) {
      return res.status(400).json({ error: "Zone is required" });
    }

    const zoneDoc = await Zone.findOne({
      name: { $regex: `^${zone}$`, $options: "i" },
    });

    if (!zoneDoc) return res.json([]);

    const properties = await Property.find({ zone: zoneDoc._id });

    res.json(properties);
  } catch (err) {
    console.error("PROPERTY FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

module.exports = router;
