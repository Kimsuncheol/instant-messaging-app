"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

interface TypingIndicatorProps {
  typingUsers: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
}) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 0.5,
        bgcolor: "#0B141A",
      }}
    >
      <Typography
        sx={{
          color: "#8696A0",
          fontSize: "0.75rem",
          fontStyle: "italic",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            gap: 0.3,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#8696A0",
                animation: "typing 1.4s infinite",
                animationDelay: `${i * 0.2}s`,
                "@keyframes typing": {
                  "0%, 60%, 100%": { opacity: 0.3 },
                  "30%": { opacity: 1 },
                },
              }}
            />
          ))}
        </Box>
        {getTypingText()}
      </Typography>
    </Box>
  );
};
