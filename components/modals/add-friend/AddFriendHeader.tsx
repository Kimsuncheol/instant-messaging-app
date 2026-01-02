"use client";

import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

interface AddFriendHeaderProps {
  onClose: () => void;
}

export const AddFriendHeader: React.FC<AddFriendHeaderProps> = ({ onClose }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 2,
        bgcolor: "#202C33",
        minHeight: 60,
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          color: "#AEBAC1",
          "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography
        sx={{
          color: "#E9EDEF",
          fontSize: "1.1875rem",
          fontWeight: 500,
        }}
      >
        Add Friend
      </Typography>
    </Box>
  );
};
