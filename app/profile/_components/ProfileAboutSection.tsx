"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";

interface ProfileAboutSectionProps {
  about: string;
  onSave: (about: string) => Promise<void>;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
}

export function ProfileAboutSection({
  about,
  onSave,
  textPrimary,
  textSecondary,
  inputBg,
}: ProfileAboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(about);

  const handleSave = async () => {
    await onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(about);
    setIsEditing(false);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography
        variant="caption"
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        ABOUT
      </Typography>
      {isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            multiline
            maxRows={3}
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
            {about}
          </Typography>
          <IconButton onClick={() => setIsEditing(true)} sx={{ color: textSecondary }}>
            <EditIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
