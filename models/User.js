import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  discord_id: { type: String, required: true, unique: true },
  physical: Number,
  mental: Number,
  social: Number,
  love: Number,
  career: Number,
  creative: Number,
  travel: Number,
  family: Number,
  style: Number,
  spiritual: Number,
  additional: String,
  channels: [String],
});

export default mongoose.model("User", userSchema);
