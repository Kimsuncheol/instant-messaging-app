"use client";

import React from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AIIcon,
} from "@mui/icons-material";

interface MemoListHeaderProps {
  onBack: () => void;
  memoCount: number;
  onSummarizeAll: (event: React.MouseEvent<HTMLElement>) => void;
  selectionMode?: boolean;
  selectedCount?: number;
  onToggleSelectionMode?: () => void;
  onCancelSelection?: () => void;
  onSummarizeSelected?: () => void;
}

export const MemoListHeader: React.FC<MemoListHeaderProps> = ({
  onBack,
  memoCount,
  onSummarizeAll,
  selectionMode = false,
  selectedCount = 0,
  onToggleSelectionMode,
  onCancelSelection,
  onSummarizeSelected,
}) => {
  if (selectionMode) {
    // Selection mode header
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 2,
          bgcolor: "#182229",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <Typography sx={{ color: "#E9EDEF", fontSize: "0.9rem" }}>
          {selectedCount} selected
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={onCancelSelection}
            sx={{
              color: "#8696A0",
              textTransform: "none",
              fontSize: "0.875rem",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onSummarizeSelected}
            disabled={selectedCount === 0}
            sx={{
              bgcolor: "#7C4DFF",
              color: "#fff",
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": { bgcolor: "#6A3FE0" },
              "&:disabled": { bgcolor: "#2A3942", color: "#6B7C85" },
            }}
          >
            Summarize
          </Button>
        </Box>
      </Box>
    );
  }

  // Normal header
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 2,
        bgcolor: "#202C33",
        borderBottom: "1px solid #2A3942",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <IconButton onClick={onBack} sx={{ color: "#AEBAC1", mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
        >
          All Memos ({memoCount})
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        {/* AI summary trigger button */}
        {memoCount > 0 && (
          <IconButton
            onClick={onSummarizeAll}
            sx={{
              color: "#7C4DFF",
              "&:hover": { bgcolor: "rgba(124, 77, 255, 0.1)" },
            }}
            title="AI summary options"
          >
            <AIIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};
