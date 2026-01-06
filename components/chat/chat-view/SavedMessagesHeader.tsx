"use client";

import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import {
  ArrowBack as BackIcon,
  Folder as FolderIcon,
  Summarize as SummarizeIcon,
  AutoAwesome as GenerateIcon,
} from "@mui/icons-material";

interface SavedMessagesHeaderProps {
  chatroomName: string;
  onBack: () => void;
  onSummarize?: () => void;
  onGenerate?: () => void;
}

export const SavedMessagesHeader: React.FC<SavedMessagesHeaderProps> = ({
  chatroomName,
  onBack,
  onSummarize,
  onGenerate,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 2,
        borderBottom: "1px solid #2A3942",
        bgcolor: "#202C33",
      }}
    >
      <IconButton onClick={onBack} sx={{ color: "#8696A0" }}>
        <BackIcon />
      </IconButton>
      <FolderIcon sx={{ color: "#FFA726" }} />
      <Typography
        variant="h6"
        sx={{
          color: "#E9EDEF",
          fontSize: "1.0625rem",
          fontWeight: 500,
          flex: 1,
        }}
      >
        {chatroomName}
      </Typography>

      {/* AI Actions */}
      <Tooltip title="AI Summarize" arrow>
        <IconButton
          onClick={onSummarize}
          sx={{
            color: "#00A884",
            "&:hover": { bgcolor: "rgba(0, 168, 132, 0.1)" },
          }}
        >
          <SummarizeIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="AI Generate" arrow>
        <IconButton
          onClick={onGenerate}
          sx={{
            color: "#FFA726",
            "&:hover": { bgcolor: "rgba(255, 167, 38, 0.1)" },
          }}
        >
          <GenerateIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
