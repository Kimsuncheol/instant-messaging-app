"use client";

import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import {
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: User;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  anchorEl,
  onClose,
  onLogout,
}) => {
  const router = useRouter();

  const handleViewProfile = () => {
    router.push("/profile");
    onClose();
  };

  const handleSettings = () => {
    router.push("/settings");
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          bgcolor: "#233138",
          color: "#E9EDEF",
          minWidth: 250,
          mt: 1,
        },
      }}
    >
      {/* User Info Header */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user.photoURL || undefined}
            sx={{ width: 50, height: 50, bgcolor: "#00A884" }}
          >
            {user.displayName?.[0] || user.email?.[0]}
          </Avatar>
          <Box>
            <Typography sx={{ color: "#E9EDEF", fontWeight: 500 }}>
              {user.displayName || "User"}
            </Typography>
            <Typography sx={{ color: "#8696A0", fontSize: "0.875rem" }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: "#2A3942" }} />

      {/* Profile */}
      <MenuItem
        onClick={handleViewProfile}
        sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
      >
        <ListItemIcon>
          <ProfileIcon sx={{ color: "#AEBAC1" }} />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>

      <Divider sx={{ bgcolor: "#2A3942" }} />

      {/* Settings */}
      <MenuItem
        onClick={handleSettings}
        sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
      >
        <ListItemIcon>
          <SettingsIcon sx={{ color: "#AEBAC1" }} />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>

      <Divider sx={{ bgcolor: "#2A3942" }} />

      {/* Logout */}
      <MenuItem
        onClick={handleLogout}
        sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
      >
        <ListItemIcon>
          <LogoutIcon sx={{ color: "#F15C6D" }} />
        </ListItemIcon>
        <ListItemText sx={{ color: "#F15C6D" }}>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
};
