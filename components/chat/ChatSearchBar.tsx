"use client";

import React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface ChatSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <Box sx={{ px: 1.5, py: 1 }}>
      <TextField
        fullWidth
        placeholder="Search or start new chat"
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#8696A0", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#202C33",
            borderRadius: "8px",
            "& fieldset": { border: "none" },
            "& input": {
              color: "#E9EDEF",
              fontSize: "0.875rem",
              py: 1,
              "&::placeholder": {
                color: "#8696A0",
                opacity: 1,
              },
            },
          },
        }}
      />
    </Box>
  );
};
