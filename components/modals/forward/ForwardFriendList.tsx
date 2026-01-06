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
import { UserProfile } from "@/lib/userService";

interface ForwardFriendListProps {
  friends: UserProfile[];
  loading?: boolean;
  onSelect: (friendId: string) => void;
}

export const ForwardFriendList: React.FC<ForwardFriendListProps> = ({
  friends,
  loading,
  onSelect,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#00A884" }} />
      </Box>
    );
  }

  if (friends.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "#8696A0" }}>No friends found</Typography>
      </Box>
    );
  }

  return (
    <List>
      {friends.map((friend) => (
        <ListItemButton
          key={friend.uid}
          onClick={() => onSelect(friend.uid)}
          sx={{
            py: 1.5,
            "&:hover": { bgcolor: "#202C33" },
          }}
        >
          <ListItemAvatar>
            <Avatar src={friend.photoURL} sx={{ bgcolor: "#6B7C85" }}>
              {friend.displayName?.[0] || "?"}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={friend.displayName || "Unknown"}
            secondary={friend.email}
            primaryTypographyProps={{ color: "#E9EDEF" }}
            secondaryTypographyProps={{ color: "#8696A0", fontSize: "0.75rem" }}
          />
        </ListItemButton>
      ))}
    </List>
  );
};
