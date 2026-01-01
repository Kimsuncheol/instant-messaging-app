"use client";

import React from "react";
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Switch,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { 
  ArrowBack as BackIcon,
  Notifications as NotificationsIcon,
  Lock as PrivacyIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Storage as StorageIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SettingsBrightness as SystemIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, setMode, resolvedMode } = useTheme();

  if (loading) return <LoadingScreen />;
  if (!user) {
    router.push("/login");
    return null;
  }

  const isDark = resolvedMode === "dark";
  const bgColor = isDark ? "#111B21" : "#FFFFFF";
  const headerBg = isDark ? "#202C33" : "#008069";
  const textPrimary = isDark ? "#E9EDEF" : "#111B21";
  const textSecondary = isDark ? "#8696A0" : "#667781";
  const dividerColor = isDark ? "#2A3942" : "#E9EDEF";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor }}>
      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: headerBg,
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <IconButton onClick={() => router.back()} sx={{ color: "#FFFFFF" }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: "#FFFFFF", fontWeight: 500 }}>
          Settings
        </Typography>
      </Box>

      {/* Profile Section */}
      <ListItemButton 
        onClick={() => router.push("/profile")}
        sx={{ px: 3, py: 2 }}
      >
        <Avatar 
          src={user.photoURL || undefined}
          sx={{ width: 80, height: 80, bgcolor: isDark ? "#6B7C85" : "#DFE5E7" }}
        >
          {user.displayName?.[0]}
        </Avatar>
        <Box sx={{ ml: 2 }}>
          <Typography sx={{ color: textPrimary, fontSize: "1.1rem", fontWeight: 500 }}>
            {user.displayName || "User"}
          </Typography>
          <Typography sx={{ color: textSecondary, fontSize: "0.875rem" }}>
            {user.email}
          </Typography>
        </Box>
      </ListItemButton>
      
      <Divider sx={{ borderColor: dividerColor }} />

      {/* Theme Section */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
        >
          Appearance
        </Typography>
        <RadioGroup 
          value={mode} 
          onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}
        >
          <FormControlLabel 
            value="light" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LightModeIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>Light</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="dark" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DarkModeIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>Dark</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="system" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SystemIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>System default</Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      {/* Settings List */}
      <List sx={{ py: 0 }}>
        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <NotificationsIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Notifications"
            secondary="Message, group & call tones"
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <PrivacyIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Privacy"
            secondary="Block contacts, disappearing messages"
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SecurityIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Security"
            secondary="Security notifications, linked devices"
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <StorageIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Storage and data"
            secondary="Network usage, auto-download"
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <HelpIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Help"
            secondary="Help centre, contact us, privacy policy"
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <KeyboardIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Keyboard shortcuts"
            primaryTypographyProps={{ sx: { color: textPrimary } }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}
