"use client";

import React from "react";
import { Box } from "@mui/material";

export const LoginBackground: React.FC = () => {
  return (
    <>
      {/* WhatsApp-style top header bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "220px",
          bgcolor: "#00A884",
          zIndex: 0,
        }}
      />
      {/* Background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "#111B21",
          zIndex: 0,
        }}
      />
      {/* Overlay with subtle pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "220px",
          bgcolor: "#00A884",
          zIndex: 1,
        }}
      />
    </>
  );
};
