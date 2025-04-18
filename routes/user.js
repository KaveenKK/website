import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  const {
    discord_id,
    physical,
    mental,
    social,
    love,
    career,
    creative,
    travel,
    family,
    style,
    spiritual,
    additional,
    date_of_birth,
    country,
    gender,
    ...rest
  } = req.body;

  if (!discord_id) return res.status(400).json({ error: "Missing discord_id" });

  // Age validation
  if (!date_of_birth) return res.status(400).json({ error: "Date of birth is required" });
  const birthDate = new Date(date_of_birth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  if (age < 13) {
    return res.status(403).json({ error: "You must be at least 13 years old to register" });
  }

  if (age > 100) {
    return res.status(400).json({ error: "Please enter a valid age under 100" });
  }

  // Extract selected channels from checkboxes
  const channels = Object.entries(rest)
    .filter(([key, value]) => key.startsWith("channel_") && value === "on")
    .map(([key]) => key.replace("channel_", ""));

  try {
    const updated = await User.findOneAndUpdate(
      { discord_id },
      {
        $set: {
          physical,
          mental,
          social,
          love,
          career,
          creative,
          travel,
          family,
          style,
          spiritual,
          additional,
          date_of_birth,
          country,
          gender,
          identity_completed: true,
          channels,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
