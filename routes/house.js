import express from 'express';
import House from '../models/House.js';
import HouseChatMessage from '../models/HouseChatMessage.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// SCAN endpoint: find similar users and houses
router.get('/scan', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) return res.status(401).json({ error: 'User not found' });
  const userAge = user.date_of_birth ? Math.floor((Date.now() - new Date(user.date_of_birth)) / (365.25*24*60*60*1000)) : null;

  // Find users (not self, allowHouseInvites = true)
  const users = await User.find({
    _id: { $ne: user._id },
    allowHouseInvites: true
  }).lean();

  // Similarity calculation
  function calcSimilarity(u) {
    let score = 0;
    // 50% if any shared interest
    if (user.channels && u.channels && user.channels.some(ch => u.channels.includes(ch))) score += 50;
    // 40% if same country
    if (user.country && u.country && user.country === u.country) score += 40;
    // 10% if age diff < 5
    if (userAge && u.date_of_birth) {
      const uAge = Math.floor((Date.now() - new Date(u.date_of_birth)) / (365.25*24*60*60*1000));
      if (Math.abs(userAge - uAge) < 5) score += 10;
    }
    return Math.min(score, 100);
  }
  const userResults = users.map(u => ({
    _id: u._id,
    username: u.username,
    avatar: u.avatar,
    country: u.country,
    gender: u.gender,
    channels: u.channels,
    energy: u.energy,
    similarity: calcSimilarity(u)
  })).sort((a, b) => b.similarity - a.similarity).slice(0, 20);

  // Find houses (not full)
  const houses = await House.find({ members: { $size: { $lt: 6 } } }).populate('members', 'country gender channels date_of_birth').lean();
  function calcHouseSimilarity(house) {
    // Compare user to house interests/country/age of members
    let score = 0;
    // 50% if any shared interest with house interests
    if (user.channels && house.interests && user.channels.some(ch => house.interests.includes(ch))) score += 50;
    // 40% if same country
    if (user.country && house.country && user.country === house.country) score += 40;
    // 10% if age diff < 5 with any member
    if (userAge && house.members && house.members.length) {
      for (const m of house.members) {
        if (m.date_of_birth) {
          const mAge = Math.floor((Date.now() - new Date(m.date_of_birth)) / (365.25*24*60*60*1000));
          if (Math.abs(userAge - mAge) < 5) { score += 10; break; }
        }
      }
    }
    return Math.min(score, 100);
  }
  const houseResults = houses.map(h => ({
    _id: h._id,
    name: h.name,
    description: h.description,
    country: h.country,
    interests: h.interests,
    members: h.members.map(m => ({ _id: m._id, avatar: m.avatar, username: m.username })),
    similarity: calcHouseSimilarity(h)
  })).sort((a, b) => b.similarity - a.similarity).slice(0, 20);

  res.json({ users: userResults, houses: houseResults });
});

// POST /api/houses - create house
router.post('/', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || user.energy < 500) return res.status(403).json({ error: 'Not enough energy to create a house' });
  const { name, description, interests } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const house = await House.create({
    name,
    description,
    country: user.country,
    interests: interests || user.channels,
    creator: user._id,
    members: [user._id],
    requests: []
  });
  res.status(201).json(house);
});

// GET /api/houses - list houses for current user
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  // Find houses where user is a member
  const houses = await House.find({ members: userId })
    .populate('creator', 'username avatar')
    .populate('members', 'username avatar')
    .populate('requests', 'username avatar')
    .lean();
  // Format for frontend
  const result = houses.map(h => ({
    _id: h._id,
    name: h.name,
    description: h.description,
    creator: h.creator?._id?.toString() || (h.creator && h.creator.toString()),
    members: h.members.map(m => ({ _id: m._id?.toString(), username: m.username, avatar: m.avatar })),
    requests: h.requests.map(r => ({ _id: r._id?.toString(), username: r.username, avatar: r.avatar }))
  }));
  res.json(result);
});

// POST /api/houses/:id/join - request to join
router.post('/:id/join', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (house.members.length >= 6) return res.status(400).json({ error: 'House is full' });
  if (house.members.includes(user._id)) return res.status(400).json({ error: 'Already a member' });
  if (house.requests.includes(user._id)) return res.status(400).json({ error: 'Already requested' });
  house.requests.push(user._id);
  await house.save();
  res.json({ success: true });
});

// POST /api/houses/:id/invite - invite user
router.post('/:id/invite', authMiddleware, async (req, res) => {
  const inviter = await User.findById(req.user._id);
  if (!inviter || inviter.energy < 500) return res.status(403).json({ error: 'Not enough energy to invite' });
  const { userId } = req.body;
  const invitee = await User.findById(userId);
  if (!invitee) return res.status(404).json({ error: 'User not found' });
  if (!invitee.allowHouseInvites) return res.status(403).json({ error: 'User does not allow invites' });
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (house.members.length >= 6) return res.status(400).json({ error: 'House is full' });
  if (house.members.includes(invitee._id)) return res.status(400).json({ error: 'Already a member' });
  if (house.requests.includes(invitee._id)) return res.status(400).json({ error: 'Already requested/invited' });
  house.requests.push(invitee._id);
  await house.save();
  res.json({ success: true });
});

// POST /api/houses/:id/accept - accept request
router.post('/:id/accept', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { userId } = req.body;
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (!house.creator.equals(user._id)) return res.status(403).json({ error: 'Only creator can accept requests' });
  if (house.members.length >= 6) return res.status(400).json({ error: 'House is full' });
  const idx = house.requests.indexOf(userId);
  if (idx === -1) return res.status(400).json({ error: 'No such request' });
  house.requests.splice(idx, 1);
  house.members.push(userId);
  await house.save();
  res.json({ success: true });
});

// GET /api/houses/:id - get house details
router.get('/:id', authMiddleware, async (req, res) => {
  const house = await House.findById(req.params.id)
    .populate('creator', 'username avatar')
    .populate('members', 'username avatar country gender channels energy')
    .populate('requests', 'username avatar country gender channels energy')
    .lean();
  if (!house) return res.status(404).json({ error: 'House not found' });
  res.json(house);
});

// POST /api/houses/:id/chat - send message
router.post('/:id/chat', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (!house.members.includes(user._id)) return res.status(403).json({ error: 'Not a member of this house' });
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message required' });
  const chatMsg = await HouseChatMessage.create({
    house: house._id,
    user: user._id,
    message: message.trim()
  });
  await chatMsg.populate('user', 'username avatar');
  res.status(201).json(chatMsg);
});

// GET /api/houses/:id/chat - get chat (paginated)
router.get('/:id/chat', authMiddleware, async (req, res) => {
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (!house.members.includes(req.user._id)) return res.status(403).json({ error: 'Not a member of this house' });
  const { page = 1, limit = 30 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const messages = await HouseChatMessage.find({ house: house._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'username avatar')
    .lean();
  res.json(messages.reverse()); // return oldest first
});

// POST /api/houses/:id/leave - leave a house (not creator)
router.post('/:id/leave', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (house.creator.equals(userId)) return res.status(400).json({ error: 'Creator cannot leave their own house' });
  const idx = house.members.indexOf(userId);
  if (idx === -1) return res.status(400).json({ error: 'Not a member' });
  house.members.splice(idx, 1);
  await house.save();
  res.json({ success: true });
});

// POST /api/houses/:id/remove - remove a member (creator only)
router.post('/:id/remove', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  const { memberId } = req.body;
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (!house.creator.equals(userId)) return res.status(403).json({ error: 'Only creator can remove members' });
  if (memberId === userId.toString()) return res.status(400).json({ error: 'Cannot remove yourself' });
  const idx = house.members.map(m => m.toString()).indexOf(memberId);
  if (idx === -1) return res.status(400).json({ error: 'User not a member' });
  house.members.splice(idx, 1);
  await house.save();
  res.json({ success: true });
});

// DELETE /api/houses/:id - delete house (creator only)
router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (!house.creator.equals(userId)) return res.status(403).json({ error: 'Only creator can delete house' });
  await House.deleteOne({ _id: house._id });
  await HouseChatMessage.deleteMany({ house: house._id });
  res.json({ success: true });
});

// POST /api/houses/:id/reject - reject a join request (creator only)
router.post('/:id/reject', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  const { userId: rejectId } = req.body;
  const house = await House.findById(req.params.id);
  if (!house) return res.status(404).json({ error: 'House not found' });
  if (!house.creator.equals(userId)) return res.status(403).json({ error: 'Only creator can reject requests' });
  const idx = house.requests.map(r => r.toString()).indexOf(rejectId);
  if (idx === -1) return res.status(400).json({ error: 'No such request' });
  house.requests.splice(idx, 1);
  await house.save();
  res.json({ success: true });
});

export default router; 