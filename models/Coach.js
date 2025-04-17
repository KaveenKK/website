import mongoose from "mongoose";

const coachSchema = new mongoose.Schema({
  discord_id: { type: String, unique: true },
  email: String,
  name: String,
  age: Number,
  bio: String,
  specialties: [String],
  experience: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Coach", coachSchema);
