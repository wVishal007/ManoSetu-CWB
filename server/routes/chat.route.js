import express from 'express';
import jwt from 'jsonwebtoken';
import Chat from '../models/chat.model.js';
import { authenticateToken } from '../middleware/auth.js';
import { Mistral } from '@mistralai/mistralai';

const router = express.Router();

// ✅ Initialize Mistral client
const client = new Mistral({ apiKey: process.env.MIST_API_KEY });

// ✅ AI Chat Endpoint
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    let userId = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn('⚠️ Invalid token. Proceeding as guest.');
      }
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const messages = [
      {
        role: 'system',
        content: `You are ManoSetu, a compassionate mental health support assistant...`,
      },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const chatResponse = await client.chat.complete({
      model: 'mistral-small',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = chatResponse.choices[0]?.message?.content;
    if (!reply) throw new Error('Empty response from model');

    // Save to DB if user is logged in
    if (userId) {
      await Chat.create({ userId, role: 'user', content: message });
      await Chat.create({ userId, role: 'assistant', content: reply });
    }

    res.json({
      success: true,
      response: reply,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API Error:', error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ✅ Get user's chat history
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
      chats: chats.reverse(),
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

// ✅ Delete chat history
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
