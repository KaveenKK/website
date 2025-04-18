import dotenv from "dotenv";
if (!process.env.MONGODB_URI) dotenv.config();
console.log("🚀 Using Mongo URI:", process.env.MONGODB_URI);


import mongoose from "mongoose";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first"); // Fix weird DNS issues on Railway

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Wait 10s max to connect
})
.then(() => {
  console.log("✅ MongoDB connected");
})
.catch((err) => {
  console.error("❌ MongoDB error:", err.message);
});



import express from "express";

import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
const app = express();
import profileRoutes from "./routes/profile.js";
app.use("/api", profileRoutes);



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);
import User from "./models/User.js"; // make sure this path is correct

app.post("/api/submit", async (req, res) => {
  try {
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
      ...rest
    } = req.body;

    if (!discord_id) return res.status(400).send("Missing discord_id");

    // Extract selected channels from checkboxes
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
          channels,
        },
      },
      { new: true, upsert: true }
    );

    const successMessage = `...`; // reuse your beautiful HTML message
    res.status(200).send(successMessage);

  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("❌ Failed to save");
  }
});



<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Submission Successful</title>
  <style>
    body {
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: 'Inter', sans-serif;
      color: white;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }
    h1 {
      margin-bottom: 20px;
      font-size: 32px;
    }
    p {
      font-size: 20px;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      text-decoration: none;
      color: white;
      font-weight: 600;
    }
    a:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Submission Successful!</h1>
    <p>Your profile has been updated.</p>
    <p>Please return to the Discord server and use the slash command <strong>/getroles</strong> to get your personalized roles and access channels.</p>
    <a href="https://discord.com">Go to Discord</a>
  </div>
</body>
</html>
    `;
    


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve all static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));
app.use("/api", authRoutes);


// Show index.html on homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
