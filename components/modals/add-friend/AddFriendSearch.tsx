"use client";

import React from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface AddFriendSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const AddFriendSearch: React.FC<AddFriendSearchProps> = ({
  value,
  onChange,
}) => {
  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <TextField
        fullWidth
        placeholder="Search by name or email"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
              fontSize: "0.9375rem",
              py: 1.25,
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
