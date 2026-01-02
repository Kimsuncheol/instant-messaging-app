"use client";

import React from "react";
import { 
  Box, 
  Typography, 
  Select,
  MenuItem,
  FormControl,
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

  const languages = [
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
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem", mb: 1.5 }}
      >
        {sectionTitle}
      </Typography>
      <FormControl fullWidth>
        <Select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          sx={{
            bgcolor: textPrimary === "#E9EDEF" ? "#2A3942" : "#F0F2F5",
            color: textPrimary,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: textSecondary,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00A884",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00A884",
            },
            "& .MuiSvgIcon-root": {
              color: textSecondary,
            },
          }}
          startAdornment={
            <LanguageIcon sx={{ color: textSecondary, mr: 1 }} />
          }
        >
          {languages.map((lang) => (
            <MenuItem key={lang.value} value={lang.value}>
              <Typography sx={{ color: textPrimary }}>
                {lang.label}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
