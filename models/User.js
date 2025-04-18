import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  discord_id: { type: String, required: true, unique: true },
  username: String,
  email: String,
  verified: Boolean,
  verification_code: String,
  code_expiry: Date,

  // Life ratings
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

  // Identity
  date_of_birth: Date,
  country: String,
  gender: String,
  identity_completed: Boolean,

  // Additional fields
  additional: String,
  channels: [String],
});

export default mongoose.model("User", userSchema);
