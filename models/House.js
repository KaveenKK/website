import mongoose from "mongoose";

const houseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  country: { type: String },
  interests: { type: [String], default: [] },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // max 6
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // pending join requests
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("House", houseSchema); 