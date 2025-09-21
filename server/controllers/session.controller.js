// controllers/session.controller.js

import Session from '../models/session.model.js';
import User from '../models/user.model.js';

// Schedule a session
export const scheduleSession = async (req, res) => {
  try {
    const { therapistId, startTime, endTime, durationMinutes } = req.body;

    // Validate therapist exists and is a therapist
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.role !== 'therapist') {
      return res.status(400).json({ success: false, message: 'Invalid therapist' });
    }

    // Check therapist availability (simplified - you can add calendar logic later)
    const conflict = await Session.findOne({
      therapist: therapistId,
      status: { $in: ['scheduled', 'ongoing'] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ success: false, message: 'Therapist is not available at this time' });
    }

    // Create session
    const session = new Session({
      therapist: therapistId,
      user: req.user._id,
      startTime,
      endTime,
      durationMinutes,
      status: 'scheduled',
    });

    await session.save();

    // TODO: Integrate with video service (Twilio, Agora, etc.) to generate meetingLink
    // session.meetingLink = await generateVideoRoom(session._id.toString());
    // await session.save();

    res.status(201).json({
      success: true,
      message: 'Session scheduled successfully',
      session: {
        id: session._id,
        therapist: therapist.name,
        startTime: session.startTime,
        endTime: session.endTime,
        meetingLink: session.meetingLink,
      }
    });

  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user's upcoming sessions
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .populate('therapist', 'name email avatar profile.specialties')
      .sort({ startTime: 1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get therapist's upcoming sessions
export const getTherapistSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ therapist: req.user._id })
      .populate('user', 'name email')
      .sort({ startTime: 1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Start session (change status to ongoing + generate meeting link if not done)
export const startSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId)
      .populate('therapist user');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if user or therapist is making request
    if (session.user._id.toString() !== req.user._id.toString() &&
        session.therapist._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ success: false, message: 'Session cannot be started' });
    }

    // Generate meeting link if not exists
    if (!session.meetingLink) {
      // Example: session.meetingLink = await generateVideoRoom(session._id.toString());
      session.meetingLink = `https://yourapp.com/meet/${session._id}`; // placeholder
    }

    session.status = 'ongoing';
    await session.save();

    res.json({
      success: true,
      message: 'Session started',
      meetingLink: session.meetingLink,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// End session
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== 'ongoing') {
      return res.status(400).json({ success: false, message: 'Session is not ongoing' });
    }

    session.status = 'completed';
    // TODO: Optionally trigger recording processing or notes saving
    await session.save();

    res.json({ success: true, message: 'Session ended successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// controllers/session.controller.js
// export const getMySessions = async (req, res) => {
//   try {
//     let sessions;
//     const isTherapist = req.user.role === 'therapist';

//     if (isTherapist) {
//       sessions = await Session.find({ therapist: req.user._id })
//         .populate('user', 'name email');
//     } else {
//       sessions = await Session.find({ user: req.user._id })
//         .populate('therapist', 'name email avatar profile.specialties');
//     }

//     res.json({ success: true, sessions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// export const getMySessions = async (req, res) => {
//   try {
//     let sessions;
//     if (req.user.role === 'therapist') {
//       sessions = await Session.find({ therapist: req.user._id }).populate('user therapist');
//     } else {
//       sessions = await Session.find({ user: req.user._id }).populate('user therapist');
//     }

//     res.json({ sessions });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch sessions' });
//   }
// };

export const getMySessions = async (req, res) => {
  try {
    let sessions;
    if (req.user.role === 'therapist') {
      sessions = await Session.find({ therapist: req.user._id })
        .populate('user', 'name email')
        .sort({ startTime: 1 });
    } else {
      sessions = await Session.find({ user: req.user._id })
        .populate('therapist', 'name email avatar profile.specialties')
        .sort({ startTime: 1 });
    }

    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};