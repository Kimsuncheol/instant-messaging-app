"use client";

import React from "react";
import { 
  Box, 
  Typography, 
  RadioGroup, 
  FormControlLabel, 
  Radio 
} from "@mui/material";
import { Language as LanguageIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";

interface SettingsLanguageSectionProps {
  locale: string;
  setLocale: (locale: any) => void;
  textPrimary: string;
  textSecondary: string;
  sectionTitle: string;
}

export const SettingsLanguageSection: React.FC<SettingsLanguageSectionProps> = ({
  locale,
  setLocale,
  textPrimary,
  textSecondary,
  sectionTitle,
}) => {
  const t = useTranslations();

  const economies = [
    { value: "en", label: t('locale.english') },
    { value: "ko", label: t('locale.korean') },
    { value: "es", label: t('locale.spanish') },
    { value: "fr", label: t('locale.french') },
    { value: "zh", label: t('locale.chinese') },
    { value: "ja", label: t('locale.japanese') },
    { value: "hi", label: t('locale.hindi') },
    { value: "de", label: t('locale.german') },
    { value: "it", label: t('locale.italian') },
    { value: "ru", label: t('locale.russian') },
  ];

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography 
        variant="overline" 
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem" }}
      >
        {sectionTitle}
      </Typography>
      <RadioGroup 
        value={locale} 
        onChange={(e) => setLocale(e.target.value as any)}
      >
        {economies.map((lang) => (
          <FormControlLabel 
            key={lang.value}
            value={lang.value} 
            control={<Radio sx={{ color: textSecondary, "&.Mui-checked": { color: "#00A884" } }} />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ color: textSecondary }} />
                <Typography sx={{ color: textPrimary }}>{lang.label}</Typography>
              </Box>
            }
          />
        ))}
      </RadioGroup>
    </Box>
  );
};
