"use client";

import React from "react";
import { Box } from "@mui/material";
import { useChatStore, TabFilter } from "@/store/chatStore";

interface ChatFilterTabsProps {
  // Props are now optional - component can work in controlled or uncontrolled mode
  activeTab?: TabFilter;
  onTabChange?: (tab: TabFilter) => void;
}

export const ChatFilterTabs: React.FC<ChatFilterTabsProps> = ({
  activeTab: controlledActiveTab,
  onTabChange: controlledOnTabChange,
}) => {
  // Use store state if not controlled by props
  const storeActiveTab = useChatStore((state) => state.activeTab);
  const setStoreActiveTab = useChatStore((state) => state.setActiveTab);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : storeActiveTab;

  const handleTabChange = (tab: TabFilter) => {
    // If controlled, call the callback
    if (controlledOnTabChange) {
      controlledOnTabChange(tab);
    }
    // Always update store for persistence
    setStoreActiveTab(tab);
  };

  const getTabStyle = (tab: TabFilter) => ({
    px: 2,
    py: 0.5,
    bgcolor: activeTab === tab ? "#00A884" : "#202C33",
    color: activeTab === tab ? "#111B21" : "#8696A0",
    borderRadius: "16px",
    fontSize: "0.8125rem",
    fontWeight: activeTab === tab ? 500 : 400,
    cursor: "pointer",
    "&:hover": activeTab === tab ? {} : { bgcolor: "#2A3942" },
  });

  return (
    <Box sx={{ px: 2, py: 1, display: "flex", gap: 1 }}>
      <Box sx={getTabStyle("all")} onClick={() => handleTabChange("all")}>
        All
      </Box>
      <Box sx={getTabStyle("unread")} onClick={() => handleTabChange("unread")}>
        Unread
      </Box>
      <Box sx={getTabStyle("groups")} onClick={() => handleTabChange("groups")}>
        Groups
      </Box>
      <Box
        sx={getTabStyle("favourites")}
        onClick={() => handleTabChange("favourites")}
      >
        Favourites
      </Box>
      <Box sx={getTabStyle("saved")} onClick={() => handleTabChange("saved")}>
        Saved
      </Box>
    </Box>
  );
};

// For backward compatibility, export the type
export type { TabFilter };
