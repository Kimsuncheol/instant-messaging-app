"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import { ExitToApp as LeaveIcon } from "@mui/icons-material";

interface LeaveGroupButtonProps {
  onClick: () => void;
}

export const LeaveGroupButton: React.FC<LeaveGroupButtonProps> = ({ onClick }) => {
  return (
    <Box sx={{ px: 2, py: 2, borderTop: "1px solid #2A3942" }}>
      <Button
        variant="outlined"
        startIcon={<LeaveIcon />}
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
        Leave Group
      </Button>
    </Box>
  );
};
