import mongoose from 'mongoose';

const forumThreadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  tag: {
    type: String,
    enum: [
      'creative', 'family', 'gender', 'love', 'mental',
      'physical', 'social', 'spiritual', 'style', 'travel'
    ],
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model('ForumThread', forumThreadSchema); 