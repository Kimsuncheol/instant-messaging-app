"use client";

import React from "react";
import { Box, Typography, Fade } from "@mui/material";
import { WhatsApp } from "@mui/icons-material";

export const LoginBranding: React.FC = () => {
  return (
    <Fade in timeout={800}>
      <Box textAlign="center" mb={4}>
        <Box 
          sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <WhatsApp 
            sx={{ 
              fontSize: 56, 
              color: '#25D366',
            }} 
          />
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#E9EDEF',
            fontWeight: 300,
            letterSpacing: '-0.01em',
          }}
        >
          WhatsApp
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#8696A0',
            mt: 1,
          }}
        >
          Simple. Secure. Reliable messaging.
        </Typography>
      </Box>
    </Fade>
  );
};
