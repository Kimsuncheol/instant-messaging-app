"use client";

import React from "react";
import { 
  Box, 
  Typography, 
  RadioGroup, 
  FormControlLabel, 
  Radio 
} from "@mui/material";
import { 
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SettingsBrightness as SystemIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

interface SettingsAppearanceSectionProps {
  mode: "light" | "dark" | "system";
  setMode: (mode: "light" | "dark" | "system") => void;
  textPrimary: string;
  textSecondary: string;
  sectionTitle: string;
}

export const SettingsAppearanceSection: React.FC<SettingsAppearanceSectionProps> = ({
  mode,
  setMode,
  textPrimary,
  textSecondary,
  sectionTitle,
}) => {
  const t = useTranslations();

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography 
        variant="overline" 
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        {sectionTitle}
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
  );
};
