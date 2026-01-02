"use client";

import React, { useState } from "react";
import { Drawer, Tabs, Tab, Box } from "@mui/material";
import { Chat as ChatIcon, People as PeopleIcon } from "@mui/icons-material";
import { SidebarHeader } from "./SidebarHeader";
import { ChatList } from "@/components/chat/ChatList";
import { FriendsList } from "./FriendsList";
import { SidebarUserInfo } from "./SidebarUserInfo";
import { User } from "firebase/auth";

interface DashboardSidebarProps {
  user: User;
  onLogout: () => void;
  onNewChat: () => void;
  onAddFriend: () => void;
  onMarkAllAsRead: () => void;
  onCreateGroup: () => void;
  pendingFriendRequestCount?: number;
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
  pendingFriendRequestCount,
  width,
  onSelectChat,
  selectedChatId
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
        pendingFriendRequestCount={pendingFriendRequestCount}
      />
      
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          bgcolor: "#202C33",
          borderBottom: "1px solid #2A3942",
          minHeight: 48,
          "& .MuiTab-root": {
            color: "#8696A0",
            minHeight: 48,
            textTransform: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            "&.Mui-selected": {
              color: "#00A884",
            },
          },
          "& .MuiTabs-indicator": {
            bgcolor: "#00A884",
            height: 3,
          },
        }}
      >
        <Tab icon={<ChatIcon fontSize="small" />} label="Chats" iconPosition="start" />
        <Tab icon={<PeopleIcon fontSize="small" />} label="Friends" iconPosition="start" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeTab === 0 && (
          <ChatList onSelectChat={onSelectChat} selectedChatId={selectedChatId} />
        )}
        {activeTab === 1 && (
          <FriendsList onSelectChat={onSelectChat} onSwitchToChats={() => setActiveTab(0)} />
        )}
      </Box>

      <SidebarUserInfo user={user} />
    </Drawer>
  );
};
