"use client";

import { db } from "./firebase";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  Timestamp,
  getDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";

// Google STUN servers for NAT traversal
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export type CallType = "voice" | "video";
export type CallStatus = "pending" | "ringing" | "connected" | "ended" | "rejected" | "missed";

export interface CallDocument {
  id: string;
  chatId: string;
  callerId: string;
  callerName: string;
  callerPhotoURL?: string;
  calleeId: string;
  calleeName?: string;
  callType: CallType;
  status: CallStatus;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: Timestamp;
  answeredAt?: Timestamp;
  endedAt?: Timestamp;
}

export interface IceCandidate {
  id: string;
  callId: string;
  sender: string;
  candidate: RTCIceCandidateInit;
  createdAt: Timestamp;
}

// Create a new call
export const createCall = async (
  chatId: string,
  callerId: string,
  callerName: string,
  callerPhotoURL: string | undefined,
  calleeId: string,
  callType: CallType
): Promise<string> => {
  const callRef = await addDoc(collection(db, "calls"), {
    chatId,
    callerId,
    callerName,
    callerPhotoURL,
    calleeId,
    callType,
    status: "pending" as CallStatus,
    createdAt: serverTimestamp(),
  });

  return callRef.id;
};

// Get call by ID
export const getCallById = async (callId: string): Promise<CallDocument | null> => {
  const callRef = doc(db, "calls", callId);
  const callSnap = await getDoc(callRef);
  
  if (callSnap.exists()) {
    return { id: callSnap.id, ...callSnap.data() } as CallDocument;
  }
  return null;
};

// Update call with SDP offer
export const setCallOffer = async (callId: string, offer: RTCSessionDescriptionInit): Promise<void> => {
  const callRef = doc(db, "calls", callId);
  await updateDoc(callRef, {
    offer,
    status: "ringing" as CallStatus,
  });
};

// Answer call with SDP answer
export const answerCall = async (callId: string, answer: RTCSessionDescriptionInit): Promise<void> => {
  const callRef = doc(db, "calls", callId);
  await updateDoc(callRef, {
    answer,
    status: "connected" as CallStatus,
    answeredAt: serverTimestamp(),
  });
};

// Reject call
export const rejectCall = async (callId: string): Promise<void> => {
  const callRef = doc(db, "calls", callId);
  await updateDoc(callRef, {
    status: "rejected" as CallStatus,
    endedAt: serverTimestamp(),
  });
};

// End call
export const endCall = async (callId: string): Promise<void> => {
  const callRef = doc(db, "calls", callId);
  await updateDoc(callRef, {
    status: "ended" as CallStatus,
    endedAt: serverTimestamp(),
  });
};

// Add ICE candidate
export const addIceCandidate = async (
  callId: string,
  sender: string,
  candidate: RTCIceCandidateInit
): Promise<void> => {
  await addDoc(collection(db, "calls", callId, "candidates"), {
    callId,
    sender,
    candidate,
    createdAt: serverTimestamp(),
  });
};

// Subscribe to call document changes
export const subscribeToCall = (
  callId: string,
  callback: (call: CallDocument | null) => void
): (() => void) => {
  const callRef = doc(db, "calls", callId);
  
  return onSnapshot(callRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as CallDocument);
    } else {
      callback(null);
    }
  });
};

// Subscribe to incoming calls for a user
export const subscribeToIncomingCalls = (
  userId: string,
  callback: (call: CallDocument | null) => void
): (() => void) => {
  const callsRef = collection(db, "calls");
  const q = query(
    callsRef,
    where("calleeId", "==", userId),
    where("status", "in", ["pending", "ringing"])
  );
  
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const callDoc = snapshot.docs[0];
      callback({ id: callDoc.id, ...callDoc.data() } as CallDocument);
    } else {
      callback(null);
    }
  });
};

// Subscribe to ICE candidates
export const subscribeToIceCandidates = (
  callId: string,
  localUserId: string,
  callback: (candidate: RTCIceCandidateInit) => void
): (() => void) => {
  const candidatesRef = collection(db, "calls", callId, "candidates");
  
  return onSnapshot(candidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data() as IceCandidate;
        // Only process candidates from the other party
        if (data.sender !== localUserId) {
          callback(data.candidate);
        }
      }
    });
  });
};

// WebRTC Peer Connection Manager Class
export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private userId: string;
  private unsubscribeCandidates: (() => void) | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Initialize peer connection
  private createPeerConnection(
    onRemoteStream: (stream: MediaStream) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Handle remote stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        onRemoteStream(event.streams[0]);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      onConnectionStateChange(pc.connectionState);
    };

    this.peerConnection = pc;
    return pc;
  }

  // Get user media (audio/video)
  async getUserMedia(callType: CallType): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: callType === "video",
    };

    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  }

  // Start a call (caller side)
  async startCall(
    chatId: string,
    callerId: string,
    callerName: string,
    callerPhotoURL: string | undefined,
    calleeId: string,
    callType: CallType,
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ): Promise<{ callId: string; localStream: MediaStream }> {
    // Get local media
    const localStream = await this.getUserMedia(callType);

    // Create call document
    this.callId = await createCall(chatId, callerId, callerName, callerPhotoURL, calleeId, callType);

    // Create peer connection
    const pc = this.createPeerConnection(
      onRemoteStream,
      async (candidate) => {
        if (this.callId) {
          await addIceCandidate(this.callId, this.userId, candidate.toJSON());
        }
      },
      onConnectionStateChange
    );

    // Add local tracks to connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Create and set offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Save offer to Firestore
    await setCallOffer(this.callId, offer);

    // Subscribe to remote ICE candidates
    this.unsubscribeCandidates = subscribeToIceCandidates(this.callId, this.userId, async (candidate) => {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return { callId: this.callId, localStream };
  }

  // Answer a call (callee side)
  async answerIncomingCall(
    call: CallDocument,
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ): Promise<MediaStream> {
    this.callId = call.id;

    // Get local media
    const localStream = await this.getUserMedia(call.callType);

    // Create peer connection
    const pc = this.createPeerConnection(
      onRemoteStream,
      async (candidate) => {
        if (this.callId) {
          await addIceCandidate(this.callId, this.userId, candidate.toJSON());
        }
      },
      onConnectionStateChange
    );

    // Add local tracks
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Set remote description (offer)
    if (call.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
    }

    // Create and set answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Save answer to Firestore
    await answerCall(call.id, answer);

    // Subscribe to remote ICE candidates
    this.unsubscribeCandidates = subscribeToIceCandidates(call.id, this.userId, async (candidate) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return localStream;
  }

  // Handle incoming answer (for caller)
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection && !this.peerConnection.remoteDescription) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  // Toggle audio mute
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Returns true if muted
      }
    }
    return false;
  }

  // Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled; // Returns true if video is off
      }
    }
    return true;
  }

  // End the call and cleanup
  async hangup(): Promise<void> {
    // Stop all local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Unsubscribe from candidates
    if (this.unsubscribeCandidates) {
      this.unsubscribeCandidates();
      this.unsubscribeCandidates = null;
    }

    // Update call status
    if (this.callId) {
      await endCall(this.callId);
      this.callId = null;
    }

    this.remoteStream = null;
  }

  // Get current streams
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getCallId(): string | null {
    return this.callId;
  }
}
