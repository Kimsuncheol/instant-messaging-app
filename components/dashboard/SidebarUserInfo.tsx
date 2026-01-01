"use client";

import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { User } from "firebase/auth";

interface SidebarUserInfoProps {
  user: User;
}

export const SidebarUserInfo: React.FC<SidebarUserInfoProps> = ({ user }) => {
  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar 
        src={user.photoURL || undefined} 
        sx={{ 
          width: 40, 
          height: 40, 
          border: '1px solid rgba(255, 255, 255, 0.1)' 
        }}
      >
        {user.displayName?.[0]}
      </Avatar>
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {user.displayName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {user.email}
        </Typography>
      </Box>
    </Box>
  );
};
