"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, Close as CloseIcon } from "@mui/icons-material";

interface ConfirmPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  description?: string;
}

export const ConfirmPasswordModal: React.FC<ConfirmPasswordModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Password",
  description = "Please enter your password to continue.",
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to verify password");
      } else {
        setError("Failed to verify password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
        }
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ color: "#E9EDEF" }}>
          {title}
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: "#8696A0" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography sx={{ color: "#8696A0", mb: 2 }}>
            {description}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "#8696A0" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                "& fieldset": { borderColor: "#2A3942" },
                "& input": { color: "#E9EDEF" },
              },
              "& .MuiInputLabel-root": { color: "#8696A0" },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            sx={{ color: "#8696A0" }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#00A884",
              "&:hover": { bgcolor: "#008f70" },
              "&:disabled": { bgcolor: "#2A3942" },
            }}
          >
            {loading ? "Verifying..." : "Confirm"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
