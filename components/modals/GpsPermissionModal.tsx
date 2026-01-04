"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
} from "@mui/material";
import { LocationOff } from "@mui/icons-material";

interface GpsPermissionModalProps {
  open: boolean;
  onClose: () => void;
  permissionDenied: boolean;
}

export const GpsPermissionModal: React.FC<GpsPermissionModalProps> = ({
  open,
  onClose,
  permissionDenied,
}) => {
  const theme = useTheme();

  const handleOpenSettings = () => {
    // Note: Browsers cannot directly open system settings.
    // We provide instructions or a best-effort approach.
    // For some mobile wrappers/PWAs, creating a specific intent might work, 
    // but for standard web, we can't do much.
    // We will simulate "opening settings" by alerting users for now, 
    // or arguably just close the modal so they can go do it manually.
    // However, the requirement asked for an "Open Settings" button.
    // We'll treat it as a "Close & Instructions" action.
    
    // In a real PWA or native wrapper, you'd use a bridge here.
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: 2,
          minWidth: 300,
          maxWidth: 400,
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent backdrop
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 3,
          pb: 1,
        }}
      >
        <LocationOff sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <DialogTitle sx={{ p: 0, mb: 1, fontWeight: 600 }}>
          {permissionDenied ? "Location Access Denied" : "GPS is Turned Off"}
        </DialogTitle>
      </Box>

      <DialogContent sx={{ textAlign: "center", pb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {permissionDenied
            ? "Please allow location access in your browser settings to share your location."
            : "Please enable location services on your device to proceed."}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleOpenSettings}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
            borderRadius: 2,
            mb: 1
          }}
        >
          Open Settings
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            borderRadius: 2,
            ml: "0 !important", // Override default margin-left from DialogActions
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
