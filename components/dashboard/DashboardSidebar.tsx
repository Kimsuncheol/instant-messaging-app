"use client";

import React from "react";
import { Drawer } from "@mui/material";
import { SidebarHeader } from "./SidebarHeader";
import { ChatList } from "@/components/chat/ChatList";
import { SidebarUserInfo } from "./SidebarUserInfo";
import { User } from "firebase/auth";

interface DashboardSidebarProps {
  user: User;
  onLogout: () => void;
  onNewChat: () => void;
  onAddFriend: () => void;
  onMarkAllAsRead: () => void;
  onCreateGroup: () => void;
  width: number;
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  user, 
  onLogout, 
  onNewChat,
  onAddFriend,
  onMarkAllAsRead,
  onCreateGroup,
  width,
  onSelectChat,
  selectedChatId
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          bgcolor: "#111B21",
          borderRight: "1px solid #2A3942",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <SidebarHeader 
        user={user}
        onLogout={onLogout} 
        onNewChat={onNewChat} 
        onAddFriend={onAddFriend} 
        onMarkAllAsRead={onMarkAllAsRead}
        onCreateGroup={onCreateGroup}
      />
      <ChatList onSelectChat={onSelectChat} selectedChatId={selectedChatId} />
      <SidebarUserInfo user={user} />
    </Drawer>
  );
};
