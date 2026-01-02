"use client";

import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Slide,
} from "@mui/material";
import {
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Videocam as VideoIcon,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { useCall } from "@/context/CallContext";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, acceptCall, rejectCall } = useCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play ringtone when there's an incoming call
  useEffect(() => {
    if (incomingCall) {
      // Create ringtone audio (using a simple oscillator pattern)
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      // Ring pattern
      let isRinging = true;
      const ringInterval = setInterval(() => {
        if (isRinging) {
          oscillator.start();
          setTimeout(() => {
            try {
              oscillator.stop();
            } catch {
              // Oscillator already stopped
            }
          }, 500);
        }
      }, 1000);

      return () => {
        isRinging = false;
        clearInterval(ringInterval);
        try {
          oscillator.stop();
        } catch {
          // Already stopped
        }
        audioContext.close();
      };
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  const isVideoCall = incomingCall.callType === "video";

  return (
    <Dialog
      open={!!incomingCall}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        {/* Caller Avatar */}
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            mb: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              borderRadius: "50%",
              border: "3px solid #00A884",
              animation: "pulse 1.5s ease-in-out infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)", opacity: 1 },
                "50%": { transform: "scale(1.1)", opacity: 0.5 },
                "100%": { transform: "scale(1)", opacity: 1 },
              },
            }}
          />
          <Avatar
            src={incomingCall.callerPhotoURL}
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#6B7C85",
              fontSize: "2.5rem",
            }}
          >
            {incomingCall.callerName?.[0] || "?"}
          </Avatar>
        </Box>

        {/* Call Type Icon */}
        <Box sx={{ mb: 2 }}>
          {isVideoCall ? (
            <VideoIcon sx={{ color: "#00A884", fontSize: 32 }} />
          ) : (
            <CallIcon sx={{ color: "#00A884", fontSize: 32 }} />
          )}
        </Box>

        {/* Caller Name */}
        <Typography
          variant="h5"
          sx={{ color: "#E9EDEF", fontWeight: 600, mb: 1 }}
        >
          {incomingCall.callerName}
        </Typography>

        {/* Call Type Text */}
        <Typography sx={{ color: "#8696A0", mb: 4 }}>
          Incoming {isVideoCall ? "video" : "voice"} call...
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {/* Reject Button */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton
              onClick={rejectCall}
              sx={{
                bgcolor: "#F15C6D",
                width: 64,
                height: 64,
                "&:hover": { bgcolor: "#D9505F" },
              }}
            >
              <CallEndIcon sx={{ color: "#fff", fontSize: 32 }} />
            </IconButton>
            <Typography sx={{ color: "#8696A0", mt: 1, fontSize: "0.875rem" }}>
              Decline
            </Typography>
          </Box>

          {/* Accept Button */}
          <Box sx={{ textAlign: "center" }}>
            <IconButton
              onClick={acceptCall}
              sx={{
                bgcolor: "#00A884",
                width: 64,
                height: 64,
                "&:hover": { bgcolor: "#008F72" },
              }}
            >
              {isVideoCall ? (
                <VideoIcon sx={{ color: "#fff", fontSize: 32 }} />
              ) : (
                <CallIcon sx={{ color: "#fff", fontSize: 32 }} />
              )}
            </IconButton>
            <Typography sx={{ color: "#8696A0", mt: 1, fontSize: "0.875rem" }}>
              Accept
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Hidden audio element for ringtone */}
      <audio ref={audioRef} loop />
    </Dialog>
  );
};
