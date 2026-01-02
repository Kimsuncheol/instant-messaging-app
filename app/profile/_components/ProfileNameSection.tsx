"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";

interface ProfileNameSectionProps {
  displayName: string;
  onSave?: (name: string) => void;
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
  const [value, setValue] = useState(displayName);

  const handleSave = () => {
    onSave?.(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(displayName);
    setIsEditing(false);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography
        variant="overline"
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        Your name
      </Typography>

      {isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: inputBg,
                "& input": { color: textPrimary },
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          <Typography sx={{ color: textPrimary, fontSize: "1rem" }}>
            {value}
          </Typography>
          <IconButton
            onClick={() => setIsEditing(true)}
            sx={{ color: textSecondary }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Typography sx={{ color: textSecondary, fontSize: "0.875rem", mt: 1 }}>
        This name will be visible to your contacts.
      </Typography>
    </Box>
  );
}
