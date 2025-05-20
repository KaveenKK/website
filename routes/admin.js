// routes/admin.js
import express from "express";
import jwt from "jsonwebtoken";
import Coach from "../models/Coach.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import axios from 'axios';

const router = express.Router();

// POST /api/admin/login
// → authenticate admin and return a JWT
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate against env vars
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Issue token with hard-coded admin _id
  const token = jwt.sign(
    { id: "6805021857ad2c95f230a900", role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

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
      await sendCoachApprovedNotification(coach);
      res.json({ success: true, coach });
    } catch (err) {
      console.error("❌ Error approving coach:", err);
      res.status(500).json({ error: "Failed to approve coach" });
    }
  }
);

// Helper to send OneSignal notification to coach
async function sendCoachApprovedNotification(coach) {
  if (!process.env.ONESIGNAL_APP_ID || !process.env.NEVENGI_ONESIGNAL_API) return;
  try {
    await axios.post('https://onesignal.com/api/v1/notifications', {
      app_id: process.env.ONESIGNAL_APP_ID,
      filters: [
        { field: 'tag', key: 'user_id', relation: '=', value: coach._id.toString() }
      ],
      headings: { en: 'You are now an approved coach!' },
      contents: { en: 'Congratulations! Your coach application has been approved and you are now visible to users.' },
      url: 'https://www.nevengi.com/coach_dashboard.html',
    }, {
      headers: {
        'Authorization': `Basic ${process.env.NEVENGI_ONESIGNAL_API}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('❌ OneSignal coach notification error:', err?.response?.data || err.message);
  }
}

export default router;
