"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";

interface NewChatHeaderProps {
  onClose: () => void;
}

export const NewChatHeader: React.FC<NewChatHeaderProps> = ({ onClose }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 3,
        px: 3,
        py: 2,
        bgcolor: '#202C33',
      }}
    >
      <IconButton 
        onClick={onClose} 
        size="small" 
        aria-label="close"
        sx={{ 
          color: '#AEBAC1',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <BackIcon />
      </IconButton>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 500,
          fontSize: '1.1rem',
          color: '#E9EDEF',
        }}
      >
        New chat
      </Typography>
    </Box>
  );
};
