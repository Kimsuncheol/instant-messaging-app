"use client";

import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { FriendRequest } from "@/lib/friendService";
import { UserProfile } from "@/lib/userService";

interface FriendRequestListProps {
  requests: FriendRequest[];
  users: Record<string, UserProfile>;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const FriendRequestList: React.FC<FriendRequestListProps> = ({
  requests,
  users,
  onAccept,
  onReject,
}) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Box sx={{ borderBottom: "1px solid #2A3942" }}>
      <Typography
        sx={{
          px: 2,
          py: 1.5,
          color: "#00A884",
          fontSize: "0.875rem",
          fontWeight: 500,
          bgcolor: "#1A2A32",
        }}
      >
        Friend Requests ({requests.length})
      </Typography>
      <List sx={{ py: 0 }}>
        {requests.map((request) => {
          const user = users[request.fromUserId];
          return (
            <ListItem
              key={request.id}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid #222D34",
                bgcolor: "#182229",
              }}
              secondaryAction={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Tooltip title="Accept">
                    <IconButton
                      onClick={() => onAccept(request.id)}
                      sx={{
                        color: "#00A884",
                        bgcolor: "rgba(0, 168, 132, 0.15)",
                        "&:hover": { bgcolor: "rgba(0, 168, 132, 0.25)" },
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      onClick={() => onReject(request.id)}
                      sx={{
                        color: "#F15C6D",
                        bgcolor: "rgba(241, 92, 109, 0.15)",
                        "&:hover": { bgcolor: "rgba(241, 92, 109, 0.25)" },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={user?.photoURL}
                  sx={{ width: 45, height: 45, bgcolor: "#6B7C85" }}
                >
                  {user?.displayName?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography sx={{ color: "#E9EDEF", fontWeight: 400, fontSize: "0.9375rem" }}>
                    {user?.displayName || "Unknown User"}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: "#8696A0", fontSize: "0.8125rem" }}>
                    wants to be your friend
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
