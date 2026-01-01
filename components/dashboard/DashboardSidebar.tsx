"use client";

import React from "react";
import { Drawer, Divider } from "@mui/material";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarChatList } from "./SidebarChatList";
import { SidebarUserInfo } from "./SidebarUserInfo";
import { User } from "firebase/auth";

interface DashboardSidebarProps {
  user: User;
  onLogout: () => void;
  width: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ user, onLogout, width }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          bgcolor: 'background.paper',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      <SidebarHeader onLogout={onLogout} />
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
      <SidebarChatList />
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
      <SidebarUserInfo user={user} />
    </Drawer>
  );
};
