import express from 'express';
import mongoose from 'mongoose';
import Coach from '../models/Coach.js';
import ExclusiveContent from '../models/ExclusiveContent.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Mux from '@mux/mux-node';
// import multer from 'multer'; // Uncomment if you want to handle file uploads directly
// import Mux integration here when ready

const router = express.Router();

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

// POST /coach/exclusive-content/upload
router.post('/exclusive-content/upload', authMiddleware, async (req, res) => {
  try {
    // 1. Find the coach
    const coach = await Coach.findById(req.user._id);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    // 2. (Temporarily removed) Check for at least 20 active subscribers
    // if (!coach.subscribers || coach.subscribers.length < 20) {
    //   return res.status(403).json({ error: 'You need at least 20 active subscribers to upload exclusive content.' });
    // }

    // 3. Get title/description/niche from body
    const { title, description, niche } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!niche) return res.status(400).json({ error: 'Niche is required' });

    // 4. Create a Mux direct upload
    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
        passthrough: coach._id.toString(), // Optionally track coach
      },
    });

    // 5. Save a pending ExclusiveContent record (to be updated by webhook)
    const pendingContent = new ExclusiveContent({
      coach: coach._id,
      title,
      description,
      niche,
      muxAssetId: null, // Will be set by webhook
      muxPlaybackId: null, // Will be set by webhook
      visibility: 'inactive',
      createdAt: new Date(),
      // Optionally store upload.id for later reference
      muxUploadId: upload.id,
    });
    await pendingContent.save();

    // 6. Return upload URL and upload ID to client
    return res.status(200).json({
      uploadUrl: upload.url,
      uploadId: upload.id,
      contentId: pendingContent._id,
      message: 'Use this URL to upload your video file directly to Mux.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 