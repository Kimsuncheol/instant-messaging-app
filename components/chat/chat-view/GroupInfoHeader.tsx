"use client";

import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Chat } from "@/lib/chatService";

interface GroupInfoHeaderProps {
  chat: Chat;
}

export const GroupInfoHeader: React.FC<GroupInfoHeaderProps> = ({ chat }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        px: 2,
        bgcolor: "#202C33",
        borderBottom: "1px solid #2A3942",
      }}
    >
      <Avatar
        src={chat.groupPhotoURL}
        sx={{
          width: 80,
          height: 80,
          bgcolor: "#00A884",
          fontSize: "2rem",
          mb: 2,
        }}
      >
        {chat.groupName?.[0] || "G"}
      </Avatar>
      <Typography
        variant="h6"
        sx={{ color: "#E9EDEF", fontWeight: 500, mb: 0.5 }}
      >
        {chat.groupName || "Unnamed Group"}
      </Typography>
      {chat.groupDescription && (
        <Typography
          variant="body2"
          sx={{ color: "#8696A0", textAlign: "center" }}
        >
          {chat.groupDescription}
        </Typography>
      )}
    </Box>
  );
};
