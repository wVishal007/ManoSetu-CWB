import express from 'express';
import { body, validationResult } from 'express-validator';
import { Post, Comment } from '../models/forum.model.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const { category, limit = 20, page = 1, sort = 'recent' } = req.query;
    const query = { isModerated: { $ne: true } };
    
    if (category && category !== 'all') query.category = category;

    const skip = (page - 1) * limit;
    let sortQuery = {};

    switch (sort) {
      case 'popular':
        sortQuery = { 'upvotes.length': -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('authorId', 'name')
      .lean();

    // Transform posts for anonymous display
    const transformedPosts = posts.map(post => ({
      ...post,
      author: post.isAnonymous ? null : post.authorId?.name,
      authorId: post.isAnonymous ? null : post.authorId?._id,
      upvoteCount: post.upvotes?.length || 0,
      downvoteCount: post.downvotes?.length || 0,
      upvotes: undefined,
      downvotes: undefined,
    }));

    const totalPosts = await Post.countDocuments(query);

    res.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalPosts / limit),
        hasMore: skip + posts.length < totalPosts
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single post with comments
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name')
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Get comments for this post
    const comments = await Comment.find({ postId: req.params.id })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Transform post and comments for anonymous display
    const transformedPost = {
      ...post,
      author: post.isAnonymous ? null : post.authorId?.name,
      authorId: post.isAnonymous ? null : post.authorId?._id,
      upvoteCount: post.upvotes?.length || 0,
      downvoteCount: post.downvotes?.length || 0,
      upvotes: undefined,
      downvotes: undefined,
    };

    const transformedComments = comments.map(comment => ({
      ...comment,
      author: comment.isAnonymous ? null : comment.authorId?.name,
      authorId: comment.isAnonymous ? null : comment.authorId?._id,
      upvoteCount: comment.upvotes?.length || 0,
      downvoteCount: comment.downvotes?.length || 0,
      upvotes: undefined,
      downvotes: undefined,
    }));

    res.json({
      success: true,
      post: transformedPost,
      comments: transformedComments
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new post
router.post('/posts', authenticateToken, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
  body('category').isIn(['general', 'anxiety', 'depression', 'stress', 'relationships', 'work', 'support']).withMessage('Invalid category'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, category, isAnonymous = true, tags = [] } = req.body;

    const post = new Post({
      title,
      content,
      category,
      isAnonymous,
      tags: tags.slice(0, 5), // Limit to 5 tags
      authorId: req.user._id
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...post.toObject(),
        author: isAnonymous ? null : req.user.name,
        upvoteCount: 0,
        downvoteCount: 0,
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add comment to post
router.post('/posts/:id/comments', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Content must be 1-1000 characters'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content, isAnonymous = true } = req.body;
    const postId = req.params.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = new Comment({
      postId,
      content,
      isAnonymous,
      authorId: req.user._id
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        ...comment.toObject(),
        author: isAnonymous ? null : req.user.name,
        upvoteCount: 0,
        downvoteCount: 0,
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Vote on post
router.post('/posts/:id/vote', authenticateToken, [
  body('voteType').isIn(['upvote', 'downvote', 'remove']).withMessage('Invalid vote type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { voteType } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Remove existing votes
    post.upvotes = post.upvotes.filter(id => !id.equals(userId));
    post.downvotes = post.downvotes.filter(id => !id.equals(userId));

    // Add new vote
    if (voteType === 'upvote') {
      post.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      post.downvotes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: 'Vote updated successfully',
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length
    });

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Vote on comment
router.post('/comments/:id/vote', authenticateToken, [
  body('voteType').isIn(['upvote', 'downvote', 'remove']).withMessage('Invalid vote type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { voteType } = req.body;
    const commentId = req.params.id;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Remove existing votes
    comment.upvotes = comment.upvotes.filter(id => !id.equals(userId));
    comment.downvotes = comment.downvotes.filter(id => !id.equals(userId));

    // Add new vote
    if (voteType === 'upvote') {
      comment.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      comment.downvotes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      message: 'Vote updated successfully',
      upvoteCount: comment.upvotes.length,
      downvoteCount: comment.downvotes.length
    });

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Flag post
router.post('/posts/:id/flag', authenticateToken, [
  body('reason').trim().isLength({ min: 3, max: 200 }).withMessage('Reason must be 3-200 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { reason } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user already flagged this post
    const existingFlag = post.flaggedBy.find(flag => flag.userId.equals(userId));
    if (existingFlag) {
      return res.status(400).json({ success: false, message: 'Post already flagged by you' });
    }

    post.flaggedBy.push({ userId, reason });
    post.isFlagged = true;

    await post.save();

    res.json({
      success: true,
      message: 'Post flagged successfully'
    });

  } catch (error) {
    console.error('Flag post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;