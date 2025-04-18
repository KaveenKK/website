import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  discord_id: String,
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
  date_of_birth: Date,
  country: String,
  gender: String,
  identity_completed: Boolean,
  channels: [String],
});


export default mongoose.model("User", userSchema);
