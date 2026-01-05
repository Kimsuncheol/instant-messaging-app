"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

interface ChatSummaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: string | null;
  loading: boolean;
  error: string | null;
}

export const ChatSummaryModal: React.FC<ChatSummaryModalProps> = ({
  open,
  onClose,
  summary,
  loading,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Chat Summary
          </Typography>
          {loading && (
            <CircularProgress size={20} sx={{ color: "#00A884", ml: 1 }} />
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress sx={{ color: "#00A884", mb: 2 }} />
            <Typography sx={{ color: "#8696A0" }}>
              Generating summary...
            </Typography>
          </Box>
        ) : error ? (
          <Box
            sx={{
              bgcolor: "rgba(255,82,82,0.1)",
              border: "1px solid #FF5252",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography sx={{ color: "#FF5252" }}>{error}</Typography>
          </Box>
        ) : summary ? (
          <Box
            sx={{
              bgcolor: "#1F2C33",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography
              sx={{
                color: "#E9EDEF",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {summary}
            </Typography>
          </Box>
        ) : (
          <Typography sx={{ color: "#8696A0", textAlign: "center", py: 4 }}>
            No summary available
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid #2A3942",
          justifyContent: "center",
        }}
      >
        <Button
          onClick={handleCopy}
          disabled={!summary || loading}
          startIcon={copied ? <CheckIcon /> : <CopyIcon />}
          sx={{
            bgcolor: copied ? "#00A884" : "transparent",
            border: copied ? "none" : "1px solid #00A884",
            color: copied ? "#fff" : "#00A884",
            "&:hover": {
              bgcolor: copied ? "#008F72" : "rgba(0,168,132,0.1)",
            },
            "&:disabled": { borderColor: "#2A3942", color: "#6B7C85" },
            textTransform: "none",
            px: 4,
          }}
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </Button>
        <Button
          onClick={onClose}
          sx={{
            color: "#8696A0",
            "&:hover": { bgcolor: "rgba(134,150,160,0.1)" },
            textTransform: "none",
            px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
