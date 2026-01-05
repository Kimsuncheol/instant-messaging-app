"use client";

import React from "react";
import { Box, Divider, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { useLocale } from "@/context/LocaleContext";
import { useTranslations } from "next-intl";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Logout as LogoutIcon } from "@mui/icons-material";

// Refactored Components
import { SettingsHeader } from "./_components/SettingsHeader";
import { SettingsProfileSection } from "./_components/SettingsProfileSection";
import { SettingsAppearanceSection } from "./_components/SettingsAppearanceSection";
import { SettingsLanguageSection } from "./_components/SettingsLanguageSection";
import { SettingsOptionsList } from "./_components/SettingsOptionsList";
import { SettingsLocaleSection } from "./_components/SettingsLocaleSection";
import { SettingsCountrySection } from "./_components/SettingsCountrySection";

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: bgColor }}>
      <SettingsHeader 
        headerBg={headerBg} 
        title={t('settings.title')} 
      />

      <SettingsProfileSection 
        user={user} 
        isDark={isDark} 
        textPrimary={textPrimary} 
        textSecondary={textSecondary} 
      />
      
      <Divider sx={{ borderColor: dividerColor }} />

      <SettingsAppearanceSection 
        mode={mode} 
        setMode={setMode} 
        textPrimary={textPrimary} 
        textSecondary={textSecondary} 
        sectionTitle={t('settings.appearance')}
      />

      <Divider sx={{ borderColor: dividerColor }} />

      <SettingsCountrySection
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        sectionTitle="Location"
      />

      <Divider sx={{ borderColor: dividerColor }} />

      <SettingsLanguageSection 
        locale={locale} 
        setLocale={setLocale} 
        textPrimary={textPrimary} 
        textSecondary={textSecondary} 
        sectionTitle={t('settings.language')}
      />

      <Divider sx={{ borderColor: dividerColor }} />

      <SettingsLocaleSection
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        sectionTitle="Date & Time Format"
      />

      <Divider sx={{ borderColor: dividerColor }} />

      <SettingsOptionsList 
        textPrimary={textPrimary} 
        textSecondary={textSecondary} 
      />

      <Divider sx={{ borderColor: dividerColor }} />

      {/* Sign Out Button */}
      <Box sx={{ px: 3, py: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          sx={{
            color: "#F15C6D",
            borderColor: "#F15C6D",
            "&:hover": {
              borderColor: "#F15C6D",
              bgcolor: isDark ? "rgba(241, 92, 109, 0.1)" : "rgba(241, 92, 109, 0.05)",
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
}
