"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import {
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { UserProfile, getUserById } from "@/lib/userService";
import { Chat } from "@/lib/chatService";
import { subscribeToUserPresence, UserPresence } from "@/lib/presenceService";
import { ParticipantsDrawer } from "./ParticipantsDrawer";
import { useUiStore } from "@/store/uiStore";

interface ChatHeaderProps {
  chat: Chat | null;
  otherUser: UserProfile | null;
  onBack?: () => void;
  onAvatarClick?: () => void;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

// Format last seen time
const formatLastSeen = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "last seen just now";
  if (minutes < 60) return `last seen ${minutes}m ago`;
  if (hours < 24) return `last seen ${hours}h ago`;
  return `last seen ${days}d ago`;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  otherUser,
  onBack,
  onAvatarClick,
  onSearchClick,
  onMenuClick,
}) => {
  const headerHeightA = useUiStore((state) => state.headerHeightA);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [otherUserPresence, setOtherUserPresence] = useState<UserPresence | null>(null);

  const isGroup = chat?.type === "group";
  const displayName = isGroup
    ? chat?.groupName || "Unnamed Group"
    : otherUser?.displayName || "Loading...";
  const displayPhoto = isGroup ? chat?.groupPhotoURL : otherUser?.photoURL;
  const displayInitial = isGroup
    ? chat?.groupName?.[0] || "G"
    : otherUser?.displayName?.[0];

  // Subscribe to presence for the other user in private chats
  useEffect(() => {
    if (isGroup || !otherUser?.uid) return;

    const unsubscribe = subscribeToUserPresence(otherUser.uid, setOtherUserPresence);
    return () => unsubscribe();
  }, [isGroup, otherUser?.uid]);

  // Fetch participants when drawer opens
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!drawerOpen || !chat) return;

      try {
        const participantProfiles = await Promise.all(
          chat.participants.map((participantId) => getUserById(participantId))
        );
        
        // Filter out null values
        const validParticipants = participantProfiles.filter(
          (p): p is UserProfile => p !== null
        );
        
        setParticipants(validParticipants);
      } catch (error) {
        console.error("Error fetching participants:", error);
        setParticipants([]);
      }
    };

    fetchParticipants();
  }, [drawerOpen, chat]);

  // Get status text to display
  const getStatusText = (): string => {
    if (isGroup) {
      return `${chat?.participants.length || 0} members`;
    }
    
    if (!otherUserPresence) return "offline";
    
    if (otherUserPresence.state === "online") {
      return "online";
    }
    
    return formatLastSeen(otherUserPresence.lastChanged);
  };

  const handleMoreClick = () => {
    setDrawerOpen(true);
    onMenuClick?.();
  };

  return (
    <>
      <Box
        sx={{
          height: headerHeightA,
          minHeight: headerHeightA,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1,
          bgcolor: "#202C33",
          borderBottom: "1px solid #2A3942",
        }}
      >
        {onBack && (
          <IconButton onClick={onBack} sx={{ color: "#AEBAC1" }}>
            <BackIcon />
          </IconButton>
        )}
        <Avatar
          src={displayPhoto}
          onClick={onAvatarClick}
          sx={{
            width: 40,
            height: 40,
            bgcolor: isGroup ? "#00A884" : "#6B7C85",
          }}
        >
          {displayInitial}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1rem" }}>
            {displayName}
          </Typography>
          <Typography 
            sx={{ 
              color: otherUserPresence?.state === "online" ? "#00A884" : "#8696A0", 
              fontSize: "0.75rem" 
            }}
          >
            {getStatusText()}
          </Typography>
        </Box>
        
        <IconButton onClick={onSearchClick} sx={{ color: "#AEBAC1" }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={handleMoreClick} sx={{ color: "#AEBAC1" }}>
          <MoreIcon />
        </IconButton>
      </Box>

      {/* Participants Drawer - For both group and private chats */}
      <ParticipantsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chat={chat}
        participants={participants}
      />
    </>
  );
};
