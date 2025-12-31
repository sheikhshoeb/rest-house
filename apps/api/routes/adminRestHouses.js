const express = require("express");
const Zone = require("../models/Zone");
const Property = require("../models/Property");
const { authMiddleware, requireRole } = require("../middleware/auth");
const upload = require("../middleware/uploadPropertyImages");

const router = express.Router();

/* ================= ZONES ================= */

// GET all zones
router.get("/zones", authMiddleware, requireRole("admin"), async (req, res) => {
  const zones = await Zone.find().sort({ createdAt: -1 });
  res.json(zones);
});

// ADD zone
router.post(
  "/zones",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const zone = await Zone.create({ name: req.body.name });
    res.json(zone);
  }
);

// UPDATE zone
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

// DELETE zone (also deletes properties under it)
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

// GET all properties
router.get(
  "/properties",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const properties = await Property.find().populate("zone");
    res.json(properties);
  }
);

// ADD property (WITH IMAGE UPLOAD)
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

// UPDATE property (without image replace)
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

// DELETE property
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
