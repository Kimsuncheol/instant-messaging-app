"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
  headerBg: string;
}

export function ProfileHeader({ headerBg }: ProfileHeaderProps) {
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
        Profile
      </Typography>
    </Box>
  );
}
