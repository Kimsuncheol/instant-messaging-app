"use client";

import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface SettingsHeaderProps {
  headerBg: string;
  title: string;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ headerBg, title }) => {
  const router = useRouter();

  return (
    <Box 
      sx={{ 
        bgcolor: headerBg,
        px: 2,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      <IconButton onClick={() => router.back()} sx={{ color: "#FFFFFF" }}>
        <BackIcon />
      </IconButton>
      <Typography variant="h6" sx={{ color: "#FFFFFF", fontWeight: 500 }}>
        {title}
      </Typography>
    </Box>
  );
};
