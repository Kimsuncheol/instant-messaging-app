"use client";

import React from "react";
import { Box, InputBase, IconButton } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";

interface FriendsListSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const FriendsListSearchBar: React.FC<FriendsListSearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <Box sx={{ p: 2, pb: 0 }}>
      <Box
        sx={{
          bgcolor: "#202C33",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          px: 2,
          height: 35,
        }}
      >
        <SearchIcon sx={{ color: "#AEBAC1", fontSize: 20, mr: 2 }} />
        <InputBase
          placeholder="Search friends"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
          sx={{
            color: "#E9EDEF",
            fontSize: "0.9375rem",
            "& ::placeholder": {
              color: "#8696A0",
              opacity: 1,
            },
          }}
        />
        {searchTerm && (
          <IconButton
            size="small"
            onClick={() => onSearchChange("")}
            sx={{ color: "#AEBAC1", p: 0.5 }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
