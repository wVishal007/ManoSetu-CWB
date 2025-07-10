import express from 'express';
import { body, validationResult } from 'express-validator';
import Mood from '../models/mood.model.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add mood entry
router.post('/', authenticateToken, [
  body('mood').isIn(['very_sad', 'sad', 'neutral', 'happy', 'very_happy']).withMessage('Invalid mood'),
  body('moodValue').isInt({ min: 1, max: 5 }).withMessage('Mood value must be between 1 and 5'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long'),
  body('factors').optional().isArray().withMessage('Factors must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { mood, moodValue, notes, factors } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if mood already exists for today
    const existingMood = await Mood.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (existingMood) {
      // Update existing mood
      existingMood.mood = mood;
      existingMood.moodValue = moodValue;
      existingMood.notes = notes;
      existingMood.factors = factors;
      await existingMood.save();

      return res.json({
        success: true,
        message: 'Mood updated successfully',
        mood: existingMood
      });
    }

    // Create new mood entry
    const moodEntry = new Mood({
      userId: req.user._id,
      mood,
      moodValue,
      notes,
      factors,
      date: today
    });

    await moodEntry.save();

    res.status(201).json({
      success: true,
      message: 'Mood logged successfully',
      mood: moodEntry
    });

  } catch (error) {
    console.error('Mood logging error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get mood history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const moods = await Mood.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalMoods = await Mood.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      moods,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalMoods / limit),
        hasMore: skip + moods.length < totalMoods
      }
    });

  } catch (error) {
    console.error('Mood history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get mood stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moods = await Mood.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const stats = {
      totalEntries: moods.length,
      averageMood: moods.length > 0 ? moods.reduce((acc, mood) => acc + mood.moodValue, 0) / moods.length : 0,
      moodDistribution: {
        very_sad: moods.filter(m => m.mood === 'very_sad').length,
        sad: moods.filter(m => m.mood === 'sad').length,
        neutral: moods.filter(m => m.mood === 'neutral').length,
        happy: moods.filter(m => m.mood === 'happy').length,
        very_happy: moods.filter(m => m.mood === 'very_happy').length,
      },
      moodTrend: moods.map(mood => ({
        date: mood.date,
        value: mood.moodValue,
        mood: mood.mood
      }))
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Mood stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get today's mood
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMood = await Mood.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      mood: todayMood
    });

  } catch (error) {
    console.error('Today mood error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;