"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";

interface SidebarHeaderProps {
  onLogout: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onLogout }) => {
  return (
    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
        Aura
      </Typography>
      <IconButton onClick={onLogout} size="small" color="inherit" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
        <LogoutIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
