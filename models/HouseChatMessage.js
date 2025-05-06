import mongoose from "mongoose";

const houseChatMessageSchema = new mongoose.Schema({
  house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

houseChatMessageSchema.index({ house: 1, createdAt: 1 });

export default mongoose.model("HouseChatMessage", houseChatMessageSchema); 