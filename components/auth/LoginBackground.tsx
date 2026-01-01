"use client";

import React from "react";
import { Box } from "@mui/material";

export const LoginBackground: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.1)",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(168, 85, 247, 0.1)",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
    </>
  );
};
