"use client";

import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { QuestionAnswer as ChatIcon, Add as AddIcon } from "@mui/icons-material";

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
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          bgcolor: 'primary.main',
          opacity: 0.1,
          filter: 'blur(120px)',
          borderRadius: '50%',
        }} 
      />
      
      <Box sx={{ zIndex: 1, textAlign: 'center' }}>
        <Paper 
          elevation={24}
          sx={{ 
            width: 80, 
            height: 80, 
            background: 'linear-gradient(to bottom right, #6366f1, #a855f7)', 
            borderRadius: '24px',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)'
          }}
        >
          <ChatIcon sx={{ fontSize: 40, color: 'white' }} />
        </Paper>
        <Typography variant="h4" fontWeight={600} mb={1}>
          Select a conversation
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto', mb: 4 }}>
          Choose a contact from the sidebar or start a new chat to begin messaging with AI power.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={onNewChat}
          sx={{ 
            px: 4, 
            py: 1.2, 
            borderRadius: '100px',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          New Message
        </Button>
      </Box>
    </Box>
  );
};
