"use client";

import React from "react";
import { Box, Avatar, Typography, ListItemButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/lib/userService";

interface SettingsProfileSectionProps {
  user: any; // Using any for now to match current implementation, should ideally be UserProfile
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
}

export const SettingsProfileSection: React.FC<SettingsProfileSectionProps> = ({ 
  user, 
  isDark, 
  textPrimary, 
  textSecondary 
}) => {
  const router = useRouter();

  return (
    <ListItemButton 
      onClick={() => router.push("/profile")}
      sx={{ px: 3, py: 2 }}
    >
      <Avatar 
        src={user?.photoURL || undefined}
        sx={{ width: 80, height: 80, bgcolor: isDark ? "#6B7C85" : "#DFE5E7" }}
      >
        {user?.displayName?.[0]}
      </Avatar>
      <Box sx={{ ml: 2 }}>
        <Typography sx={{ color: textPrimary, fontSize: "1.1rem", fontWeight: 500 }}>
          {user?.displayName || "User"}
        </Typography>
        <Typography sx={{ color: textSecondary, fontSize: "0.875rem" }}>
          {user?.email}
        </Typography>
      </Box>
    </ListItemButton>
  );
};
