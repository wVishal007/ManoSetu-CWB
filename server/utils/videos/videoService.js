// controllers/video.controller.js
import "dotenv/config"
import Session from "../../models/session.model.js";
import AgoraRTC from "agora-access-token"; // make sure to install agora-access-token

export const generateVideoToken = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Only user or therapist can generate token
    if (![session.user.toString(), session.therapist.toString()].includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = `session-${session._id}`;
    const uid = Math.floor(Math.random() * 1000000); // random UID
    const role = 1; // 1 = publisher
    const expireTime = 3600; // 1 hour
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpire = currentTime + expireTime;

    const token = AgoraRTC.RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpire
    );

    // Save channelName to session (optional)
    session.meetingLink = channelName;
    await session.save();

    res.json({ success: true, token, channelName, uid });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
