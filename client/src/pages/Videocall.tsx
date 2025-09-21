import React, { useEffect, useState } from "react";
import { client } from "../services/agora"; // ✅ import shared client
import AgoraRTC from "agora-rtc-sdk-ng";
import apiService from "../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VideoCall = ({ sessionId }: { sessionId: string }) => {
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const navigate = useNavigate();

useEffect(() => {
  let isMounted = true;

  const init = async () => {
    try {
      const { token, channelName, uid } = await apiService.getVideoToken(sessionId);

      const key = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/session/key`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      await client.join(key.data.key, channelName, token, uid);

      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks([micTrack, camTrack]);
      camTrack.play("local-player");
      await client.publish([micTrack, camTrack]);

      // --- Subscribe to all existing remote users (important for late joiners) ---
      client.remoteUsers.forEach((user) => {
        if (user.uid !== uid) {
          if (user.videoTrack) user.videoTrack.play("remote-player");
          if (user.audioTrack) user.audioTrack.play();
          setRemoteUsers((prev) => [...prev.filter(u => u.uid !== user.uid), user]);
        }
      });

      // Listen for future users
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (!isMounted) return;

        if (mediaType === "video") user.videoTrack.play("remote-player");
        if (mediaType === "audio") user.audioTrack.play();

        setRemoteUsers((prev) => [...prev.filter(u => u.uid !== user.uid), user]);
      });

      client.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => prev.filter(u => u.uid !== user.uid));
      });

      client.on("token-privilege-will-expire", async () => {
        const { token: newToken } = await apiService.getVideoToken(sessionId);
        await client.renewToken(newToken);
      });
    } catch (error) {
      console.error("Video call init error:", error);
    }
  };

  init();

  return () => {
    isMounted = false;
    localTracks.forEach((track) => track.close());
    client.leave();
    client.removeAllListeners();
  };
}, [sessionId]);


  // Hangup function
  const hangUp = async () => {
    localTracks.forEach(track => track.close());
    await client.leave();
    setRemoteUsers([]);
    navigate("/my-sessions");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-full p-4 bg-gray-100 relative">
      {/* Local Video */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        <div id="local-player" className="w-full h-96"></div>
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          You
        </div>
      </div>

      {/* Remote Video */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        <div id="remote-player" className="w-full h-96"></div>
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          Participant
        </div>
      </div>

      {/* Hangup Button */}
      <button
        onClick={hangUp}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full shadow-lg"
      >
        Hang Up
      </button>
    </div>
  );
};

export default VideoCall;
