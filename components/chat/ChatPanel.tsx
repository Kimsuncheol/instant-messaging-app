"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { ChatList } from "./ChatList";
import { ChatView } from "./ChatView";

interface ChatPanelProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  selectedChatId,
  onSelectChat,
}) => {
  // Show ChatView when a chat is selected, otherwise show ChatList
  const isInRoom = Boolean(selectedChatId);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        bgcolor: "#0B141A",
      }}
    >
      {isInRoom ? (
        // In-room: Show ChatView
        <ChatView 
          chatId={selectedChatId!} 
          onBack={() => onSelectChat("")}
        />
      ) : (
        // In-list: Show ChatList with header
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1.5,
              bgcolor: "#202C33",
              minHeight: 60,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
            >
              Chats
            </Typography>
          </Box>
          
          {/* Chat List */}
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <ChatList 
              onSelectChat={onSelectChat} 
              selectedChatId={selectedChatId || undefined} 
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
