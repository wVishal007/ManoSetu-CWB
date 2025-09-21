import React, { useEffect, useState } from "react";
import { client } from "../services/agora"; // ✅ import shared client
import AgoraRTC from "agora-rtc-sdk-ng";
import apiService from "../services/api";
import axios from "axios";

const VideoCall = ({ sessionId }: { sessionId: string }) => {
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { token, channelName, uid } = await apiService.getVideoToken(sessionId);

        // Join the channel
        const key = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/session/key`,{headers:{
          Authorization : `Bearer ${localStorage.getItem('token')}`
        }})
        
        await client.join(key.data.key, channelName, token, uid);

        // Create microphone and camera tracks
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([microphoneTrack, cameraTrack]);

        cameraTrack.play("local-player"); // Play local video
        await client.publish([microphoneTrack, cameraTrack]); // Publish tracks

        // Listen for remote users
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

  return (
    <div className="flex gap-4">
      <div id="local-player" className="w-1/2 h-96 bg-black"></div>
      <div id="remote-player" className="w-1/2 h-96 bg-black"></div>
    </div>
  );
};

export default VideoCall;
