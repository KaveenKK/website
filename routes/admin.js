// routes/admin.js
import express from "express";
import Coach from "../models/Coach.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET /api/admin/coaches/pending
// → list all coaches who are not yet approved
router.get(
  "/coaches/pending",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const pending = await Coach.find({ approved: false });
      res.json(pending);
    } catch (err) {
      console.error("❌ Error listing pending coaches:", err);
      res.status(500).json({ error: "Could not list pending coaches" });
    }
  }
);

// POST /api/admin/coaches/:id/approve
// → mark a coach as approved
router.post(
  "/coaches/:id/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const coach = await Coach.findByIdAndUpdate(
        req.params.id,
        { approved: true },
        { new: true }
      );
      if (!coach) return res.status(404).json({ error: "Coach not found" });
      res.json({ success: true, coach });
    } catch (err) {
      console.error("❌ Error approving coach:", err);
      res.status(500).json({ error: "Failed to approve coach" });
    }
  }
);

export default router;
