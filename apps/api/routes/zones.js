const express = require("express");
const Zone = require("../models/Zone");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Zone listing APIs
 */

/**
 * @swagger
 * /api/zones:
 *   get:
 *     summary: Get list of zones
 *     description: Fetches an alphabetical list of all zone names
 *     tags: [Zones]
 *     responses:
 *       200:
 *         description: List of zone names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 - Delhi
 *                 - Mumbai
 *                 - Chennai
 *       500:
 *         description: Failed to fetch zones
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
