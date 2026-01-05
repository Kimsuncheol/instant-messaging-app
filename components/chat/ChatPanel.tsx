"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { ChatList } from "./ChatList";
import { ChatView } from "./ChatView";
import { ChatPanelHeader } from "./ChatPanelHeader";
import { SidebarUserInfo } from "@/components/dashboard/SidebarUserInfo";
import { useAuth } from "@/context/AuthContext";

interface ChatPanelProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  selectedChatId,
  onSelectChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

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
        <ChatView chatId={selectedChatId!} onBack={() => onSelectChat("")} />
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

          {/* User Info Footer - Mobile Only */}
          {user && (
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <SidebarUserInfo user={user} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
