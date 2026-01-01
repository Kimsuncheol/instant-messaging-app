"use client";

import React from "react";
import { Paper, Typography, Button, Alert } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";

interface LoginCardProps {
  onLogin: () => Promise<void>;
  error: string | null;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLogin, error }) => {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 5, 
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'border-color 0.3s',
        '&:hover': {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }
      }}
    >
      <Typography variant="h5" color="text.primary" gutterBottom>
        Welcome Back
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Sign in to continue to your workspace.
      </Typography>

      <Button
        fullWidth
        variant="contained"
        color="inherit"
        startIcon={<GoogleIcon />}
        onClick={onLogin}
        sx={{ 
          py: 1.5, 
          bgcolor: 'common.white', 
          color: 'common.black',
          '&:hover': {
            bgcolor: 'grey.300',
          },
          fontWeight: 700,
          fontSize: '0.875rem'
        }}
      >
        Continue with Google
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2, bgcolor: 'transparent', color: 'error.light' }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mt: 5, opacity: 0.6 }}>
        By continuing, you agree to Aura&apos;s Terms of Service and Privacy Policy.
      </Typography>
    </Paper>
  );
};
