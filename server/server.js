import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import {Mistral} from '@mistralai/mistralai';
import morgan from 'morgan';

import connectDB from './utils/connectDB.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import moodRoutes from './routes/mood.route.js';
import exerciseRoutes from './routes/exercise.route.js';
import forumRoutes from './routes/forum.route.js';
import adminRoutes from './routes/admin.route.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Connect MongoDB
connectDB();

// ✅ Mistral client
const client = new Mistral({ apiKey: process.env.MIST_API_KEY });

// ✅ CORS whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'https://manosetu-platform.onrender.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Postman/cURL
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy violation: Origin not allowed'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(morgan('combined'));

// ✅ Serve frontend from dist
app.use(express.static(path.join(__dirname, '../dist')));

// ✅ Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ManoSetu backend is running' });
});

// ✅ Chat API with Mental Health Focus
app.post('/api/chat', async (req, res) => {
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
        content: `You are ManoSetu, a compassionate mental health support assistant and therapist. Your primary goal is to provide empathetic, evidence-based mental health support, therapeutic guidance, and wellness advice. You should:

        1. Listen actively and validate emotions
        2. Provide evidence-based therapeutic techniques (CBT, mindfulness, etc.)
        3. Offer coping strategies for stress, anxiety, and depression
        4. Encourage professional help when needed
        5. Never diagnose or replace professional therapy
        6. Be warm, supportive, and non-judgmental
        7. Focus on mental wellness, self-care, and emotional regulation
        8. Provide practical exercises and techniques
        9. Maintain confidentiality and create a safe space
        10. Always prioritize user safety and well-being

        Remember: If someone mentions self-harm or suicide, immediately encourage them to seek professional help and provide crisis resources.`
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

    // Store chat in database if user is authenticated
    if (userId) {
      const { default: Chat } = await import('./models/chat.model.js');
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

// ✅ API Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/mood', moodRoutes);
app.use('/api/v1/exercise', exerciseRoutes);
app.use('/api/v1/forum', forumRoutes);
app.use('/api/v1/admin', adminRoutes);

// ✅ Frontend Fallback Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 ManoSetu backend running on port ${PORT}`);
});