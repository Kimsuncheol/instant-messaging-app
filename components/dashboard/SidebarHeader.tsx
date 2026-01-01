"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Logout as LogoutIcon, Add as AddIcon } from "@mui/icons-material";

interface SidebarHeaderProps {
  onLogout: () => void;
  onNewChat: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onLogout, onNewChat }) => {
  return (
    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
        Aura
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton onClick={onNewChat} size="small" color="inherit" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
          <AddIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={onLogout} size="small" color="inherit" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

