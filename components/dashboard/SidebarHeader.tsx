"use client";

import React, { useState } from "react";
import { Box, IconButton, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Badge } from "@mui/material";
import { 
  MoreVert as MoreIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  DoneAll as DoneAllIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { User } from "firebase/auth";
import { UserMenu } from "./UserMenu";

interface SidebarHeaderProps {
  user?: User;
  onLogout: () => void;
  onNewChat: () => void;
  onAddFriend: () => void;
  onMarkAllAsRead: () => void;
  onCreateGroup: () => void;
  pendingFriendRequestCount?: number;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  user,
  onLogout, 
  onNewChat, 
  onAddFriend,
  onMarkAllAsRead,
  onCreateGroup,
  pendingFriendRequestCount = 0,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    handleMenuClose();
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

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
        src={user?.photoURL || undefined}
        sx={{ 
          width: 40, 
          height: 40,
          bgcolor: '#00A884',
          cursor: 'pointer',
          '&:hover': { opacity: 0.9 },
        }}
        onClick={handleAvatarClick}
      >
        {user?.displayName?.[0] || user?.email?.[0]}
      </Avatar>

      {/* User Menu */}
      {user && (
        <UserMenu
          user={user}
          anchorEl={userMenuAnchor}
          onClose={() => setUserMenuAnchor(null)}
          onLogout={onLogout}
        />
      )}

      {/* Action Icons */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Add friend">
          <IconButton 
            onClick={onAddFriend}
            sx={{ 
              color: '#AEBAC1',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            <Badge 
              badgeContent={pendingFriendRequestCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#00A884',
                  color: '#FFFFFF',
                  fontWeight: 600,
                },
              }}
            >
              <PersonAddIcon />
            </Badge>
          </IconButton>
        </Tooltip>
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
            onClick={handleMenuClick}
            sx={{ 
              color: '#AEBAC1',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            <MoreIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              bgcolor: '#233138',
              color: '#E9EDEF',
              minWidth: 200,
              '& .MuiMenuItem-root': {
                py: 1.5,
                '&:hover': {
                  bgcolor: '#182229',
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleMarkAllAsRead}>
            <ListItemIcon>
              <DoneAllIcon sx={{ color: '#00A884' }} />
            </ListItemIcon>
            <ListItemText>Mark all as read</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onCreateGroup(); handleMenuClose(); }}>
            <ListItemIcon>
              <GroupIcon sx={{ color: '#AEBAC1' }} />
            </ListItemIcon>
            <ListItemText>Create group</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};
