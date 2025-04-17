import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(); // Uses DB name from URI
const collection = db.collection("life_dashboard");

app.post("/api/submit", async (req, res) => {
  try {
    const { discord_id, ...scores } = req.body;
    
    // Optional: Check for previous submissions (cooldown logic) here if needed...
    // For example, check if a document exists and was submitted < 7 days ago.

    // Insert the form data into MongoDB
    await collection.insertOne({
      discord_id,
      scores,
      submitted_at: new Date()
    });

    // Compose a success HTML response
    const successMessage = `
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
    
    res.status(200).send(successMessage);
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("❌ Failed to save");
  }
});

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
