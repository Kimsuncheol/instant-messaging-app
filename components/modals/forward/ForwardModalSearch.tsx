"use client";

import React from "react";
import { Box, TextField, InputAdornment, Typography } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface ForwardModalSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  previewText?: string;
}

export const ForwardModalSearch: React.FC<ForwardModalSearchProps> = ({
  searchTerm,
  onSearchChange,
  previewText,
}) => {
  return (
    <Box sx={{ p: 2, bgcolor: "#202C33" }}>
      {/* Preview */}
      {previewText && (
        <Box
          sx={{
            bgcolor: "#005C4B",
            borderRadius: 1,
            p: 1.5,
            mb: 2,
          }}
        >
          <Typography sx={{ color: "#E9EDEF", fontSize: "0.875rem" }}>
            {previewText.length > 100
              ? `${previewText.slice(0, 100)}...`
              : previewText}
          </Typography>
        </Box>
      )}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search"
        size="small"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#8696A0" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#2A3942",
            borderRadius: "8px",
            "& fieldset": { border: "none" },
            "& input": { color: "#E9EDEF" },
          },
        }}
      />
    </Box>
  );
};
