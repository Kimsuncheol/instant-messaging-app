"use client";

import React from "react";
import {
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
} from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import { Friend } from "@/lib/friendService";
import { UserProfile } from "@/lib/userService";
import { UserPresence } from "@/lib/presenceService";
import { ActiveStatusBadge } from "@/components/shared/ActiveStatusBadge";

interface FriendListItemProps {
  friend: Friend;
  profile?: UserProfile;
  presence?: UserPresence;
  isFavourite: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onLongPress: (target: HTMLElement) => void;
}

export const FriendListItem: React.FC<FriendListItemProps> = ({
  friend,
  profile,
  presence,
  isFavourite,
  onClick,
  onContextMenu,
  onLongPress,
}) => {
  const [longPressTriggered, setLongPressTriggered] = React.useState(false);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startTimer = (target: HTMLElement) => {
    setLongPressTriggered(false);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      onLongPress(target);
    }, 500);
  };

  const handleClick = () => {
    if (longPressTriggered) {
      setLongPressTriggered(false);
      return;
    }
    onClick();
  };

  return (
    <ListItemButton
      onClick={handleClick}
      onContextMenu={onContextMenu}
      onTouchStart={(e) => startTimer(e.currentTarget)}
      onTouchEnd={clearTimer}
      onTouchMove={clearTimer}
      onMouseDown={(e) => startTimer(e.currentTarget)}
      onMouseUp={clearTimer}
      onMouseLeave={clearTimer}
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: "1px solid #2A3942",
        "&:hover": { bgcolor: "#202C33" },
      }}
    >
      <ListItemAvatar>
        <ActiveStatusBadge presence={presence}>
          <Avatar
            src={profile?.photoURL || undefined}
            sx={{ bgcolor: "#6B7C85" }}
          >
            {profile?.displayName?.[0] || "?"}
          </Avatar>
        </ActiveStatusBadge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {profile?.displayName || "Loading..."}
            {isFavourite && (
              <StarIcon sx={{ fontSize: "1rem", color: "#FFD700" }} />
            )}
          </Box>
        }
        secondary={profile?.about || "Hey there! I am using WhatsApp."}
        primaryTypographyProps={{
          sx: { color: "#E9EDEF", fontWeight: 500 },
        }}
        secondaryTypographyProps={{
          sx: { color: "#8696A0", fontSize: "0.875rem" },
        }}
      />
    </ListItemButton>
  );
};
