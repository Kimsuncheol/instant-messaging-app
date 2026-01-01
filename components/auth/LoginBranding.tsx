"use client";

import React from "react";
import { Box, Typography, Fade } from "@mui/material";

export const LoginBranding: React.FC = () => {
  return (
    <Fade in timeout={1000}>
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '3rem', md: '4rem' },
            background: 'linear-gradient(to bottom right, #ffffff, #71717a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Aura
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.125rem', mt: 1 }}>
          Experience messaging, redefined with AI.
        </Typography>
      </Box>
    </Fade>
  );
};
