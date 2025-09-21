// routes/session.routes.js

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as sessionController from '../controllers/session.controller.js';
import { generateVideoToken } from '../utils/videos/videoService.js';
import "dotenv/config"

const router = express.Router();

// Schedule a session (user only)
router.post('/schedule', authenticateToken, sessionController.scheduleSession);

// Get my sessions (user or therapist)
// router.get('/my-sessions', authenticateToken, (req, res, next) => {
//   if (req.user.role === 'therapist') {
//     sessionController.getTherapistSessions(req, res);
//   } else {
//     sessionController.getUserSessions(req, res);
//   }
// });
export const getMySessions = async (req, res) => {
  try {
    const sessions = req.user.role === 'therapist'
      ? await getTherapistSessions(req.user._id)
      : await getMySessions(req.user._id);

    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};


// Start session (user or therapist)
router.post('/:sessionId/start', authenticateToken, sessionController.startSession);

// End session (user or therapist)
router.post('/:sessionId/end', authenticateToken, sessionController.endSession);

// routes/session.routes.js
// router.get('/my-sessions', authenticateToken, sessionController.getMySessions);

router.get('/:sessionId/token', authenticateToken, generateVideoToken);

router.get('/my-sessions', authenticateToken, sessionController.getMySessions);

router.get('/key',authenticateToken,async(req,res)=>{
res.status(200).json({key:process.env.AGORA_APP_ID})
})



export default router;