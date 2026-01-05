"use client";

import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { Phone as PhoneIcon, Person as PersonIcon } from "@mui/icons-material";
import { ContactData } from "@/lib/chatService";

interface ContactMessageProps {
  contact: ContactData;
  onViewProfile?: () => void;
}

export const ContactMessage: React.FC<ContactMessageProps> = ({ contact, onViewProfile }) => {
  const { displayName, phoneNumber, photoURL } = contact;

  return (
    <Box
      sx={{
        width: 260,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#1F2C34",
      }}
    >
      {/* Contact Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          bgcolor: "#2A3942",
        }}
      >
        <Avatar
          src={photoURL}
          sx={{
            width: 50,
            height: 50,
            bgcolor: "#00A884",
          }}
        >
          {displayName?.[0]?.toUpperCase() || "?"}
        </Avatar>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#E9EDEF",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </Typography>
          {phoneNumber && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 14, color: "#8696A0" }} />
              <Typography variant="caption" sx={{ color: "#8696A0" }}>
                {phoneNumber}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Action Button */}
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          variant="text"
          startIcon={<PersonIcon />}
          onClick={onViewProfile}
          sx={{
            color: "#00A884",
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(0,168,132,0.1)" },
          }}
        >
          View Profile
        </Button>
      </Box>
    </Box>
  );
};
