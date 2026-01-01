"use client";

import React, { useState } from "react";
import { 
  Paper, 
  Typography, 
  Button, 
  Alert, 
  TextField, 
  Divider,
  Box,
  InputAdornment,
  IconButton 
} from "@mui/material";
import { 
  Google as GoogleIcon, 
  Visibility, 
  VisibilityOff 
} from "@mui/icons-material";

interface LoginCardProps {
  onGoogleLogin: () => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  error: string | null;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onGoogleLogin, onEmailLogin, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onEmailLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    try {
      await onGoogleLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        bgcolor: '#202C33',
        borderRadius: '8px',
        boxShadow: '0 1px 1px 0 rgba(0,0,0,0.06), 0 2px 5px 0 rgba(0,0,0,0.2)',
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#E9EDEF',
          fontWeight: 400,
          mb: 1,
        }}
      >
        Sign in to continue
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#8696A0',
          mb: 3,
        }}
      >
        Enter your credentials or use Google
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          placeholder="Email address"
          variant="outlined"
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#2A3942',
              borderRadius: '8px',
              '& input': {
                color: '#E9EDEF',
                '&::placeholder': {
                  color: '#8696A0',
                  opacity: 1,
                },
              },
            },
          }}
        />
        <TextField
          fullWidth
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: '#8696A0' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#2A3942',
              borderRadius: '8px',
              '& input': {
                color: '#E9EDEF',
                '&::placeholder': {
                  color: '#8696A0',
                  opacity: 1,
                },
              },
            },
          }}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isLoading || !email || !password}
          sx={{ 
            py: 1.25,
            bgcolor: '#00A884',
            color: '#111B21',
            fontWeight: 500,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.9375rem',
            '&:hover': {
              bgcolor: '#008069',
            },
            '&.Mui-disabled': {
              bgcolor: '#1D4E43',
              color: '#8696A0',
            },
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
        <Divider sx={{ flex: 1, borderColor: '#2A3942' }} />
        <Typography 
          variant="caption" 
          sx={{ 
            px: 2, 
            color: '#8696A0',
            textTransform: 'uppercase',
            fontSize: '0.6875rem',
          }}
        >
          or
        </Typography>
        <Divider sx={{ flex: 1, borderColor: '#2A3942' }} />
      </Box>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleClick}
        disabled={isLoading}
        sx={{ 
          py: 1.25,
          borderColor: '#2A3942',
          color: '#E9EDEF',
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '0.9375rem',
          '&:hover': {
            borderColor: '#3B4A54',
            bgcolor: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        Continue with Google
      </Button>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2, 
            bgcolor: 'rgba(239,83,80,0.1)',
            color: '#EF5350',
            border: '1px solid rgba(239,83,80,0.3)',
            borderRadius: '8px',
            '& .MuiAlert-icon': {
              color: '#EF5350',
            },
          }}
        >
          {error}
        </Alert>
      )}
    </Paper>
  );
};
