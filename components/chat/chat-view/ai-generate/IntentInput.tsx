"use client";

import React from "react";
import { Box, Typography, TextField } from "@mui/material";

interface IntentInputProps {
  intent: string;
  setIntent: (value: string) => void;
}

export const IntentInput: React.FC<IntentInputProps> = ({
  intent,
  setIntent,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ color: "#8696A0", mb: 1.5, fontSize: "0.875rem" }}>
        Describe what kind of content you want to generate:
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="e.g., Write a follow-up thought on my previous notes..."
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#2A3942",
            color: "#E9EDEF",
            "& fieldset": { borderColor: "#3B4A54" },
            "&:hover fieldset": { borderColor: "#00A884" },
            "&.Mui-focused fieldset": { borderColor: "#00A884" },
          },
        }}
      />
    </Box>
  );
};
