import express from "express";
import Coach from "../models/Coach.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const coach = await Coach.findById(req.user.id);
    if (!coach) return res.status(404).json({ error: "Coach not found" });
    res.json(coach);
  } catch (err) {
    console.error("❌ Failed to fetch profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// POST /api/profile → Update coach info
router.post("/profile", authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    // Optional: only allow certain fields to be updated
    const allowedFields = [
      "birthdate",
      "bio",
      "specialties",
      "experience",
      "social_links",
      "paypal",
      "monthly_price_usd",
      "monthly_price_maples",
      "profile_picture"
    ];

    const filteredUpdates = {};
    for (let key of allowedFields) {
      if (updates.hasOwnProperty(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedCoach = await Coach.findByIdAndUpdate(req.user.id, filteredUpdates, {
      new: true,
      runValidators: true
    });

    if (!updatedCoach) return res.status(404).json({ error: "Coach not found" });

    res.json({
      success: true,
      updatedCoach
    });
  } catch (err) {
    console.error("❌ Failed to update profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
