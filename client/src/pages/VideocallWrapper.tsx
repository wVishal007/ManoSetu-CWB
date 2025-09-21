import React from "react";
import { useParams } from "react-router-dom";
import VideoCall from "./Videocall"

const VideoCallWrapper = () => {
  const { sessionId } = useParams();
  return <VideoCall sessionId={sessionId} />;
};

export default VideoCallWrapper;
