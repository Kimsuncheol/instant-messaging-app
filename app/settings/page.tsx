"use client";

import React from "react";
import { 
  Box,
  List,
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Avatar,
  Divider,
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
  Storage as StorageIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SettingsBrightness as SystemIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useLocale } from "@/context/LocaleContext";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, setMode, resolvedMode } = useTheme();
  const { locale, setLocale } = useLocale();
  const t = useTranslations();

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
          {t('settings.title')}
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
          {t('settings.appearance')}
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
                <Typography sx={{ color: textPrimary }}>{t('theme.light')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="dark" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DarkModeIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('theme.dark')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="system" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SystemIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('theme.system')}</Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      {/* Language Section */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography 
          variant="overline" 
          sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
        >
          {t('settings.language')}
        </Typography>
        <RadioGroup 
          value={locale} 
          onChange={(e) => setLocale(e.target.value as "en" | "ko" | "es" | "fr" | "zh" | "ja" | "hi" | "de" | "it" | "ru")}
        >
          <FormControlLabel 
            value="en" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.english')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="ko" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.korean')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="es" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.spanish')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="fr" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.french')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="zh" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.chinese')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="ja" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.japanese')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="hi" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.hindi')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="de" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.german')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="it" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.italian')}</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="ru" 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{t('locale.russian')}</Typography>
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
            primary={t('settings.notifications')}
            secondary={t('settingsDetails.notificationsDesc')}
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <PrivacyIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary={t('settings.privacy')}
            secondary={t('settingsDetails.privacyDesc')}
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SecurityIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary={t('settings.security')}
            secondary={t('settingsDetails.securityDesc')}
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <StorageIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary={t('settings.storage')}
            secondary={t('settingsDetails.storageDesc')}
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <HelpIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary={t('settings.help')}
            secondary={t('settingsDetails.helpDesc')}
            primaryTypographyProps={{ sx: { color: textPrimary } }}
            secondaryTypographyProps={{ sx: { color: textSecondary } }}
          />
        </ListItemButton>

        <ListItemButton sx={{ py: 1.5 }}>
          <ListItemIcon>
            <KeyboardIcon sx={{ color: textSecondary }} />
          </ListItemIcon>
          <ListItemText 
            primary={t('settings.keyboard')}
            primaryTypographyProps={{ sx: { color: textPrimary } }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}
