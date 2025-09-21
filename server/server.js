import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Mistral } from '@mistralai/mistralai';
import morgan from 'morgan';

import connectDB from './utils/connectDB.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';
import moodRoutes from './routes/mood.route.js';
import exerciseRoutes from './routes/exercise.route.js';
import forumRoutes from './routes/forum.route.js';
import adminRoutes from './routes/admin.route.js';
import sessionRoutes from './routes/session.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Connect to MongoDB
connectDB();

// ✅ Mistral API client
const client = new Mistral({ apiKey: process.env.MIST_API_KEY });

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://mano-setu-api.vercel.app',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: Origin not allowed'));
    }
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(morgan('combined'));

// ✅ Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ManoSetu backend is running' });
});

// ✅ Chat Endpoint
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
      { role: 'system', content: `You are ManoSetu, a compassionate mental health assistant.` },
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

    // Save chat if user logged in
    if (userId) {
      const { default: Chat } = await import('./models/chat.model.js');
      await Chat.create({ userId, role: 'user', content: message });
      await Chat.create({ userId, role: 'assistant', content: reply });
    }

    res.json({ success: true, response: reply, timestamp: new Date().toISOString() });

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
app.use('/api/v1/session', sessionRoutes);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 ManoSetu backend running on port ${PORT}`);
});
