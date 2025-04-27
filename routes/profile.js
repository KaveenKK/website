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
    const body = req.body;
    const updates = {};

    // birthdate: only if valid non-empty string
    if (body.birthdate && typeof body.birthdate === "string") {
      const d = new Date(body.birthdate);
      if (!isNaN(d)) updates.birthdate = d;
    }

    // simple text fields
    if (body.bio && body.bio.trim()) updates.bio = body.bio.trim();
    if (body.experience && body.experience.trim()) updates.experience = body.experience.trim();

    // social_links: only non-empty entries
    if (body.social_links && typeof body.social_links === "object") {
      const sl = {};
      ["instagram", "twitter", "linkedin", "threads", "youtube", "facebook", "tiktok", "linkedin"].forEach(key => {
        const val = body.social_links[key];
        if (val && typeof val === "string" && val.trim()) {
          sl[key] = val.trim();
        }
      });
      if (Object.keys(sl).length) updates.social_links = sl;
    }

    // paypal
    if (body.paypal && typeof body.paypal === "string" && body.paypal.trim()) {
      updates.paypal = body.paypal.trim();
    }

    // numeric fields
    if (body.monthly_price_usd != null && !isNaN(parseFloat(body.monthly_price_usd))) {
      updates.monthly_price_usd = parseFloat(body.monthly_price_usd);
      // derive maples at the same time
      updates.monthly_price_maples = Math.round((updates.monthly_price_usd / 0.3) * 10);
    }
    if (body.monthly_price_maples != null && !isNaN(parseInt(body.monthly_price_maples, 10))) {
      updates.monthly_price_maples = parseInt(body.monthly_price_maples, 10);
    }

    // profile_picture URL
    if (body.profile_picture && typeof body.profile_picture === "string" && body.profile_picture.trim()) {
      updates.profile_picture = body.profile_picture.trim();
    }

    // if nothing to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // fetch, merge, save
    const coach = await Coach.findById(req.user.id);
    if (!coach) return res.status(404).json({ error: "Coach not found" });

    Object.assign(coach, updates);
    await coach.save();

    res.json({ success: true, updatedCoach: coach });
  } catch (err) {
    console.error("❌ Failed to update profile:", err);
    // send the real error message for debugging (remove or sanitize in production)
    res.status(500).json({ error: err.message });
  }
});

export default router;
