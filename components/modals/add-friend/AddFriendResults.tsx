"use client";

import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";
import { PersonAdd as PersonAddIcon, Check as CheckIcon, HourglassEmpty as PendingIcon } from "@mui/icons-material";
import { UserProfile } from "@/lib/userService";

interface AddFriendResultsProps {
  loading: boolean;
  users: UserProfile[];
  searchTerm: string;
  friendIds: string[];
  pendingRequestIds: string[];
  onSendRequest: (userId: string) => void;
}

export const AddFriendResults: React.FC<AddFriendResultsProps> = ({
  loading,
  users,
  searchTerm,
  friendIds,
  pendingRequestIds,
  onSendRequest,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} sx={{ color: "#00A884" }} />
      </Box>
    );
  }

  if (searchTerm.length > 0 && searchTerm.length < 3) {
    return (
      <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
        <Typography sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
          Type at least 3 characters to search
        </Typography>
      </Box>
    );
  }

  if (searchTerm.length >= 3 && users.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
        <Typography sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
          No users found for &quot;{searchTerm}&quot;
        </Typography>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4, px: 3 }}>
        <Typography sx={{ color: "#8696A0", fontSize: "0.9375rem" }}>
          Search for users to add as friends
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ py: 0, flexGrow: 1, overflowY: "auto" }}>
      {users.map((user) => {
        const isFriend = friendIds.includes(user.uid);
        const isPending = pendingRequestIds.includes(user.uid);

        return (
          <ListItemButton
            key={user.uid}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid #222D34",
              "&:hover": { bgcolor: "#202C33" },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={user.photoURL}
                sx={{ width: 50, height: 50, bgcolor: "#6B7C85" }}
              >
                {user.displayName?.[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              sx={{ ml: 1 }}
              primary={
                <Typography sx={{ color: "#E9EDEF", fontWeight: 400, fontSize: "1rem" }}>
                  {user.displayName}
                </Typography>
              }
              secondary={
                <Typography sx={{ color: "#8696A0", fontSize: "0.875rem" }}>
                  {user.email}
                </Typography>
              }
            />
            {isFriend ? (
              <Chip
                icon={<CheckIcon sx={{ fontSize: 16 }} />}
                label="Friends"
                size="small"
                sx={{
                  bgcolor: "rgba(0, 168, 132, 0.2)",
                  color: "#00A884",
                  "& .MuiChip-icon": { color: "#00A884" },
                }}
              />
            ) : isPending ? (
              <Chip
                icon={<PendingIcon sx={{ fontSize: 16 }} />}
                label="Pending"
                size="small"
                sx={{
                  bgcolor: "rgba(134, 150, 160, 0.2)",
                  color: "#8696A0",
                  "& .MuiChip-icon": { color: "#8696A0" },
                }}
              />
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => onSendRequest(user.uid)}
                sx={{
                  bgcolor: "#00A884",
                  color: "#111B21",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "#00BF96" },
                }}
              >
                Add
              </Button>
            )}
          </ListItemButton>
        );
      })}
    </List>
  );
};
