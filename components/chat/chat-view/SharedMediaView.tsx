"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { MediaGallery } from "./MediaGallery";

interface SharedMediaViewProps {
  chatId: string;
  onBack: () => void;
}

export const SharedMediaView: React.FC<SharedMediaViewProps> = ({
  chatId,
  onBack,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#0B141A",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 2,
          bgcolor: "#202C33",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <IconButton onClick={onBack} sx={{ color: "#AEBAC1", mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
        >
          Shared Media
        </Typography>
      </Box>

      {/* Full Media Gallery */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <MediaGallery chatId={chatId} />
      </Box>
    </Box>
  );
};
