import React from "react";
import { AgoraRTCProvider } from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";

// Create a single Agora client
export const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export const AgoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
};
