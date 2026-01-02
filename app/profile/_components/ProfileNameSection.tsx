"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";

interface ProfileNameSectionProps {
  displayName: string;
  onSave: (name: string) => Promise<void>;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
}

export function ProfileNameSection({
  displayName,
  onSave,
  textPrimary,
  textSecondary,
  inputBg,
}: ProfileNameSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);

  const handleSave = async () => {
    if (editValue.trim()) {
      await onSave(editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(displayName);
    setIsEditing(false);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography
        variant="caption"
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        YOUR NAME
      </Typography>
      {isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: inputBg,
                color: textPrimary,
              },
            }}
          />
          <IconButton onClick={handleSave} sx={{ color: "#00A884" }}>
            <CheckIcon />
          </IconButton>
          <IconButton onClick={handleCancel} sx={{ color: textSecondary }}>
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
          <Typography sx={{ color: textPrimary, fontSize: "1rem" }}>
            {displayName}
          </Typography>
          <IconButton onClick={() => setIsEditing(true)} sx={{ color: textSecondary }}>
            <EditIcon />
          </IconButton>
        </Box>
      )}
      <Typography
        variant="caption"
        sx={{ color: textSecondary, fontSize: "0.75rem", mt: 0.5, display: "block" }}
      >
        This name will be visible to your contacts.
      </Typography>
    </Box>
  );
}
