import mongoose from 'mongoose';

const exclusiveContentSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  muxAssetId: { type: String, required: true }, // Mux asset ID for the video
  muxPlaybackId: { type: String, required: true }, // Mux playback ID for streaming
  muxUploadId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  visibility: { type: String, enum: ['active', 'inactive'], default: 'active' },
  niche: { type: String, required: true },
  // Optionally, add thumbnail, duration, etc.
});

export default mongoose.model('ExclusiveContent', exclusiveContentSchema); 