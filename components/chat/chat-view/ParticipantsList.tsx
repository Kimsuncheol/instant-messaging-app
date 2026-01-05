"use client";

import React, { useEffect, useState } from "react";
import { List, Box, Typography } from "@mui/material";
import { UserProfile } from "@/lib/userService";
import { subscribeToMultiplePresences, UserPresence } from "@/lib/presenceService";
import { ParticipantItem } from "./ParticipantItem";

interface ParticipantsListProps {
  participants: UserProfile[];
  currentUserId: string | undefined;
  isOpen: boolean;
  onParticipantClick: (userId: string) => void;
}

// Format last seen time
const formatLastSeen = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  isOpen,
  onParticipantClick,
}) => {
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const participantCount = participants.length;

  // Subscribe to presence for all participants
  useEffect(() => {
    if (!isOpen || participants.length === 0) return;

    const userIds = participants.map((p) => p.uid);
    const unsubscribe = subscribeToMultiplePresences(userIds, setPresences);

    return () => unsubscribe();
  }, [isOpen, participants]);

  const getPresenceDisplay = (userId: string) => {
    // Don't show presence status for current user
    if (userId === currentUserId) {
      return { text: "You", color: "#8696A0", isSelf: true };
    }

    const presence = presences[userId];
    if (!presence) return { text: "offline", color: "#8696A0", isSelf: false };

    if (presence.state === "online") {
      return { text: "online", color: "#00A884", isSelf: false };
    }

    return {
      text: `last seen ${formatLastSeen(presence.lastChanged)}`,
      color: "#8696A0",
      isSelf: false,
    };
  };

  return (
    <>
      {/* Participants Section Header */}
      <Box sx={{ px: 2, py: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#00A884",
            fontWeight: 500,
            mb: 1,
            fontSize: "0.875rem",
          }}
        >
          {participantCount} {participantCount === 1 ? "PARTICIPANT" : "PARTICIPANTS"}
        </Typography>
      </Box>

      {/* Participants List */}
      {participants.length > 0 ? (
        <List sx={{ px: 1, py: 0 }}>
          {participants.map((participant) => {
            const presenceDisplay = getPresenceDisplay(participant.uid);

            return (
              <ParticipantItem
                key={participant.uid}
                participant={participant}
                presence={presences[participant.uid]}
                presenceText={presenceDisplay.text}
                presenceColor={presenceDisplay.color}
                isSelf={presenceDisplay.isSelf}
                onClick={onParticipantClick}
              />
            );
          })}
        </List>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 4,
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "#8696A0", textAlign: "center" }}
          >
            No participants found
          </Typography>
        </Box>
      )}
    </>
  );
};
