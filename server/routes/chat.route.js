import express from 'express';
import Chat from '../models/chat.model.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalChats = await Chat.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      chats: chats.reverse(), // Reverse to get chronological order
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalChats / limit),
        hasMore: skip + chats.length < totalChats
      }
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete chat history
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'Chat history deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;