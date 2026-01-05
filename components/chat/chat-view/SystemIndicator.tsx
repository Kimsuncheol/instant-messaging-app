import React from "react";
import { Typography, Box } from "@mui/material";

interface SystemIndicatorProps {
  text: string;
}

export const SystemIndicator: React.FC<SystemIndicatorProps> = ({ text }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        my: 1.5,
        px: 2,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "rgba(134, 150, 160, 0.8)", // Subdued gray text
          fontSize: "0.75rem",
          fontWeight: 500,
          textAlign: "center",
          backgroundColor: "#1F2C34", // Darker background pill
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};
