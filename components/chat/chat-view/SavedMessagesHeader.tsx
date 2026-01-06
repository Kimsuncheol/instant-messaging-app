"use client";

import React from "react";
import { Box, Typography, IconButton, Tooltip, Badge } from "@mui/material";
import {
  ArrowBack as BackIcon,
  Folder as FolderIcon,
  Summarize as SummarizeIcon,
  AutoAwesome as GenerateIcon,
  CheckBox as SelectIcon,
  Close as CloseIcon,
  SelectAll as SelectAllIcon,
} from "@mui/icons-material";

interface SavedMessagesHeaderProps {
  chatroomName: string;
  onBack: () => void;
  onSummarize?: () => void;
  onGenerate?: () => void;
  selectionMode?: boolean;
  selectedCount?: number;
  totalCount?: number;
  onToggleSelectionMode?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

export const SavedMessagesHeader: React.FC<SavedMessagesHeaderProps> = ({
  chatroomName,
  onBack,
  onSummarize,
  onGenerate,
  selectionMode = false,
  selectedCount = 0,
  totalCount = 0,
  onToggleSelectionMode,
  onSelectAll,
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

      {/* Selection Mode UI */}
      {selectionMode ? (
        <>
          <Typography sx={{ color: "#00A884", fontSize: "0.875rem", mr: 1 }}>
            {selectedCount} of {totalCount} selected
          </Typography>
          <Tooltip title="Select All" arrow>
            <IconButton
              onClick={onSelectAll}
              sx={{ color: "#8696A0" }}
              size="small"
            >
              <SelectAllIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Summarize Selected" arrow>
            <span>
              <IconButton
                onClick={onSummarize}
                disabled={selectedCount === 0}
                sx={{
                  color: selectedCount > 0 ? "#00A884" : "#3B4A54",
                  "&:hover": { bgcolor: "rgba(0, 168, 132, 0.1)" },
                }}
              >
                <Badge badgeContent={selectedCount} color="primary" max={99}>
                  <SummarizeIcon />
                </Badge>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cancel Selection" arrow>
            <IconButton
              onClick={onToggleSelectionMode}
              sx={{ color: "#F15C6D" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          {/* Regular AI Actions */}
          <Tooltip title="Select for Summary" arrow>
            <IconButton
              onClick={onToggleSelectionMode}
              sx={{
                color: "#8696A0",
                "&:hover": { bgcolor: "rgba(134, 150, 160, 0.1)" },
              }}
            >
              <SelectIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="AI Summarize All" arrow>
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
        </>
      )}
    </Box>
  );
};
