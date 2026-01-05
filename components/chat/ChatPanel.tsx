"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { ChatList } from "./ChatList";
import { ChatView } from "./ChatView";
import { ChatPanelHeader } from "./ChatPanelHeader";

interface ChatPanelProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  selectedChatId,
  onSelectChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
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
          <ChatPanelHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalMatches={0}
          />
          
          {/* Chat List */}
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <ChatList 
              onSelectChat={onSelectChat} 
              selectedChatId={selectedChatId || undefined}
              searchTerm={searchTerm}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
