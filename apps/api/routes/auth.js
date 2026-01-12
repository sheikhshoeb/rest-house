const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const EmployeeList = require("../models/EmployeeList");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication & profile APIs
 */

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || "rest_house_token";

/* =======================
   MULTER (uploads)
======================= */
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
   EMPLOYEE / EX-EMPLOYEE REGISTER
======================= */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register employee or ex-employee
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               employeeId:
 *                 type: string
 *                 example: EMP10234
 *               fullName:
 *                 type: string
 *                 example: Sheikh Shoeb
 *               email:
 *                 type: string
 *                 example: shoeb@example.com
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: Password@123
 *               role:
 *                 type: string
 *                 enum: [employee, ex-employee]
 *               idCard:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
router.post(
  "/register",
  upload.single("idCard"),
  body("employeeId").trim().notEmpty(),
  body("fullName").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["employee", "ex-employee"]),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const {
        employeeId,
        fullName,
        email,
        phone,
        password,
        role = "employee",
      } = req.body;

      const emp = await EmployeeList.findOne({
        employeeId: employeeId.trim(),
      });
      if (!emp) {
        return res
          .status(400)
          .json({ error: "Employee ID not found in authorized list" });
      }

      const existing = await User.findOne({
        $or: [
          { employeeId: employeeId.trim() },
          { email: email.trim().toLowerCase() },
        ],
      });
      if (existing) {
        return res.status(400).json({
          error:
            "Account already exists with this Employee ID or Email. Please contact support.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = new User({
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        passwordHash,
        role,
        status: "approved",
        idCardPath: req.file ? `/uploads/${req.file.filename}` : undefined,
      });

      await user.save();
      return res.json({ message: "Registration successful" });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return res.status(500).json({ error: err.message || "Server error" });
    }
  }
);

/* =======================
   GUEST REGISTER
======================= */
/**
 * @swagger
 * /api/auth/register-guest:
 *   post:
 *     summary: Register guest user
 *     tags: [Auth]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               idCard:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Guest registered (pending admin approval)
 */
router.post(
  "/register-guest",
  upload.single("idCard"),
  body("fullName").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { fullName, email, phone, password } = req.body;

      const existing = await User.findOne({
        email: email.trim().toLowerCase(),
      });
      if (existing) {
        return res
          .status(400)
          .json({ error: "A user already exists with this email" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = new User({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        passwordHash,
        role: "guest",
        status: "pending",
        idCardPath: req.file ? `/uploads/${req.file.filename}` : undefined,
      });

      await user.save();
      return res.json({
        message: "Guest registered — pending admin approval",
      });
    } catch (err) {
      console.error("REGISTER GUEST ERROR:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/* =======================
   USER LOGIN
======================= */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               employeeId:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (JWT token)
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  try {
    const { employeeId, email, password } = req.body;
    if (!password || (!employeeId && !email)) {
      return res
        .status(400)
        .json({ error: "Provide email/employeeId and password" });
    }

    const query = employeeId
      ? { employeeId: employeeId.trim() }
      : { email: email.trim().toLowerCase() };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.role === "guest" && user.status !== "approved") {
      return res.status(403).json({ error: "Guest account awaiting approval" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   CHECK EMPLOYEE ID
======================= */
/**
 * @swagger
 * /api/auth/check-employee:
 *   get:
 *     summary: Check if employee ID exists
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee ID exists or not
 */
router.get("/check-employee", async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) {
      return res.status(400).json({ error: "employeeId required" });
    }

    const exists = await EmployeeList.exists({
      employeeId: employeeId.trim(),
    });
    return res.json({ exists: !!exists });
  } catch (err) {
    console.error("check-employee error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   CURRENT USER
======================= */
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   LOGOUT
======================= */
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ message: "Logged out" });
});

module.exports = router;
