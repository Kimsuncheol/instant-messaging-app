"use client";

import React from "react";
import { Box, TextField, Avatar, IconButton } from "@mui/material";
import { CameraAlt as CameraIcon } from "@mui/icons-material";

interface CreateGroupDetailsProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export const CreateGroupDetails: React.FC<CreateGroupDetailsProps> = ({
  name,
  onNameChange,
  description,
  onDescriptionChange,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Group Avatar */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#6B7C85",
              fontSize: "2rem",
            }}
          >
            {name?.[0]?.toUpperCase() || "G"}
          </Avatar>
          <IconButton
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              bgcolor: "#00A884",
              color: "#111B21",
              "&:hover": { bgcolor: "#00BF96" },
              width: 32,
              height: 32,
            }}
          >
            <CameraIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Group Name */}
      <TextField
        fullWidth
        placeholder="Group name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            bgcolor: "#202C33",
            borderRadius: "8px",
            "& fieldset": { border: "none" },
            "& input": {
              color: "#E9EDEF",
              fontSize: "1rem",
              py: 1.5,
              "&::placeholder": {
                color: "#8696A0",
                opacity: 1,
              },
            },
          },
        }}
      />

      {/* Group Description */}
      <TextField
        fullWidth
        placeholder="Group description (optional)"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        multiline
        rows={3}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#202C33",
            borderRadius: "8px",
            "& fieldset": { border: "none" },
            "& textarea": {
              color: "#E9EDEF",
              fontSize: "0.9375rem",
              "&::placeholder": {
                color: "#8696A0",
                opacity: 1,
              },
            },
          },
        }}
      />
    </Box>
  );
};
