"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import { User } from "firebase/auth";
import { FriendsList } from "./FriendsList";
import { SidebarUserInfo } from "./SidebarUserInfo";
import { FriendsListHeader } from "./FriendsListHeader";
import { FriendsListSearchBar } from "./FriendsListSearchBar";

interface FriendsPanelProps {
  user: User;
  width: number | string;
  onAddFriend: () => void;
  onCreateGroup: () => void;
  onSelectChat: (chatId: string) => void;
  pendingFriendRequestCount?: number;
}

export const FriendsPanel: React.FC<FriendsPanelProps> = ({
  user,
  width,
  onAddFriend,
  onCreateGroup,
  onSelectChat,
  pendingFriendRequestCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <Box
      sx={{
        width,
        minWidth: width,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#111B21",
        borderRight: "1px solid #2A3942",
      }}
    >
      {/* Header */}
      <Box sx={{ minHeight: 60 }}> {/* Placeholder for dynamic height application */}
        <FriendsListHeader
          onAddFriend={onAddFriend}
          onCreateGroup={onCreateGroup}
          pendingFriendRequestCount={pendingFriendRequestCount}
        />
      </Box>

      {/* Search Bar */}
      <FriendsListSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Friends List */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <FriendsList onSelectChat={onSelectChat} searchTerm={searchTerm} />
      </Box>

      {/* User Info */}
      <SidebarUserInfo user={user} />
    </Box>
  );
};
