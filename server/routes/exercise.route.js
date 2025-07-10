import express from 'express';
import { body, validationResult } from 'express-validator';
import { Exercise, UserExercise } from '../models/exercise.model.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, limit = 20, page = 1 } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const skip = (page - 1) * limit;

    const exercises = await Exercise.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalExercises = await Exercise.countDocuments(query);

    res.json({
      success: true,
      exercises,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalExercises / limit),
        hasMore: skip + exercises.length < totalExercises
      }
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single exercise
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    res.json({
      success: true,
      exercise
    });

  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark exercise as completed
router.post('/:id/complete', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { rating, notes } = req.body;
    const exerciseId = req.params.id;

    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    // Create completion record
    const userExercise = new UserExercise({
      userId: req.user._id,
      exerciseId,
      rating,
      notes
    });

    await userExercise.save();

    res.status(201).json({
      success: true,
      message: 'Exercise marked as completed',
      completion: userExercise
    });

  } catch (error) {
    console.error('Complete exercise error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's completed exercises
router.get('/user/completed', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const completedExercises = await UserExercise.find({ userId: req.user._id })
      .populate('exerciseId')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalCompleted = await UserExercise.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      completedExercises,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalCompleted / limit),
        hasMore: skip + completedExercises.length < totalCompleted
      }
    });

  } catch (error) {
    console.error('Get completed exercises error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get exercise completion stats
router.get('/user/stats', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const completedExercises = await UserExercise.find({
      userId: req.user._id,
      completedAt: { $gte: startDate }
    }).populate('exerciseId');

    const stats = {
      totalCompleted: completedExercises.length,
      averageRating: completedExercises.length > 0 ? 
        completedExercises.reduce((acc, ex) => acc + (ex.rating || 0), 0) / completedExercises.length : 0,
      categoryBreakdown: {},
      completionTrend: []
    };

    // Category breakdown
    completedExercises.forEach(ex => {
      const category = ex.exerciseId.category;
      stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
    });

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Exercise stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Create new exercise
router.post('/', authenticateToken, isAdmin, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['cbt', 'mindfulness', 'breathing', 'meditation', 'journaling', 'movement']).withMessage('Invalid category'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number'),
  body('instructions').isArray({ min: 1 }).withMessage('Instructions must be an array with at least one item'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const exercise = new Exercise(req.body);
    await exercise.save();

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      exercise
    });

  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;