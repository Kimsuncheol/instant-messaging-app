"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Chat } from "@/lib/chatService";
import { UserProfile } from "@/lib/userService";
import { subscribeToMultiplePresences, UserPresence } from "@/lib/presenceService";
import { ActiveStatusBadge } from "@/components/shared/ActiveStatusBadge";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { useAuth } from "@/context/AuthContext";

interface ParticipantsDrawerProps {
  open: boolean;
  onClose: () => void;
  chat: Chat | null;
  participants: UserProfile[];
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

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  open,
  onClose,
  chat,
  participants,
}) => {
  const { user } = useAuth();
  const isGroup = chat?.type === "group";
  const participantCount = participants.length;
  
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Subscribe to presence for all participants
  useEffect(() => {
    if (!open || participants.length === 0) return;

    const userIds = participants.map(p => p.uid);
    const unsubscribe = subscribeToMultiplePresences(userIds, setPresences);

    return () => unsubscribe();
  }, [open, participants]);

  const handleAvatarClick = (userId: string) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  };

  const getPresenceDisplay = (userId: string) => {
    // Don't show presence status for current user
    if (userId === user?.uid) {
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
      isSelf: false
    };
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            bgcolor: "#0B141A",
            borderLeft: "1px solid #2A3942",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 2,
            bgcolor: "#202C33",
            borderBottom: "1px solid #2A3942",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
          >
            {isGroup ? `Group Info` : `Chat Info`}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Group/Chat Details */}
        {isGroup && chat && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 3,
              px: 2,
              bgcolor: "#202C33",
              borderBottom: "1px solid #2A3942",
            }}
          >
            <Avatar
              src={chat.groupPhotoURL}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#00A884",
                fontSize: "2rem",
                mb: 2,
              }}
            >
              {chat.groupName?.[0] || "G"}
            </Avatar>
            <Typography
              variant="h6"
              sx={{ color: "#E9EDEF", fontWeight: 500, mb: 0.5 }}
            >
              {chat.groupName || "Unnamed Group"}
            </Typography>
            {chat.groupDescription && (
              <Typography
                variant="body2"
                sx={{ color: "#8696A0", textAlign: "center" }}
              >
                {chat.groupDescription}
              </Typography>
            )}
          </Box>
        )}

        {/* Participants Section */}
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
        <List sx={{ px: 1, py: 0 }}>
          {participants.map((participant) => {
            const presenceDisplay = getPresenceDisplay(participant.uid);
            
            return (
              <ListItem
                key={participant.uid}
                onClick={() => handleAvatarClick(participant.uid)}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: "8px",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <ListItemAvatar>
                  <ActiveStatusBadge 
                    presence={presences[participant.uid]}
                    showDot={!presenceDisplay.isSelf}
                  >
                    <Avatar
                      src={participant.photoURL}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "#6B7C85",
                      }}
                    >
                      {participant.displayName?.[0] || "U"}
                    </Avatar>
                  </ActiveStatusBadge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        color: "#E9EDEF",
                        fontWeight: 400,
                        fontSize: "1rem",
                      }}
                    >
                      {participant.displayName}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      sx={{
                        color: presenceDisplay.color,
                        fontSize: "0.875rem",
                      }}
                    >
                      {presenceDisplay.text}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>

        {/* Empty State */}
        {participants.length === 0 && (
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
      </Drawer>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          open={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}
    </>
  );
};
