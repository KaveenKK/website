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

  const stringDiscordId = String(discord_id);

  // Validate age
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

  // Extract checked channels
  const channels = Object.entries(rest)
    .filter(([key, value]) => key.startsWith("channel_") && value === "on")
    .map(([key]) => key.replace("channel_", ""));

  try {


    console.log("Update payload:", {
      gender,
      country,
      date_of_birth
    });

    const updated = await User.updateOne(
      { discord_id: stringDiscordId },
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
          date_of_birth: birthDate,
          country,
          gender,
          identity_completed: true,
          channels,
        },
      }
    );

    res.json({ message: "Profile updated", updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
