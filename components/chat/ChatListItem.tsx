"use client";

import React from "react";
import { Box, ListItemButton, ListItemAvatar, ListItemText, Avatar, Typography } from "@mui/material";
import { Chat, getUnreadCount } from "@/lib/chatService";
import { UserProfile } from "@/lib/userService";
import { ActiveStatusBadge } from "@/components/shared/ActiveStatusBadge";
import { UserPresence } from "@/lib/presenceService";
import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

interface ChatListItemProps {
  chat: Chat;
  selected: boolean;
  onSelect: (chatId: string) => void;
  user: User | null;
  getOtherUser: (chat: Chat) => UserProfile | undefined;
  presence?: UserPresence;
  onContextMenu: (e: React.MouseEvent) => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  selected,
  onSelect,
  user,
  getOtherUser,
  presence,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
}) => {
  const isGroup = chat.type === "group";
  const otherUser = !isGroup ? getOtherUser(chat) : undefined;
  
  // For groups, display group info
  const displayName = isGroup 
    ? (chat.groupName || "Unnamed Group") 
    : (otherUser?.displayName || "Unknown User");
  const displayPhoto = isGroup 
    ? chat.groupPhotoURL 
    : otherUser?.photoURL;
  const displayInitial = isGroup 
    ? (chat.groupName?.[0] || "G") 
    : otherUser?.displayName?.[0];

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <ListItemButton
      selected={selected}
      onClick={() => onSelect(chat.id)}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #222D34",
        "&:hover": { bgcolor: "#202C33" },
        "&.Mui-selected": { 
          bgcolor: "#2A3942",
          "&:hover": { bgcolor: "#2A3942" },
        },
      }}
    >
      <ListItemAvatar>
        {isGroup ? (
          <Avatar
            src={displayPhoto}
            sx={{ width: 50, height: 50, bgcolor: "#00A884" }}
          >
            {displayInitial}
          </Avatar>
        ) : (
          <ActiveStatusBadge presence={presence}>
            <Avatar
              src={displayPhoto}
              sx={{ width: 50, height: 50, bgcolor: "#6B7C85" }}
            >
              {displayInitial}
            </Avatar>
          </ActiveStatusBadge>
        )}
      </ListItemAvatar>
      <ListItemText
        sx={{ ml: 1 }}
        primaryTypographyProps={{ component: "div" }}
        secondaryTypographyProps={{ component: "div" }}
        primary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "#E9EDEF", fontWeight: 400, fontSize: "1rem" }}>
              {displayName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ color: user && getUnreadCount(chat, user.uid) > 0 ? "#00A884" : "#8696A0", fontSize: "0.75rem" }}>
                {formatTime(chat.lastMessageAt)}
              </Typography>
            </Box>
          </Box>
        }
        secondary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              component="span"
              sx={{
                color: "#8696A0",
                fontSize: "0.875rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {isGroup && chat.participants.length > 0 
                ? `${chat.participants.length} members` 
                : ""} {chat.lastMessage || (isGroup ? "" : "No messages yet")}
            </Typography>
            {user && getUnreadCount(chat, user.uid) > 0 && (
              <Box
                sx={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: "10px",
                  bgcolor: "#00A884",
                  color: "#111B21",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 0.5,
                  ml: 1,
                }}
              >
                {getUnreadCount(chat, user.uid)}
              </Box>
            )}
          </Box>
        }
      />
    </ListItemButton>
  );
};
