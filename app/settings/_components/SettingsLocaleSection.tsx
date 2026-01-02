"use client";

import React from "react";
import { 
  Box, 
  Typography, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { CalendarMonth as CalendarIcon, Schedule as TimeIcon } from "@mui/icons-material";
import { useDateFormat } from "@/context/DateFormatContext";
import { useTranslations } from "next-intl";

interface SettingsLocaleSectionProps {
  textPrimary: string;
  textSecondary: string;
  sectionTitle: string;
}

export const SettingsLocaleSection: React.FC<SettingsLocaleSectionProps> = ({
  textPrimary,
  textSecondary,
  sectionTitle,
}) => {
  const { dateFormat, timeFormat, setDateFormat, setTimeFormat, getIntlLocale } = useDateFormat();
  const t = useTranslations();
  
  // Show preview of current format
  const now = new Date();
  const intlLocale = getIntlLocale();
  
  const getDatePreview = () => {
    if (dateFormat === "locale") {
      return new Intl.DateTimeFormat(intlLocale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);
    }
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    switch (dateFormat) {
      case "MM/DD/YYYY": return `${month}/${day}/${year}`;
      case "DD/MM/YYYY": return `${day}/${month}/${year}`;
      case "YYYY-MM-DD": return `${year}-${month}-${day}`;
      default: return `${month}/${day}/${year}`;
    }
  };

  const getTimePreview = () => {
    if (timeFormat === "locale") {
      return new Intl.DateTimeFormat(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now);
    } else if (timeFormat === "24h") {
      return new Intl.DateTimeFormat(intlLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
    }
    return new Intl.DateTimeFormat(intlLocale, {
      hour: "2-digit",
      minute: "2-digit", 
      hour12: true,
    }).format(now);
  };

  const selectStyle = {
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
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography 
        variant="overline" 
        sx={{ color: "#00A884", fontWeight: 600, fontSize: "0.75rem", mb: 1 }}
      >
        {sectionTitle}
      </Typography>
      
      {/* Format Preview */}
      <Box sx={{ 
        mb: 2, 
        p: 1.5, 
        borderRadius: 1, 
        bgcolor: textPrimary === "#E9EDEF" ? "#1F2C34" : "#E8E8E8" 
      }}>
        <Typography variant="caption" sx={{ color: textSecondary }}>
          Current format preview:
        </Typography>
        <Typography sx={{ color: textPrimary, fontWeight: 500 }}>
          {getDatePreview()} • {getTimePreview()}
        </Typography>
      </Box>
      
      {/* Date Format Selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel sx={{ color: textSecondary }}>Date Format</InputLabel>
        <Select
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value as any)}
          label="Date Format"
          startAdornment={<CalendarIcon sx={{ color: textSecondary, mr: 1 }} />}
          sx={selectStyle}
        >
          <MenuItem value="locale">
            <Typography sx={{ color: textPrimary }}>Auto (based on language)</Typography>
          </MenuItem>
          <MenuItem value="MM/DD/YYYY">
            <Typography sx={{ color: textPrimary }}>MM/DD/YYYY</Typography>
          </MenuItem>
          <MenuItem value="DD/MM/YYYY">
            <Typography sx={{ color: textPrimary }}>DD/MM/YYYY</Typography>
          </MenuItem>
          <MenuItem value="YYYY-MM-DD">
            <Typography sx={{ color: textPrimary }}>YYYY-MM-DD (ISO)</Typography>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Time Format Selector */}
      <FormControl fullWidth>
        <InputLabel sx={{ color: textSecondary }}>Time Format</InputLabel>
        <Select
          value={timeFormat}
          onChange={(e) => setTimeFormat(e.target.value as any)}
          label="Time Format"
          startAdornment={<TimeIcon sx={{ color: textSecondary, mr: 1 }} />}
          sx={selectStyle}
        >
          <MenuItem value="locale">
            <Typography sx={{ color: textPrimary }}>Auto (based on language)</Typography>
          </MenuItem>
          <MenuItem value="12h">
            <Typography sx={{ color: textPrimary }}>12-hour (3:45 PM)</Typography>
          </MenuItem>
          <MenuItem value="24h">
            <Typography sx={{ color: textPrimary }}>24-hour (15:45)</Typography>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
