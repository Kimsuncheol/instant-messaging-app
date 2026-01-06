"use client";

import React from "react";
import {
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Chat } from "@/lib/chatService";
import { UserProfile } from "@/lib/userService";

interface ForwardChatListProps {
  chats: Chat[];
  chatUsers: Record<string, UserProfile>;
  currentUserId?: string;
  loading?: boolean;
  onSelect: (chatId: string) => void;
}

export const ForwardChatList: React.FC<ForwardChatListProps> = ({
  chats,
  chatUsers,
  currentUserId,
  loading,
  onSelect,
}) => {
  const getChatDisplayName = (chat: Chat): string => {
    if (chat.type === "group") {
      return chat.groupName || "Unnamed Group";
    }
    const otherUserId = chat.participants.find((p) => p !== currentUserId);
    return otherUserId
      ? chatUsers[otherUserId]?.displayName || "Unknown"
      : "Unknown";
  };

  const getChatPhoto = (chat: Chat): string | undefined => {
    if (chat.type === "group") {
      return chat.groupPhotoURL;
    }
    const otherUserId = chat.participants.find((p) => p !== currentUserId);
    return otherUserId ? chatUsers[otherUserId]?.photoURL : undefined;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#00A884" }} />
      </Box>
    );
  }

  if (chats.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "#8696A0" }}>No chats found</Typography>
      </Box>
    );
  }

  return (
    <List>
      {chats.map((chat) => (
        <ListItemButton
          key={chat.id}
          onClick={() => onSelect(chat.id)}
          sx={{
            py: 1.5,
            "&:hover": { bgcolor: "#202C33" },
          }}
        >
          <ListItemAvatar>
            <Avatar
              src={getChatPhoto(chat)}
              sx={{
                bgcolor: chat.type === "group" ? "#00A884" : "#6B7C85",
              }}
            >
              {getChatDisplayName(chat)[0]}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={getChatDisplayName(chat)}
            primaryTypographyProps={{ color: "#E9EDEF" }}
          />
        </ListItemButton>
      ))}
    </List>
  );
};
