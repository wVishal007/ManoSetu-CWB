import express from 'express';
import User from '../models/user.model.js';
import { Post, Comment } from '../models/forum.model.js';
import Mood from '../models/mood.model.js';
import { UserExercise } from '../models/exercise.model.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalMoods,
      totalExercises,
      flaggedPosts,
      flaggedComments,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Mood.countDocuments(),
      UserExercise.countDocuments(),
      Post.countDocuments({ isFlagged: true }),
      Comment.countDocuments({ isFlagged: true }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt')
    ]);

    // Get user growth data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get mood distribution
    const moodDistribution = await Mood.aggregate([
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalMoods,
        totalExercises,
        flaggedPosts,
        flaggedComments,
        recentUsers,
        userGrowth,
        moodDistribution
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get flagged content
router.get('/flagged', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { type = 'posts', limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    if (type === 'posts') {
      const flaggedPosts = await Post.find({ isFlagged: true })
        .populate('authorId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const totalFlagged = await Post.countDocuments({ isFlagged: true });

      res.json({
        success: true,
        content: flaggedPosts,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalFlagged / limit),
          hasMore: skip + flaggedPosts.length < totalFlagged
        }
      });
    } else {
      const flaggedComments = await Comment.find({ isFlagged: true })
        .populate('authorId', 'name email')
        .populate('postId', 'title')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const totalFlagged = await Comment.countDocuments({ isFlagged: true });

      res.json({
        success: true,
        content: flaggedComments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalFlagged / limit),
          hasMore: skip + flaggedComments.length < totalFlagged
        }
      });
    }

  } catch (error) {
    console.error('Get flagged content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Moderate content
router.post('/moderate/:type/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action } = req.body; // 'approve' or 'delete'

    if (type === 'post') {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      if (action === 'approve') {
        post.isFlagged = false;
        post.flaggedBy = [];
        await post.save();
      } else if (action === 'delete') {
        await Post.findByIdAndDelete(id);
        await Comment.deleteMany({ postId: id });
      }
    } else if (type === 'comment') {
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ success: false, message: 'Comment not found' });
      }

      if (action === 'approve') {
        comment.isFlagged = false;
        comment.flaggedBy = [];
        await comment.save();
      } else if (action === 'delete') {
        await Comment.findByIdAndDelete(id);
      }
    }

    res.json({
      success: true,
      message: `Content ${action === 'approve' ? 'approved' : 'deleted'} successfully`
    });

  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { limit = 20, page = 1, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalUsers / limit),
        hasMore: skip + users.length < totalUsers
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;