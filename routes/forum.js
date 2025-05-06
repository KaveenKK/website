import express from 'express';
import ForumThread from '../models/ForumThread.js';
import ForumReply from '../models/ForumReply.js';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/forum/threads?search=&tag=
router.get('/threads', authMiddleware, async (req, res) => {
  const { search = '', tag = '' } = req.query;
  const query = {};
  if (tag) query.tag = tag;
  if (search) query.content = { $regex: search, $options: 'i' };
  const threads = await ForumThread.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'username avatar')
    .lean();
  res.json(threads);
});

// POST /api/forum/threads
router.post('/threads', authMiddleware, async (req, res) => {
  const { content, tag } = req.body;
  if (!content || !tag) return res.status(400).json({ error: 'Content and tag required' });
  const thread = await ForumThread.create({
    user: req.user._id,
    content,
    tag
  });
  await thread.populate('user', 'username avatar');
  res.status(201).json(thread);
});

// GET /api/forum/threads/:id
router.get('/threads/:id', authMiddleware, async (req, res) => {
  const thread = await ForumThread.findById(req.params.id)
    .populate('user', 'username avatar')
    .lean();
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  const replies = await ForumReply.find({ thread: thread._id })
    .sort({ createdAt: 1 })
    .populate('user', 'username avatar')
    .lean();
  res.json({ thread, replies });
});

// POST /api/forum/threads/:id/replies
router.post('/threads/:id/replies', authMiddleware, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const reply = await ForumReply.create({
    thread: req.params.id,
    user: req.user._id,
    content
  });
  await reply.populate('user', 'username avatar');
  res.status(201).json(reply);
});

// POST /api/forum/threads/:id/like
router.post('/threads/:id/like', authMiddleware, async (req, res) => {
  const thread = await ForumThread.findById(req.params.id);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  const idx = thread.likes.indexOf(req.user._id);
  if (idx === -1) {
    thread.likes.push(req.user._id);
  } else {
    thread.likes.splice(idx, 1);
  }
  await thread.save();
  res.json({ likes: thread.likes.length });
});

// POST /api/forum/replies/:id/like
router.post('/replies/:id/like', authMiddleware, async (req, res) => {
  const reply = await ForumReply.findById(req.params.id);
  if (!reply) return res.status(404).json({ error: 'Reply not found' });
  const idx = reply.likes.indexOf(req.user._id);
  if (idx === -1) {
    reply.likes.push(req.user._id);
  } else {
    reply.likes.splice(idx, 1);
  }
  await reply.save();
  res.json({ likes: reply.likes.length });
});

export default router; 