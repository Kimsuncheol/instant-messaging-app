"use client";

import React from "react";
import { TextField } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface NewChatSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const NewChatSearch: React.FC<NewChatSearchProps> = ({ value, onChange }) => {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Search by email or name..."
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
      }}
      sx={{ mb: 2 }}
    />
  );
};
