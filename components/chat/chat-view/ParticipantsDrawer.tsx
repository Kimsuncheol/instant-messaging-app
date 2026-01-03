"use client";

import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Close as CloseIcon, Circle as CircleIcon } from "@mui/icons-material";
import { Chat } from "@/lib/chatService";
import { UserProfile } from "@/lib/userService";

interface ParticipantsDrawerProps {
  open: boolean;
  onClose: () => void;
  chat: Chat | null;
  participants: UserProfile[];
}

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  open,
  onClose,
  chat,
  participants,
}) => {
  const isGroup = chat?.type === "group";
  const participantCount = participants.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400 },
          bgcolor: "#0B141A",
          borderLeft: "1px solid #2A3942",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 2,
          bgcolor: "#202C33",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
        >
          {isGroup ? `Group Info` : `Chat Info`}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Group/Chat Details */}
      {isGroup && chat && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 3,
            px: 2,
            bgcolor: "#202C33",
            borderBottom: "1px solid #2A3942",
          }}
        >
          <Avatar
            src={chat.groupPhotoURL}
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#00A884",
              fontSize: "2rem",
              mb: 2,
            }}
          >
            {chat.groupName?.[0] || "G"}
          </Avatar>
          <Typography
            variant="h6"
            sx={{ color: "#E9EDEF", fontWeight: 500, mb: 0.5 }}
          >
            {chat.groupName || "Unnamed Group"}
          </Typography>
          {chat.groupDescription && (
            <Typography
              variant="body2"
              sx={{ color: "#8696A0", textAlign: "center" }}
            >
              {chat.groupDescription}
            </Typography>
          )}
        </Box>
      )}

      {/* Participants Section */}
      <Box sx={{ px: 2, py: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#00A884",
            fontWeight: 500,
            mb: 1,
            fontSize: "0.875rem",
          }}
        >
          {participantCount} {participantCount === 1 ? "PARTICIPANT" : "PARTICIPANTS"}
        </Typography>
      </Box>

      {/* Participants List */}
      <List sx={{ px: 1, py: 0 }}>
        {participants.map((participant) => (
          <ListItem
            key={participant.uid}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: "8px",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={participant.photoURL}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#6B7C85",
                }}
              >
                {participant.displayName?.[0] || "U"}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color: "#E9EDEF",
                    fontWeight: 400,
                    fontSize: "1rem",
                  }}
                >
                  {participant.displayName}
                </Typography>
              }
              secondary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <CircleIcon
                    sx={{
                      fontSize: "8px",
                      color: "#00A884",
                    }}
                  />
                  <Typography
                    sx={{
                      color: "#8696A0",
                      fontSize: "0.875rem",
                    }}
                  >
                    online
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Empty State */}
      {participants.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 4,
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "#8696A0", textAlign: "center" }}
          >
            No participants found
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};
