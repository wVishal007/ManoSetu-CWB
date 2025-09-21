import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.model.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        profile: req.user.profile,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('profile.age').optional().isNumeric().withMessage('Age must be a number'),
  body('profile.gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, profile, role } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (profile) updates.profile = { ...(req.user.profile || {}), ...profile }; // ← safeguard
    if (role) updates.role = role; // ← update role if sent

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      }
    });

  } catch (error) {
    console.error('PUT /profile error:', error); // ← log the actual error
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



router.post('/applications/therapists/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'approve') {
      user.role = 'therapist'; // Change role to therapist
      user.applicationStatus = 'approved'; // Set status to approved
      user.isTherapist = true; // Set isTherapist flag to true
      await user.save();
      res.json({ success: true, message: 'Therapist application approved successfully' });
    } else if (action === 'reject') {
      user.applicationStatus = 'rejected'; // Set status to rejected
      user.profile.bio = undefined;
      user.profile.specialties = undefined;
      user.profile.licenseNumber = undefined;
      await user.save();
      res.json({ success: true, message: 'Therapist application rejected' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Approve therapist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/applications/therapists', authenticateToken, isAdmin, async (req, res) => {
  try {
    const applications = await User.find({ applicationStatus: 'pending' }).select('-password');
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get therapist applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/user?role=therapist&isVerified=true
router.get('/', async (req, res) => {
  try {
    const { role, isVerified } = req.query;
    const filter = {};

    if (role) filter.role = role;                 // ← top-level role
    if (isVerified !== undefined) filter['profile.isVerified'] = isVerified === 'true'; // nested

    const users = await User.find(filter).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});




export default router;