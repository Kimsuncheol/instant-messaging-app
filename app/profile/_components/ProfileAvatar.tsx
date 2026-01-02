"use client";

import React from "react";
import { Box, Avatar, IconButton } from "@mui/material";
import { CameraAlt as CameraIcon } from "@mui/icons-material";

interface ProfileAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  isDark: boolean;
}

export function ProfileAvatar({ photoURL, displayName, isDark }: ProfileAvatarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={photoURL || undefined}
          sx={{
            width: 200,
            height: 200,
            bgcolor: isDark ? "#6B7C85" : "#DFE5E7",
            fontSize: "4rem",
          }}
        >
          {displayName?.[0]}
        </Avatar>
        <IconButton
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            bgcolor: "#00A884",
            color: "#FFFFFF",
            "&:hover": { bgcolor: "#008069" },
          }}
        >
          <CameraIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
