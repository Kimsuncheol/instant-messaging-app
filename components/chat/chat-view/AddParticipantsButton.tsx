"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import { PersonAdd as AddIcon } from "@mui/icons-material";

interface AddParticipantsButtonProps {
  onClick: () => void;
}

export const AddParticipantsButton: React.FC<AddParticipantsButtonProps> = ({
  onClick,
}) => {
  return (
    <Box sx={{ px: 2, py: 2, borderTop: "1px solid #2A3942" }}>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        fullWidth
        onClick={onClick}
        sx={{
          color: "#00A884",
          borderColor: "#00A884",
          "&:hover": {
            borderColor: "#008f70",
            bgcolor: "rgba(0, 168, 132, 0.08)",
          },
        }}
      >
        Add Participants
      </Button>
    </Box>
  );
};
