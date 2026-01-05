"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import {
  ExitToApp as LeaveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface LeaveButtonProps {
  onClick: () => void;
  isGroup?: boolean;
}

export const LeaveButton: React.FC<LeaveButtonProps> = ({
  onClick,
  isGroup = false,
}) => {
  return (
    <Box sx={{ px: 2, py: 2, borderTop: "1px solid #2A3942" }}>
      <Button
        variant="outlined"
        startIcon={isGroup ? <LeaveIcon /> : <DeleteIcon />}
        fullWidth
        onClick={onClick}
        sx={{
          color: "#F15C6D",
          borderColor: "#F15C6D",
          "&:hover": {
            borderColor: "#d14a5a",
            bgcolor: "rgba(241, 92, 109, 0.08)",
          },
        }}
      >
        {isGroup ? "Leave Group" : "Delete Chat"}
      </Button>
    </Box>
  );
};
