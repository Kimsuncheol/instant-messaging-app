"use client";

import React from "react";
import { Box, Tabs, Tab } from "@mui/material";

export type FriendFilter = "all" | "favourites";

interface FriendFilterTabsProps {
  activeTab: FriendFilter;
  onTabChange: (tab: FriendFilter) => void;
}

export const FriendFilterTabs: React.FC<FriendFilterTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <Box sx={{ borderBottom: "1px solid #222D34", px: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        TabIndicatorProps={{
          sx: { bgcolor: "#00A884", height: 3 },
        }}
        sx={{
          minHeight: 48,
          "& .MuiTab-root": {
            color: "#8696A0",
            fontSize: "0.875rem",
            fontWeight: 500,
            textTransform: "none",
            minHeight: 48,
            "&.Mui-selected": {
              color: "#00A884",
            },
          },
        }}
      >
        <Tab label="All" value="all" />
        <Tab label="Favourites" value="favourites" />
      </Tabs>
    </Box>
  );
};
