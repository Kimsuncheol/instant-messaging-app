"use client";

import React from "react";
import { IconButton } from "@mui/material";
import { 
  AttachFile as AttachIcon,
  Close as CloseIcon
} from "@mui/icons-material";

interface AttachmentTriggerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const AttachmentTriggerButton: React.FC<AttachmentTriggerButtonProps> = ({
  isOpen,
  onClick,
}) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label={isOpen ? "Close attachment panel" : "Open attachment panel"}
      aria-expanded={isOpen}
      sx={{
        color: isOpen ? "#00A884" : "#8696A0",
        transition: "transform 0.2s ease, color 0.2s ease",
        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.05)",
        },
      }}
    >
      {isOpen ? <CloseIcon /> : <AttachIcon />}
    </IconButton>
  );
};
