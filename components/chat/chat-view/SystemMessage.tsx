import React from "react";
import { Box, Typography } from "@mui/material";

interface SystemMessageProps {
  text: string;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ text }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        my: 1.5,
        px: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: "rgba(32, 44, 51, 0.8)", // Semi-transparent dark background like WhatsApp/Kakao
          borderRadius: 4,
          px: 1.5,
          py: 0.5,
          maxWidth: "85%",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#8696A0",
            fontSize: "0.75rem",
            textAlign: "center",
            display: "block",
          }}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  );
};
