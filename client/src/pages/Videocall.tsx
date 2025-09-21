import React, { useEffect, useState, useRef } from "react";
import { client } from "../services/agora";
import AgoraRTC from "agora-rtc-sdk-ng";
import apiService from "../services/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface VideoCallProps {
  sessionId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ sessionId }) => {
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camMuted, setCamMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const navigate = useNavigate();

  // --- Meeting Timer ---
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Initialize video call ---
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { token, channelName, uid } = await apiService.getVideoToken(sessionId);

        const keyRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/session/key`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        await client.join(keyRes.data.key, channelName, token, uid);

        // --- Local tracks ---
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([micTrack, camTrack]);
        camTrack.play("local-player");
        await client.publish([micTrack, camTrack]);

        // --- Show existing remote users ---
        client.remoteUsers.forEach((user) => {
          if (user.uid !== uid) {
            setRemoteUsers((prev) => {
              if (!prev.find((u) => u.uid === user.uid)) prev.push(user);
              return [...prev];
            });
            setTimeout(() => {
              const container = document.getElementById(`remote-player-${user.uid}`);
              if (container && user.videoTrack) user.videoTrack.play(container);
              if (user.audioTrack) user.audioTrack.play();
            }, 100);
          }
        });

        // --- Handle new users ---
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (!isMounted) return;

          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              if (!prev.find((u) => u.uid === user.uid)) prev.push(user);
              return [...prev];
            });
            setTimeout(() => {
              const container = document.getElementById(`remote-player-${user.uid}`);
              if (container && user.videoTrack) user.videoTrack.play(container);
            }, 100);
          }

          if (mediaType === "audio") user.audioTrack.play();
        });

        client.on("user-unpublished", (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        // --- Token renewal ---
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

  // --- Hangup ---
  const hangUp = async () => {
    localTracks.forEach((track) => track.close());
    await client.leave();
    setRemoteUsers([]);
    navigate("/my-sessions");
  };

  // --- Mute/unmute microphone ---
  const toggleMic = async () => {
    if (!localTracks[0]) return;
    if (micMuted) await localTracks[0].setEnabled(true);
    else await localTracks[0].setEnabled(false);
    setMicMuted(!micMuted);
  };

  // --- Mute/unmute camera ---
  const toggleCam = async () => {
    if (!localTracks[1]) return;
    if (camMuted) await localTracks[1].setEnabled(true);
    else await localTracks[1].setEnabled(false);
    setCamMuted(!camMuted);
  };

  // --- Fullscreen toggle ---
  const toggleFullscreen = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-full p-4 bg-gray-100 relative">
      {/* Local Video */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
        <div id="local-player" className="w-full h-64 md:h-96 cursor-pointer" onClick={() => toggleFullscreen("local-player")}></div>
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          You
        </div>
      </div>

      {/* Remote Videos */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {remoteUsers.length > 0 ? (
          remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="relative bg-black rounded-lg overflow-hidden w-full h-64 md:h-96 cursor-pointer"
              onClick={() => toggleFullscreen(`remote-player-${user.uid}`)}
            >
              <div id={`remote-player-${user.uid}`} className="w-full h-full"></div>
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Participant {user.uid}
              </div>
            </div>
          ))
        ) : (
          <div className="text-white">Waiting for other participants...</div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={hangUp}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full shadow-lg"
        >
          Hang Up
        </button>
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-full shadow-lg ${micMuted ? 'bg-gray-500' : 'bg-green-600'} text-white`}
        >
          {micMuted ? "Unmute Mic" : "Mute Mic"}
        </button>
        <button
          onClick={toggleCam}
          className={`px-4 py-2 rounded-full shadow-lg ${camMuted ? 'bg-gray-500' : 'bg-blue-600'} text-white`}
        >
          {camMuted ? "Turn On Cam" : "Turn Off Cam"}
        </button>
        <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
          Timer: {formatTime(timer)}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
