"use client";

import React from "react";
import { Box, IconButton, Avatar, Tooltip } from "@mui/material";
import { 
  MoreVert as MoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from "@mui/icons-material";

interface SidebarHeaderProps {
  onLogout: () => void;
  onNewChat: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onLogout, onNewChat }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        bgcolor: '#202C33',
        minHeight: 60,
      }}
    >
      {/* User Avatar */}
      <Avatar 
        sx={{ 
          width: 40, 
          height: 40,
          bgcolor: '#6B7C85',
          cursor: 'pointer',
        }}
        onClick={onLogout}
      />

      {/* Action Icons */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="New chat">
          <IconButton 
            onClick={onNewChat}
            sx={{ 
              color: '#AEBAC1',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Menu">
          <IconButton 
            sx={{ 
              color: '#AEBAC1',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            <MoreIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
