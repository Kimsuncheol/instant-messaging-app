"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { WhatsApp as WhatsAppIcon, LockOutlined as LockIcon } from "@mui/icons-material";

interface WelcomeViewProps {
  onNewChat: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onNewChat }) => {
  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#222E35',
        position: 'relative',
      }}
    >
      {/* Main Content */}
      <Box sx={{ textAlign: 'center', maxWidth: 560, px: 4 }}>
        {/* WhatsApp Logo */}
        <Box 
          sx={{ 
            width: 320,
            height: 188,
            mx: 'auto',
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WhatsAppIcon 
            sx={{ 
              fontSize: 140, 
              color: '#364147',
            }} 
          />
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            color: '#E9EDEF',
            fontWeight: 300,
            fontSize: '2rem',
            mb: 2,
          }}
        >
          WhatsApp Web
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#8696A0',
            lineHeight: 1.6,
            mb: 4,
          }}
        >
          Send and receive messages without keeping your phone online.
          <br />
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </Typography>

        <Button
          variant="contained"
          onClick={onNewChat}
          sx={{
            bgcolor: '#00A884',
            color: '#111B21',
            px: 4,
            py: 1.25,
            borderRadius: '24px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.9375rem',
            '&:hover': {
              bgcolor: '#008069',
            },
          }}
        >
          Start a new chat
        </Button>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          position: 'absolute',
          bottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: '#8696A0',
        }}
      >
        <LockIcon sx={{ fontSize: 14 }} />
        <Typography variant="caption" sx={{ fontSize: '0.8125rem' }}>
          End-to-end encrypted
        </Typography>
      </Box>
    </Box>
  );
};
