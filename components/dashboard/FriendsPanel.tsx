"use client";

import React, { useState } from "react";
import { Box, IconButton, Avatar, Tooltip, Badge, Typography, Divider, InputBase } from "@mui/material";
import { PersonAdd as PersonAddIcon, Group as GroupIcon, Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { User } from "firebase/auth";
import { FriendsList } from "./FriendsList";
import { SidebarUserInfo } from "./SidebarUserInfo";

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          Friends
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Add friend">
            <IconButton
              onClick={onAddFriend}
              sx={{
                color: "#AEBAC1",
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <Badge
                badgeContent={pendingFriendRequestCount}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#00A884",
                    color: "#FFFFFF",
                    fontWeight: 600,
                  },
                }}
              >
                <PersonAddIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Create group">
            <IconButton
              onClick={onCreateGroup}
              sx={{
                color: "#AEBAC1",
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <GroupIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Box
          sx={{
            bgcolor: "#202C33",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            px: 2,
            height: 35,
          }}
        >
          <SearchIcon sx={{ color: "#AEBAC1", fontSize: 20, mr: 2 }} />
          <InputBase
            placeholder="Search friends"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{
              color: "#E9EDEF",
              fontSize: "0.9375rem",
              "& ::placeholder": {
                color: "#8696A0",
                opacity: 1,
              },
            }}
          />
          {searchTerm && (
            <IconButton
              size="small"
              onClick={() => setSearchTerm("")}
              sx={{ color: "#AEBAC1", p: 0.5 }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Friends List */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <FriendsList onSelectChat={onSelectChat} searchTerm={searchTerm} />
      </Box>

      {/* User Info */}
      <SidebarUserInfo user={user} />
    </Box>
  );
};
