import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

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

    // Check for previous submission
    const existing = await collection.findOne(
      { discord_id },
      { sort: { submitted_at: -1 } }
    );

    const now = new Date();

    if (existing) {
      const lastSubmission = new Date(existing.submitted_at);
      const diffDays = (now - lastSubmission) / (1000 * 60 * 60 * 24);

      if (diffDays < 7) {
        return res.status(403).send(`❌ You must wait ${Math.ceil(7 - diffDays)} day(s) before submitting again.`);
      }
    }

    // Save new entry
    await collection.insertOne({
      discord_id,
      scores,
      submitted_at: now
    });

    res.status(200).send("✅ Data saved to MongoDB!");
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("❌ Failed to save");
  }
});

app.get("/", (req, res) => {
  res.send("✅ Nevengi backend is running.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
