"use client";

import React from "react";
import { 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
} from "@mui/material";
import { 
  Notifications as NotificationsIcon,
  Lock as PrivacyIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

interface SettingsOptionsListProps {
  textPrimary: string;
  textSecondary: string;
}

export const SettingsOptionsList: React.FC<SettingsOptionsListProps> = ({
  textPrimary,
  textSecondary,
}) => {
  const t = useTranslations();

  const options = [
    { 
      icon: <NotificationsIcon sx={{ color: textSecondary }} />, 
      primary: t('settings.notifications'), 
      secondary: t('settingsDetails.notificationsDesc') 
    },
    { 
      icon: <PrivacyIcon sx={{ color: textSecondary }} />, 
      primary: t('settings.privacy'), 
      secondary: t('settingsDetails.privacyDesc') 
    },
    { 
      icon: <SecurityIcon sx={{ color: textSecondary }} />, 
      primary: t('settings.security'), 
      secondary: t('settingsDetails.securityDesc') 
    },
    { 
      icon: <StorageIcon sx={{ color: textSecondary }} />, 
      primary: t('settings.storage'), 
      secondary: t('settingsDetails.storageDesc') 
    },
    { 
      icon: <HelpIcon sx={{ color: textSecondary }} />, 
      primary: t('settings.help'), 
      secondary: t('settingsDetails.helpDesc') 
    },
    { 
      icon: <KeyboardIcon sx={{ color: textSecondary }} />, 
      primary: t('settings.keyboard'), 
    },
  ];

  return (
    <List sx={{ py: 0 }}>
      {options.map((option, index) => (
        <ListItemButton key={index} sx={{ py: 1.5 }}>
          <ListItemIcon>
            {option.icon}
          </ListItemIcon>
          <ListItemText 
            primary={option.primary}
            secondary={option.secondary}
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>
      ))}
    </List>
  );
};
