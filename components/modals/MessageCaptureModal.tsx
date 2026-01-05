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
  Download as DownloadIcon,
  Share as ShareIcon,
  AutoAwesome as SummarizeIcon,
} from "@mui/icons-material";
import { downloadImage, shareImage } from "@/lib/captureService";

interface MessageCaptureModalProps {
  open: boolean;
  onClose: () => void;
  capturedImage: string | null;
  chatName: string;
  onGenerateSummary: () => void;
}

export const MessageCaptureModal: React.FC<MessageCaptureModalProps> = ({
  open,
  onClose,
  capturedImage,
  chatName,
  onGenerateSummary,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = async () => {
    if (!capturedImage) return;
    setDownloading(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      downloadImage(capturedImage, `${chatName}-${timestamp}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!capturedImage) return;
    setSharing(true);
    try {
      const success = await shareImage(capturedImage, `Chat with ${chatName}`);
      if (!success) {
        // Fallback to download if share not supported
        handleDownload();
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Captured Messages
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {capturedImage ? (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              maxHeight: "60vh",
              overflow: "auto",
            }}
          >
            <img
              src={capturedImage}
              alt="Captured messages"
              style={{
                maxWidth: "100%",
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              p: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress sx={{ color: "#00A884" }} />
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid #2A3942",
          display: "flex",
          gap: 1,
          justifyContent: "center",
        }}
      >
        <Button
          onClick={handleDownload}
          disabled={!capturedImage || downloading}
          startIcon={
            downloading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              <DownloadIcon />
            )
          }
          sx={{
            bgcolor: "#00A884",
            color: "#fff",
            "&:hover": { bgcolor: "#008F72" },
            "&:disabled": { bgcolor: "#2A3942", color: "#6B7C85" },
            textTransform: "none",
            px: 3,
          }}
        >
          Download
        </Button>

        <Button
          onClick={handleShare}
          disabled={!capturedImage || sharing}
          startIcon={
            sharing ? (
              <CircularProgress size={18} sx={{ color: "#00A884" }} />
            ) : (
              <ShareIcon />
            )
          }
          sx={{
            border: "1px solid #00A884",
            color: "#00A884",
            "&:hover": { bgcolor: "rgba(0,168,132,0.1)" },
            "&:disabled": { borderColor: "#2A3942", color: "#6B7C85" },
            textTransform: "none",
            px: 3,
          }}
        >
          Share
        </Button>

        <Button
          onClick={onGenerateSummary}
          disabled={!capturedImage}
          startIcon={<SummarizeIcon />}
          sx={{
            border: "1px solid #8696A0",
            color: "#E9EDEF",
            "&:hover": { bgcolor: "rgba(134,150,160,0.1)" },
            "&:disabled": { borderColor: "#2A3942", color: "#6B7C85" },
            textTransform: "none",
            px: 3,
          }}
        >
          Generate Summary
        </Button>
      </DialogActions>
    </Dialog>
  );
};
