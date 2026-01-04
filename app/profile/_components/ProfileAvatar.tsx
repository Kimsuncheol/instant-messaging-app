"use client";

import React from "react";
import { Box, Avatar, IconButton } from "@mui/material";
import { CameraAlt as CameraIcon, Collections as GalleryIcon } from "@mui/icons-material";

interface ProfileAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  isDark: boolean;
  onAvatarClick?: () => void;
  showGalleryIndicator?: boolean;
}

export function ProfileAvatar({ 
  photoURL, 
  displayName, 
  isDark,
  onAvatarClick,
  showGalleryIndicator = true,
}: ProfileAvatarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
      }}
    >
      <Box 
        sx={{ 
          position: "relative",
          cursor: onAvatarClick ? "pointer" : "default",
          "&:hover .avatar-overlay": {
            opacity: onAvatarClick ? 1 : 0,
          },
        }}
        onClick={onAvatarClick}
      >
        <Avatar
          src={photoURL || undefined}
          sx={{
            width: 200,
            height: 200,
            bgcolor: isDark ? "#6B7C85" : "#DFE5E7",
            fontSize: "4rem",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": onAvatarClick ? {
              transform: "scale(1.02)",
              boxShadow: isDark 
                ? "0 0 24px rgba(0, 168, 132, 0.3)" 
                : "0 0 24px rgba(0, 168, 132, 0.2)",
            } : {},
          }}
        >
          {displayName?.[0]}
        </Avatar>
        
        {/* Gallery indicator on hover */}
        {showGalleryIndicator && onAvatarClick && (
          <Box
            className="avatar-overlay"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
          >
            <GalleryIcon sx={{ fontSize: 48, color: "#fff" }} />
          </Box>
        )}
        
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
