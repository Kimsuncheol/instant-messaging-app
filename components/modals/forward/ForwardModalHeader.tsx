"use client";

import React from "react";
import { DialogTitle, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ForwardModalHeaderProps {
  title: string;
  onClose: () => void;
}

export const ForwardModalHeader: React.FC<ForwardModalHeaderProps> = ({
  title,
  onClose,
}) => {
  return (
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "#202C33",
        py: 1.5,
      }}
    >
      <Typography sx={{ fontWeight: 500, color: "#E9EDEF" }}>
        {title}
      </Typography>
      <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
};
