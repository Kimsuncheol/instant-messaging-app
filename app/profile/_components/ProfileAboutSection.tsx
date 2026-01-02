"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Check as CheckIcon } from "@mui/icons-material";

interface ProfileAboutSectionProps {
  about: string;
  onSave?: (about: string) => void;
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
  const [value, setValue] = useState(about);

  const handleSave = () => {
    onSave?.(value);
    setIsEditing(false);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography
        variant="overline"
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        About
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
    </Box>
  );
}
