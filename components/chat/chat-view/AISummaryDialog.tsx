"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Summarize as SummaryIcon,
} from "@mui/icons-material";
import { SummaryOutput } from "@/lib/ai";

import { SummaryLoadingState } from "./ai-summary/SummaryLoadingState";
import { SummaryResultView } from "./ai-summary/SummaryResultView";

interface AISummaryDialogProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  summary: SummaryOutput | null;
  error?: string;
  onRetry?: () => void;
}

export const AISummaryDialog: React.FC<AISummaryDialogProps> = ({
  open,
  onClose,
  loading,
  summary,
  error,
  onRetry,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          color: "#E9EDEF",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SummaryIcon sx={{ color: "#00A884" }} />
          <Typography fontWeight={600}>AI Summary</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {loading && <SummaryLoadingState />}

        {error && (
          <Box sx={{ bgcolor: "#F15C6D20", p: 2, borderRadius: 1 }}>
            <Typography sx={{ color: "#F15C6D" }}>{error}</Typography>
          </Box>
        )}

        {summary && !loading && <SummaryResultView summary={summary} />}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: "#AEBAC1" }}>
          Close
        </Button>
        {error && onRetry && (
          <Button
            onClick={onRetry}
            variant="contained"
            sx={{
              bgcolor: "#00A884",
              "&:hover": { bgcolor: "#008f6f" },
            }}
          >
            Retry
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
