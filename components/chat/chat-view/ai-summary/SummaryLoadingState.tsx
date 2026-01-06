"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

export const SummaryLoadingState: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: "#00A884" }} />
      <Typography sx={{ color: "#8696A0" }}>
        Analyzing your messages...
      </Typography>
    </Box>
  );
};
