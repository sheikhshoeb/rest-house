const express = require("express");
const Zone = require("../models/Zone");
const Property = require("../models/Property");
const { authMiddleware, requireRole } = require("../middleware/auth");
const upload = require("../middleware/uploadPropertyImages");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Rest Houses
 *   description: Admin management of zones and rest house properties
 */

/* ================= ZONES ================= */

/**
 * @swagger
 * /api/admin/rest-houses/zones:
 *   get:
 *     summary: Get all zones
 *     tags: [Admin Rest Houses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of zones
 */
router.get("/zones", authMiddleware, requireRole("admin"), async (req, res) => {
  const zones = await Zone.find().sort({ createdAt: -1 });
  res.json(zones);
});

/**
 * @swagger
 * /api/admin/rest-houses/zones:
 *   post:
 *     summary: Add a new zone
 *     tags: [Admin Rest Houses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Delhi
 *     responses:
 *       200:
 *         description: Zone created
 */
router.post(
  "/zones",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const zone = await Zone.create({ name: req.body.name });
    res.json(zone);
  }
);

/**
 * @swagger
 * /api/admin/rest-houses/zones/{id}:
 *   put:
 *     summary: Update a zone
 *     tags: [Admin Rest Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zone updated
 */
router.put(
  "/zones/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(zone);
  }
);

/**
 * @swagger
 * /api/admin/rest-houses/zones/{id}:
 *   delete:
 *     summary: Delete a zone (and its properties)
 *     tags: [Admin Rest Houses]
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
 *         description: Zone and properties deleted
 */
router.delete(
  "/zones/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    await Zone.findByIdAndDelete(req.params.id);
    await Property.deleteMany({ zone: req.params.id });
    res.json({ success: true });
  }
);

/* ================= PROPERTIES ================= */

/**
 * @swagger
 * /api/admin/rest-houses/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Admin Rest Houses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get(
  "/properties",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const properties = await Property.find().populate("zone");
    res.json(properties);
  }
);

/**
 * @swagger
 * /api/admin/rest-houses/properties:
 *   post:
 *     summary: Add a new property (with image upload)
 *     tags: [Admin Rest Houses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               zone:
 *                 type: string
 *               upiId:
 *                 type: string
 *               vvip:
 *                 type: number
 *               vip:
 *                 type: number
 *               general:
 *                 type: number
 *               officerName:
 *                 type: string
 *               officerDesignation:
 *                 type: string
 *               officerContact:
 *                 type: string
 *               caretakerName:
 *                 type: string
 *               caretakerContact:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Property created
 */
router.post(
  "/properties",
  authMiddleware,
  requireRole("admin"),
  upload.array("images", 10),
  async (req, res) => {
    try {
      const imageUrls = (req.files || []).map(
        (file) => `/uploads/property/${file.filename}`
      );

      const property = await Property.create({
        name: req.body.name,
        location: req.body.location,
        zone: req.body.zone,
        upiId: req.body.upiId,
        rooms: {
          vvip: Number(req.body.vvip || 0),
          vip: Number(req.body.vip || 0),
          general: Number(req.body.general || 0),
        },
        officer: {
          name: req.body.officerName,
          designation: req.body.officerDesignation,
          contact: req.body.officerContact,
        },
        caretaker: {
          name: req.body.caretakerName,
          contact: req.body.caretakerContact,
        },
        images: imageUrls,
      });

      res.json(property);
    } catch (err) {
      console.error("Add property error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /api/admin/rest-houses/properties/{id}:
 *   put:
 *     summary: Update a property (append images)
 *     tags: [Admin Rest Houses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               existingImages:
 *                 type: string
 *                 description: JSON array of existing image URLs
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Property updated
 */
router.put(
  "/properties/:id",
  authMiddleware,
  requireRole("admin"),
  upload.array("images", 10),
  async (req, res) => {
    try {
      const existingImages = JSON.parse(req.body.existingImages || "[]");

      const newImageUrls = (req.files || []).map(
        (file) => `/uploads/property/${file.filename}`
      );

      const property = await Property.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          location: req.body.location,
          zone: req.body.zone,
          upiId: req.body.upiId,
          rooms: {
            vvip: Number(req.body.vvip || 0),
            vip: Number(req.body.vip || 0),
            general: Number(req.body.general || 0),
          },
          officer: {
            name: req.body.officerName,
            designation: req.body.officerDesignation,
            contact: req.body.officerContact,
          },
          caretaker: {
            name: req.body.caretakerName,
            contact: req.body.caretakerContact,
          },
          images: [...existingImages, ...newImageUrls],
        },
        { new: true }
      );

      res.json(property);
    } catch (err) {
      console.error("Update property error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /api/admin/rest-houses/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Admin Rest Houses]
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
 *         description: Property deleted
 */
router.delete(
  "/properties/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }
);

module.exports = router;
