const express = require("express");
const EmployeeList = require("../models/EmployeeList");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/admin/employee-ids
 * Query params:
 *  - search (optional)
 *  - page (default: 1)
 *  - limit (default: 50)
 */
router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const search = (req.query.search || "").trim();

    const filter = search
      ? { employeeId: { $regex: search, $options: "i" } }
      : {};

    const [items, total] = await Promise.all([
      EmployeeList.find(filter)
        .sort({ employeeId: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EmployeeList.countDocuments(filter),
    ]);

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Fetch employee IDs error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/admin/employee-ids
 * Body: { employeeId }
 */
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId?.trim()) {
      return res.status(400).json({ error: "employeeId required" });
    }

    const exists = await EmployeeList.exists({
      employeeId: employeeId.trim(),
    });
    if (exists) {
      return res.status(409).json({ error: "Employee ID already exists" });
    }

    const doc = await EmployeeList.create({
      employeeId: employeeId.trim(),
    });

    res.status(201).json({ employeeId: doc });
  } catch (err) {
    console.error("Add employee ID error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/admin/employee-ids/:employeeId
 */
router.delete(
  "/:employeeId",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const employeeId = req.params.employeeId;

      const deleted = await EmployeeList.findOneAndDelete({
        employeeId: employeeId,
      });

      if (!deleted) {
        return res.status(404).json({ error: "Employee ID not found" });
      }

      res.json({ message: "Employee ID deleted" });
    } catch (err) {
      console.error("Delete employee ID error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
