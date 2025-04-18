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

  const channels = Object.entries(rest)
    .filter(([key, value]) => key.startsWith("channel_") && value === "on")
    .map(([key]) => key.replace("channel_", ""));

  try {
    const user = await User.findOne({ discord_id: stringDiscordId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = {
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
      identity_completed: true,
      channels,
    };

    // ONLY set country if it's blank or "unknown"
    if (!user.country || user.country === "unknown") {
      updateData.country = country;
    }

    // ONLY set gender if it's blank or "unknown"
    if (!user.gender || user.gender === "unknown") {
      updateData.gender = gender;
    }

    // ONLY set DOB if it's invalid
    const defaultDob = new Date("1000-01-01");
    if (!user.date_of_birth || new Date(user.date_of_birth).getFullYear() <= 1900) {
      updateData.date_of_birth = birthDate;
    }

    const updated = await User.updateOne(
      { discord_id: stringDiscordId },
      { $set: updateData }
    );

    res.json({ message: "Profile updated", updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
