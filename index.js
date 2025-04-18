import dotenv from "dotenv";
if (!process.env.MONGODB_URI) dotenv.config();

console.log("🚀 Using Mongo URI:", process.env.MONGODB_URI);

import mongoose from "mongoose";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import User from "./models/User.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend from /public folder
app.use(express.static(path.join(__dirname, "public")));

// Mount API routes
app.use("/api", profileRoutes);
app.use("/api", authRoutes);

// Submit form route
app.post("/api/submit", async (req, res) => {
  try {
    console.log("🔥 API HIT – Full body:", req.body);

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
      gender,
      country,
      ...rest
    } = req.body;

    if (!discord_id) return res.status(400).send("Missing discord_id");

    // Age validation
    const birthDate = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    if (age < 13) return res.status(403).send("You must be at least 13");
    if (age > 100) return res.status(400).send("Enter a valid age under 100");

    // Extract checked channels
    const channels = Object.entries(rest)
      .filter(([key, value]) => key.startsWith("channel_") && value === "on")
      .map(([key]) => key.replace("channel_", ""));

    const updatedUser = await User.findOneAndUpdate(
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
          gender,
          country,
          date_of_birth: birthDate,
          identity_completed: true,
          channels,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).send(`
      <html>
        <head><title>Success</title></head>
        <body style="font-family: sans-serif; background: #0f2027; color: white; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="text-align: center;">
            <h1>Submission Successful</h1>
            <p>Your profile has been updated.</p>
            <a href="https://discord.com" style="color: lightblue;">Return to Discord</a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Error saving data:", err);
    res.status(500).send("❌ Failed to save");
  }
});

// Homepage fallback
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
