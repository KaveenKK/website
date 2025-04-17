import express from "express";
import Coach from "../models/Coach.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const coach = await Coach.findById(req.user.id);
    if (!coach) return res.status(404).json({ error: "Coach not found" });
    res.json(coach);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
