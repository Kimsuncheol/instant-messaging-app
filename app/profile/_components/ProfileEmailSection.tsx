"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

interface ProfileEmailSectionProps {
  email: string;
  textPrimary: string;
  textSecondary: string;
}

export function ProfileEmailSection({
  email,
  textPrimary,
  textSecondary,
}: ProfileEmailSectionProps) {
  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography
        variant="caption"
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        EMAIL
      </Typography>
      <Typography sx={{ color: textPrimary, fontSize: "1rem", mt: 1 }}>
        {email}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: textSecondary, fontSize: "0.75rem", mt: 0.5, display: "block" }}
      >
        This is your account email address.
      </Typography>
    </Box>
  );
}
