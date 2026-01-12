const express = require("express");
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: Admin user management APIs
 */

/* =======================
   PENDING GUESTS
======================= */
/**
 * @swagger
 * /api/admin/pending-guests:
 *   get:
 *     summary: Get all pending guest users
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending guests
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/pending-guests",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const guests = await User.find({
        role: "guest",
        status: "pending",
      }).select("-passwordHash");
      res.json({ guests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* =======================
   APPROVE GUEST
======================= */
/**
 * @swagger
 * /api/admin/guest/{id}/approve:
 *   post:
 *     summary: Approve a guest user
 *     tags: [Admin Users]
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
 *         description: Guest approved
 *       404:
 *         description: User not found
 */
router.post(
  "/guest/:id/approve",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const u = await User.findById(id);
      if (!u) return res.status(404).json({ error: "User not found" });
      if (u.role !== "guest")
        return res.status(400).json({ error: "Not a guest" });

      u.status = "approved";
      await u.save();
      res.json({ message: "Guest approved" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* =======================
   REJECT GUEST
======================= */
/**
 * @swagger
 * /api/admin/guest/{id}/reject:
 *   post:
 *     summary: Reject a guest user
 *     tags: [Admin Users]
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
 *         description: Guest rejected
 *       404:
 *         description: User not found
 */
router.post(
  "/guest/:id/reject",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const u = await User.findById(id);
      if (!u) return res.status(404).json({ error: "User not found" });
      if (u.role !== "guest")
        return res.status(400).json({ error: "Not a guest" });

      u.status = "rejected";
      await u.save();
      res.json({ message: "Guest rejected" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* =======================
   LIST USERS (PAGINATED)
======================= */
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get users with pagination, search and filters
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [PENDING, EMPLOYEE, GUEST, REJECTED, ALL]
 *     responses:
 *       200:
 *         description: Users list with pagination and stats
 */
router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", filter = "ALL" } = req.query;

    const q = {};
    if (search) {
      q.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    if (filter === "PENDING") q.status = "pending";
    if (filter === "REJECTED") q.status = "rejected";
    if (filter === "EMPLOYEE") q.role = "employee";
    if (filter === "GUEST") {
      q.role = "guest";
      q.status = "approved";
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(q),
    ]);

    const [pending, rejected, employees, guests, all] = await Promise.all([
      User.countDocuments({ status: "pending" }),
      User.countDocuments({ status: "rejected" }),
      User.countDocuments({ role: "employee" }),
      User.countDocuments({ role: "guest", status: "approved" }),
      User.countDocuments({}),
    ]);

    res.json({
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pending,
        rejected,
        employee: employees,
        guest: guests,
        all,
      },
    });
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================
   DELETE USER
======================= */
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
  "/users/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await User.deleteOne({ _id: id });

      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Delete user error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
