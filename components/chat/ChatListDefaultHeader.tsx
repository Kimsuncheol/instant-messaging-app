"use client";

import { useUiStore } from "@/store/uiStore";
import React, { useEffect, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Search as SearchIcon, People as PeopleIcon } from "@mui/icons-material";

interface ChatListDefaultHeaderProps {
  onSearchClick: () => void;
}

export const ChatListDefaultHeader: React.FC<ChatListDefaultHeaderProps> = ({
  onSearchClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const setHeaderHeightA = useUiStore((state) => state.setHeaderHeightA);
  const setActiveMobileTab = useUiStore((state) => state.setActiveMobileTab);

  useEffect(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight;
      setHeaderHeightA(height);
    }
  }, [setHeaderHeightA]);

  return (
    <Box
      ref={ref}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        bgcolor: "#202C33",
        // minHeight: 60,
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
      >
        Chats
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={() => setActiveMobileTab('friends')}
          sx={{
            display: { xs: "flex", md: "none" },
            color: "#AEBAC1",
          }}
        >
          <PeopleIcon />
        </IconButton>
      <IconButton
        onClick={onSearchClick}
        sx={{
          color: "#AEBAC1",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        <SearchIcon />
      </IconButton>
      </Box>
    </Box>
  );
};
