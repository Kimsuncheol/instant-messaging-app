"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { WhatsApp as WhatsAppIcon } from "@mui/icons-material";

export const LoadingScreen: React.FC = () => {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      minHeight="100vh" 
      alignItems="center" 
      justifyContent="center" 
      bgcolor="#111B21"
      gap={3}
    >
      <WhatsAppIcon sx={{ fontSize: 64, color: '#25D366' }} />
      <CircularProgress 
        size={24} 
        sx={{ color: '#8696A0' }} 
      />
    </Box>
  );
};
