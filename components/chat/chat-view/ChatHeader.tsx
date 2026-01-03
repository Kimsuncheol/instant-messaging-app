"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import {
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Call as CallIcon,
  Videocam as VideoIcon,
} from "@mui/icons-material";
import { UserProfile, getUserById } from "@/lib/userService";
import { Chat } from "@/lib/chatService";
import { ParticipantsDrawer } from "./ParticipantsDrawer";

interface ChatHeaderProps {
  chat: Chat | null;
  otherUser: UserProfile | null;
  onBack?: () => void;
  onAvatarClick?: () => void;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  otherUser,
  onBack,
  onAvatarClick,
  onSearchClick,
  onMenuClick,
  onVoiceCall,
  onVideoCall,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [participants, setParticipants] = useState<UserProfile[]>([]);

  const isGroup = chat?.type === "group";
  const displayName = isGroup
    ? chat?.groupName || "Unnamed Group"
    : otherUser?.displayName || "Loading...";
  const displayPhoto = isGroup ? chat?.groupPhotoURL : otherUser?.photoURL;
  const displayInitial = isGroup
    ? chat?.groupName?.[0] || "G"
    : otherUser?.displayName?.[0];

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

  const handleAvatarClick = () => {
    setDrawerOpen(true);
    onAvatarClick?.();
  };

  return (
    <>
      <Box
        sx={{
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
          onClick={handleAvatarClick}
          sx={{
            width: 40,
            height: 40,
            bgcolor: isGroup ? "#00A884" : "#6B7C85",
            cursor: "pointer",
          }}
        >
          {displayInitial}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1rem" }}>
            {displayName}
          </Typography>
          <Typography sx={{ color: "#8696A0", fontSize: "0.75rem" }}>
            {isGroup
              ? `${chat?.participants.length || 0} members`
              : "online"}
          </Typography>
        </Box>
        
        {/* Voice Call Button */}
        <IconButton 
          onClick={onVoiceCall} 
          sx={{ 
            color: "#AEBAC1",
            "&:hover": { color: "#00A884" },
          }}
        >
          <CallIcon />
        </IconButton>
        
        {/* Video Call Button */}
        <IconButton 
          onClick={onVideoCall} 
          sx={{ 
            color: "#AEBAC1",
            "&:hover": { color: "#00A884" },
          }}
        >
          <VideoIcon />
        </IconButton>
        
        <IconButton onClick={onSearchClick} sx={{ color: "#AEBAC1" }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={onMenuClick} sx={{ color: "#AEBAC1" }}>
          <MoreIcon />
        </IconButton>
      </Box>

      {/* Participants Drawer */}
      <ParticipantsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chat={chat}
        participants={participants}
      />
    </>
  );
};

