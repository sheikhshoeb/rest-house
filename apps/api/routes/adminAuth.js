// apps/api/routes/adminAuth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");

const Admin = require("../models/Admin");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Admin authentication and profile APIs
 */

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
const ADMIN_COOKIE_NAME =
  process.env.ADMIN_COOKIE_NAME || "rest_house_admin_token";

/* multer (optional) */
const uploadDir = path.join(__dirname, "../../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

/* =======================
   ADMIN REGISTER
======================= */
/**
 * @swagger
 * /api/admin-auth/register:
 *   post:
 *     summary: Register a new admin (dev only)
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: StrongPass@123
 *               role:
 *                 type: string
 *                 enum: [Super Admin, Admin, Manager]
 *               idCard:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Admin account created
 *       400:
 *         description: Validation or duplicate error
 */
router.post(
  "/register",
  upload.single("idCard"),
  body("fullName").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["Super Admin", "Admin", "Manager"]),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ error: errors.array()[0].msg });

      const { fullName, email, phone, password, role } = req.body;
      const existing = await Admin.findOne({
        email: email.trim().toLowerCase(),
      });
      if (existing)
        return res
          .status(400)
          .json({ error: "An admin already exists with this email" });

      const passwordHash = await bcrypt.hash(password, 10);
      const a = new Admin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        passwordHash,
        role: role || "Admin",
      });
      await a.save();
      return res.json({ message: "Admin account created" });
    } catch (err) {
      console.error("REGISTER ADMIN ERROR:", err);
      return res.status(500).json({ error: err.message || "Server error" });
    }
  }
);

/* =======================
   ADMIN LOGIN
======================= */
/**
 * @swagger
 * /api/admin-auth/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin logged in
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Provide email and password" });

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) return res.status(400).json({ error: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const payload = { id: admin._id, role: admin.role, isAdmin: true };
    const token = jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: "7d" });

    res.cookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ message: "Logged in", role: admin.role });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   ADMIN ME
======================= */
/**
 * @swagger
 * /api/admin-auth/me:
 *   get:
 *     summary: Get logged-in admin profile
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const a = await Admin.findById(req.user.id).select("-passwordHash");
    if (!a) return res.status(404).json({ error: "Admin not found" });

    return res.json({
      user: {
        id: a._id,
        fullName: a.fullName,
        email: a.email,
        phone: a.phone,
        role: a.role,
        createdAt: a.createdAt,
      },
    });
  } catch (err) {
    console.error("ADMIN ME ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   ADMIN LOGOUT
======================= */
/**
 * @swagger
 * /api/admin-auth/logout:
 *   post:
 *     summary: Logout admin
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", (req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    path: "/",
    sameSite: "None",
    secure: true,
  });

  res.json({ message: "Logged out" });
});

module.exports = router;
