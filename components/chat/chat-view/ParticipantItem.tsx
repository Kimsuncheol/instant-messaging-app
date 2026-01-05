"use client";

import React from "react";
import { ListItem, ListItemAvatar, ListItemText, Typography, Avatar } from "@mui/material";
import { UserProfile } from "@/lib/userService";
import { UserPresence } from "@/lib/presenceService";
import { ActiveStatusBadge } from "@/components/shared/ActiveStatusBadge";

interface ParticipantItemProps {
  participant: UserProfile;
  presence?: UserPresence;
  presenceText: string;
  presenceColor: string;
  isSelf: boolean;
  onClick: (userId: string) => void;
}

export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  presence,
  presenceText,
  presenceColor,
  isSelf,
  onClick,
}) => {
  return (
    <ListItem
      onClick={() => onClick(participant.uid)}
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: "8px",
        cursor: "pointer",
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.05)",
        },
      }}
    >
      <ListItemAvatar>
        <ActiveStatusBadge presence={presence} showDot={!isSelf}>
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
        </ActiveStatusBadge>
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
          <Typography
            sx={{
              color: presenceColor,
              fontSize: "0.875rem",
            }}
          >
            {presenceText}
          </Typography>
        }
      />
    </ListItem>
  );
};
