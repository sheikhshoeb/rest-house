const express = require("express");
const User = require("../models/User");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

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

// GET /api/admin/users
router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      filter = "ALL", // PENDING | EMPLOYEE | GUEST | REJECTED | ALL
    } = req.query;

    const q = {};
    if (search) {
      q.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    // FILTER LOGIC
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

    // COUNTS FOR TILES
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

// DELETE /api/admin/users/:id
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
