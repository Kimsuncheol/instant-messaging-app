"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface NewChatHeaderProps {
  onClose: () => void;
}

export const NewChatHeader: React.FC<NewChatHeaderProps> = ({ onClose }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6" fontWeight={600}>New Message</Typography>
      <IconButton onClick={onClose} size="small" aria-label="close">
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
