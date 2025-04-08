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

    await collection.insertOne({
      discord_id,
      scores,
      submitted_at: new Date()
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
