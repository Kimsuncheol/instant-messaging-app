"use client";

import React from "react";
import { Box, Typography, IconButton, Badge, Tooltip } from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";

interface FriendsListHeaderProps {
  onAddFriend: () => void;
  onCreateGroup: () => void;
  pendingFriendRequestCount?: number;
}

import { useUiStore } from "@/store/uiStore";

// ... imports

export const FriendsListHeader: React.FC<FriendsListHeaderProps> = ({
  onAddFriend,
  onCreateGroup,
  pendingFriendRequestCount = 0,
}) => {
  const headerHeightA = useUiStore((state) => state.headerHeightA);
  const setActiveMobileTab = useUiStore((state) => state.setActiveMobileTab);

  return (
    <Box
      sx={{
        height: headerHeightA,
        minHeight: headerHeightA,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        bgcolor: "#202C33",
        // Height will be controlled by parent or store
        width: "100%",
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
      >
        Friends
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton
          onClick={() => setActiveMobileTab("chats")}
          sx={{
            display: { xs: "flex", md: "none" },
            color: "#AEBAC1",
          }}
        >
          <ChatIcon />
        </IconButton>
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
  );
};
