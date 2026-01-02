"use client";

import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideoIcon,
  VideocamOff as VideoOffIcon,
  VolumeUp as SpeakerIcon,
} from "@mui/icons-material";
import { useCall } from "@/context/CallContext";

export const ActiveCallModal: React.FC = () => {
  const {
    activeCall,
    callStatus,
    callType,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Format call duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isOpen = callStatus === "calling" || callStatus === "ringing" || callStatus === "connected";
  const isVideoCall = callType === "video";
  const isConnected = callStatus === "connected";

  if (!isOpen) return null;

  const displayName = activeCall?.callerName || activeCall?.calleeName || "User";
  const displayPhoto = activeCall?.callerPhotoURL;

  return (
    <Dialog
      open={isOpen}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: "#0B141A",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
        {/* Remote Video / Avatar Background */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0B141A",
            position: "relative",
          }}
        >
          {isVideoCall && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                src={displayPhoto}
                sx={{
                  width: 150,
                  height: 150,
                  bgcolor: "#6B7C85",
                  fontSize: "4rem",
                  mb: 3,
                }}
              >
                {displayName?.[0] || "?"}
              </Avatar>
              <Typography
                variant="h4"
                sx={{ color: "#E9EDEF", fontWeight: 500, mb: 1 }}
              >
                {displayName}
              </Typography>
              <Typography sx={{ color: "#8696A0", fontSize: "1.1rem" }}>
                {callStatus === "calling" && "Calling..."}
                {callStatus === "ringing" && "Ringing..."}
                {callStatus === "connected" && formatDuration(callDuration)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Local Video (Picture-in-Picture) */}
        {isVideoCall && localStream && (
          <Box
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 120,
              height: 160,
              borderRadius: 2,
              overflow: "hidden",
              border: "2px solid #2A3942",
              bgcolor: "#111B21",
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)", // Mirror effect
              }}
            />
            {isVideoOff && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "#111B21",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VideoOffIcon sx={{ color: "#8696A0", fontSize: 32 }} />
              </Box>
            )}
          </Box>
        )}

        {/* Call Status Bar (top) */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            p: 2,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
          }}
        >
          {!isVideoCall && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SpeakerIcon sx={{ color: "#00A884" }} />
              <Typography sx={{ color: "#E9EDEF" }}>
                {isConnected ? "Voice call" : "Connecting..."}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Control Buttons (bottom) */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 4,
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* Mute Button */}
            <Box sx={{ textAlign: "center" }}>
              <IconButton
                onClick={toggleMute}
                sx={{
                  bgcolor: isMuted ? "#F15C6D" : "#2A3942",
                  width: 56,
                  height: 56,
                  "&:hover": {
                    bgcolor: isMuted ? "#D9505F" : "#3A4952",
                  },
                }}
              >
                {isMuted ? (
                  <MicOffIcon sx={{ color: "#fff", fontSize: 24 }} />
                ) : (
                  <MicIcon sx={{ color: "#E9EDEF", fontSize: 24 }} />
                )}
              </IconButton>
              <Typography sx={{ color: "#8696A0", mt: 1, fontSize: "0.75rem" }}>
                {isMuted ? "Unmute" : "Mute"}
              </Typography>
            </Box>

            {/* Video Toggle (only for video calls) */}
            {isVideoCall && (
              <Box sx={{ textAlign: "center" }}>
                <IconButton
                  onClick={toggleVideo}
                  sx={{
                    bgcolor: isVideoOff ? "#F15C6D" : "#2A3942",
                    width: 56,
                    height: 56,
                    "&:hover": {
                      bgcolor: isVideoOff ? "#D9505F" : "#3A4952",
                    },
                  }}
                >
                  {isVideoOff ? (
                    <VideoOffIcon sx={{ color: "#fff", fontSize: 24 }} />
                  ) : (
                    <VideoIcon sx={{ color: "#E9EDEF", fontSize: 24 }} />
                  )}
                </IconButton>
                <Typography sx={{ color: "#8696A0", mt: 1, fontSize: "0.75rem" }}>
                  {isVideoOff ? "Start Video" : "Stop Video"}
                </Typography>
              </Box>
            )}

            {/* End Call Button */}
            <Box sx={{ textAlign: "center" }}>
              <IconButton
                onClick={endCall}
                sx={{
                  bgcolor: "#F15C6D",
                  width: 64,
                  height: 64,
                  "&:hover": { bgcolor: "#D9505F" },
                }}
              >
                <CallEndIcon sx={{ color: "#fff", fontSize: 28 }} />
              </IconButton>
              <Typography sx={{ color: "#8696A0", mt: 1, fontSize: "0.75rem" }}>
                End
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
