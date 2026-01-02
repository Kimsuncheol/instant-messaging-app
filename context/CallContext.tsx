"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  CallDocument,
  CallType,
  WebRTCManager,
  subscribeToIncomingCalls,
  subscribeToCall,
  rejectCall as rejectCallService,
} from "@/lib/webrtcService";
import { sendCallMessage } from "@/lib/chatService";

interface CallContextType {
  // Call state
  incomingCall: CallDocument | null;
  activeCall: CallDocument | null;
  callStatus: "idle" | "calling" | "ringing" | "connected" | "ended";
  callType: CallType | null;

  // Media streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Controls
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;

  // Actions
  startCall: (chatId: string, calleeId: string, calleeName: string, callType: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

interface CallProviderProps {
  children: React.ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Call state
  const [incomingCall, setIncomingCall] = useState<CallDocument | null>(null);
  const [activeCall, setActiveCall] = useState<CallDocument | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "ringing" | "connected" | "ended">("idle");
  const [callType, setCallType] = useState<CallType | null>(null);

  // Media streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Refs
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callUnsubscribeRef = useRef<(() => void) | null>(null);

  // Cleanup function (defined first to avoid hoisting issues)
  const cleanupCall = useCallback(() => {
    // Stop all local tracks
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.hangup();
    }

    // Cleanup subscriptions
    if (callUnsubscribeRef.current) {
      callUnsubscribeRef.current();
      callUnsubscribeRef.current = null;
    }

    // Reset state
    setCallStatus("idle");
    setActiveCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallType(null);
    setCallDuration(0);
  }, []);

  // Initialize WebRTC manager when user changes
  useEffect(() => {
    if (user) {
      webrtcManagerRef.current = new WebRTCManager(user.uid);
    }
    return () => {
      webrtcManagerRef.current = null;
    };
  }, [user]);

  // Subscribe to incoming calls
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToIncomingCalls(user.uid, (call) => {
      if (call && callStatus === "idle") {
        setIncomingCall(call);
        setCallType(call.callType);
      } else if (!call) {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [user, callStatus]);

  // Call duration timer
  useEffect(() => {
    if (callStatus === "connected") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);

  // Handle connection state changes
  const handleConnectionStateChange = useCallback((state: RTCPeerConnectionState) => {
    console.log("Connection state:", state);
    if (state === "connected") {
      setCallStatus("connected");
    } else if (state === "disconnected" || state === "failed" || state === "closed") {
      cleanupCall();
    }
  }, [cleanupCall]);

  // Handle remote stream
  const handleRemoteStream = useCallback((stream: MediaStream) => {
    setRemoteStream(stream);
  }, []);

  // Start a call
  const startCall = useCallback(async (
    chatId: string,
    calleeId: string,
    calleeName: string,
    type: CallType
  ) => {
    if (!user || !webrtcManagerRef.current) return;

    try {
      setCallStatus("calling");
      setCallType(type);

      const { callId, localStream: stream } = await webrtcManagerRef.current.startCall(
        chatId,
        user.uid,
        user.displayName || "User",
        user.photoURL || undefined,
        calleeId,
        type,
        handleRemoteStream,
        handleConnectionStateChange
      );

      setLocalStream(stream);

      // Subscribe to call updates
      callUnsubscribeRef.current = subscribeToCall(callId, (call) => {
        if (call) {
          setActiveCall(call);

          if (call.status === "connected") {
            setCallStatus("connected");
          } else if (call.status === "rejected" || call.status === "ended") {
            cleanupCall();
          } else if (call.answer && webrtcManagerRef.current) {
            // Handle answer from callee
            webrtcManagerRef.current.handleAnswer(call.answer);
          }
        }
      });
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus("idle");
      setCallType(null);
    }
  }, [user, handleRemoteStream, handleConnectionStateChange, cleanupCall]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !webrtcManagerRef.current) return;

    try {
      setCallStatus("ringing");
      setActiveCall(incomingCall);

      const stream = await webrtcManagerRef.current.answerIncomingCall(
        incomingCall,
        handleRemoteStream,
        handleConnectionStateChange
      );

      setLocalStream(stream);
      setIncomingCall(null);

      // Subscribe to call updates
      callUnsubscribeRef.current = subscribeToCall(incomingCall.id, (call) => {
        if (call) {
          setActiveCall(call);
          if (call.status === "ended") {
            cleanupCall();
          }
        }
      });
    } catch (error) {
      console.error("Error accepting call:", error);
      setCallStatus("idle");
      setIncomingCall(null);
    }
  }, [incomingCall, handleRemoteStream, handleConnectionStateChange, cleanupCall]);

  // Reject incoming call
  const handleRejectCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      await rejectCallService(incomingCall.id);
      
      // Send declined call message
      await sendCallMessage(
        incomingCall.chatId,
        incomingCall.callerId,
        incomingCall.callType,
        "declined"
      );
      
      setIncomingCall(null);
    } catch (error) {
      console.error("Error rejecting call:", error);
    }
  }, [incomingCall]);

  // End call (public)
  const endCall = useCallback(async () => {
    // Send call message before cleanup
    if (activeCall && callType) {
      const status = callStatus === "connected" ? "ended" : "missed";
      const duration = callStatus === "connected" ? callDuration : undefined;
      
      try {
        await sendCallMessage(
          activeCall.chatId,
          activeCall.callerId,
          callType,
          status,
          duration
        );
      } catch (error) {
        console.error("Error sending call message:", error);
      }
    }
    
    cleanupCall();
  }, [activeCall, callType, callStatus, callDuration, cleanupCall]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (webrtcManagerRef.current) {
      const muted = webrtcManagerRef.current.toggleMute();
      setIsMuted(muted);
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (webrtcManagerRef.current) {
      const videoOff = webrtcManagerRef.current.toggleVideo();
      setIsVideoOff(videoOff);
    }
  }, []);

  const value: CallContextType = {
    incomingCall,
    activeCall,
    callStatus,
    callType,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration,
    startCall,
    acceptCall,
    rejectCall: handleRejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
