"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon, Phone as PhoneIcon } from "@mui/icons-material";

interface ProfileContactSectionProps {
  phoneNumber: string;
  onSave: (phoneNumber: string) => Promise<void>;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
}

export function ProfileContactSection({
  phoneNumber,
  onSave,
  textPrimary,
  textSecondary,
  inputBg,
}: ProfileContactSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(phoneNumber);

  const handleSave = async () => {
    await onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(phoneNumber);
    setIsEditing(false);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography
        variant="caption"
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        PHONE NUMBER
      </Typography>
      {isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            type="tel"
            placeholder="+1 234 567 8900"
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PhoneIcon sx={{ color: textSecondary, fontSize: 20 }} />
            <Typography sx={{ color: textPrimary, fontSize: "1rem" }}>
              {phoneNumber || "Not set"}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsEditing(true)} sx={{ color: textSecondary }}>
            <EditIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
