"use client";

import React from "react";
import { Box } from "@mui/material";

export type TabFilter = "all" | "unread" | "groups";

interface ChatFilterTabsProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
}

export const ChatFilterTabs: React.FC<ChatFilterTabsProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
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
      <Box sx={getTabStyle("all")} onClick={() => onTabChange("all")}>
        All
      </Box>
      <Box sx={getTabStyle("unread")} onClick={() => onTabChange("unread")}>
        Unread
      </Box>
      <Box sx={getTabStyle("groups")} onClick={() => onTabChange("groups")}>
        Groups
      </Box>
    </Box>
  );
};
