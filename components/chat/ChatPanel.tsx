"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { ChatList } from "./ChatList";
import { ChatView } from "./ChatView";
import { ChatPanelHeader } from "./ChatPanelHeader";
import { SidebarUserInfo } from "@/components/dashboard/SidebarUserInfo";
import { SavedMessagesView } from "./chat-view/SavedMessagesView";
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
  const [selectedSavedChatroomId, setSelectedSavedChatroomId] = useState<
    string | null
  >(null);
  const { user } = useAuth();

  // Show ChatView when a chat is selected, SavedMessagesView when a saved chatroom is selected
  const isInChatRoom = Boolean(selectedChatId);
  const isInSavedRoom = Boolean(selectedSavedChatroomId);

  const handleSelectSavedChatroom = (chatroomId: string) => {
    setSelectedSavedChatroomId(chatroomId);
    onSelectChat(""); // Clear regular chat selection
  };

  const handleBackFromSaved = () => {
    setSelectedSavedChatroomId(null);
  };

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
      {isInChatRoom ? (
        // In regular chat room: Show ChatView
        <ChatView chatId={selectedChatId!} onBack={() => onSelectChat("")} />
      ) : isInSavedRoom ? (
        // In saved messages room: Show SavedMessagesView
        <SavedMessagesView
          chatroomId={selectedSavedChatroomId!}
          onBack={handleBackFromSaved}
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
              onSelectSavedChatroom={handleSelectSavedChatroom}
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
