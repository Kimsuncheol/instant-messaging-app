"use client";

import React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface NewChatSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const NewChatSearch: React.FC<NewChatSearchProps> = ({ value, onChange }) => {
  return (
    <Box sx={{ px: 2, py: 1.5, bgcolor: '#111B21' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search name or email"
        variant="outlined"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#8696A0', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: '#202C33',
            borderRadius: '8px',
            '& fieldset': { border: 'none' },
            '& input': {
              color: '#E9EDEF',
              fontSize: '0.9375rem',
              py: 1,
              '&::placeholder': {
                color: '#8696A0',
                opacity: 1,
              },
            },
          },
        }}
      />
    </Box>
  );
};
